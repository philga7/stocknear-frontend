/*
 Idempotently ensure PocketBase `users` collection has fields:
 - tier: text, default "free", max length 32, not required
 - credits: number (integer), default 0, min 0, not required

 Usage:
   POCKETBASE_URL=http://localhost:8090 \
   POCKETBASE_ADMIN_EMAIL=admin@stocknear.com \
   POCKETBASE_ADMIN_PASSWORD=admin123 \
   node scripts/pocketbase/ensure-users-tier-credits.js [--dry-run]

 Notes:
 - Reads credentials from env only.
 - Safe to run multiple times.
*/

import PocketBase from "pocketbase";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://localhost:8090";
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;
const DRY_RUN = process.argv.includes("--dry-run");

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "Missing admin credentials. Set POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD."
  );
  process.exit(1);
}

/**
 * Create desired field definitions following PocketBase schema format.
 * Some options defaults are set conservatively to avoid breaking changes.
 */
function desiredFields(existingTier, existingCredits) {
  const tierField = {
    name: "tier",
    type: "text",
    hidden: false,
    required: false,
    presentable: false,
    system: false,
    min: 0,
    max: 32,
    pattern: "",
  };

  const creditsField = {
    name: "credits",
    type: "number",
    hidden: false,
    required: false,
    presentable: false,
    system: false,
    min: 0,
    max: 0,
    onlyInt: true,
  };

  // If existing fields are found, preserve some attributes
  if (existingTier) {
    tierField.id = existingTier.id;
    tierField.hidden = existingTier.hidden ?? tierField.hidden;
    tierField.required = existingTier.required ?? tierField.required;
    tierField.presentable = existingTier.presentable ?? tierField.presentable;
    tierField.system = existingTier.system ?? tierField.system;
    tierField.min = existingTier.min ?? tierField.min;
    tierField.max = existingTier.max ?? tierField.max;
    tierField.pattern = existingTier.pattern ?? tierField.pattern;
  }

  if (existingCredits) {
    creditsField.id = existingCredits.id;
    creditsField.hidden = existingCredits.hidden ?? creditsField.hidden;
    creditsField.required = existingCredits.required ?? creditsField.required;
    creditsField.presentable = existingCredits.presentable ?? creditsField.presentable;
    creditsField.system = existingCredits.system ?? creditsField.system;
    creditsField.min = existingCredits.min ?? creditsField.min;
    creditsField.max = existingCredits.max ?? creditsField.max;
    creditsField.onlyInt = existingCredits.onlyInt ?? creditsField.onlyInt;
  }

  return { tierField, creditsField };
}

function makeDiff(oldField, newField) {
  if (!oldField) return { action: "add", field: newField.name, changes: newField };
  const changes = {};
  for (const key of [
    "type",
    "hidden",
    "required",
    "presentable",
    "system",
    "min",
    "max",
    "pattern",
    "onlyInt",
  ]) {
    if (oldField[key] !== newField[key]) changes[key] = [oldField[key], newField[key]];
  }
  if (Object.keys(changes).length === 0) return null;
  return { action: "update", field: newField.name, changes };
}

async function main() {
  const pb = new PocketBase(POCKETBASE_URL);

  await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);

  const users = await pb.collections.getOne("users");
  const schema = users.fields || users.schema || [];

  const existingTier = schema.find((f) => f.name === "tier");
  const existingCredits = schema.find((f) => f.name === "credits");

  const { tierField, creditsField } = desiredFields(existingTier, existingCredits);

  const nextSchema = [...schema];

  let changed = false;
  const diffs = [];

  if (!existingTier) {
    nextSchema.push(tierField);
    diffs.push({ action: "add", field: "tier" });
    changed = true;
  } else {
    const diff = makeDiff(existingTier, tierField);
    if (diff) {
      const idx = nextSchema.findIndex((f) => f.name === "tier");
      nextSchema[idx] = { ...existingTier, ...tierField };
      diffs.push(diff);
      changed = true;
    }
  }

  if (!existingCredits) {
    nextSchema.push(creditsField);
    diffs.push({ action: "add", field: "credits" });
    changed = true;
  } else {
    const diff = makeDiff(existingCredits, creditsField);
    if (diff) {
      const idx = nextSchema.findIndex((f) => f.name === "credits");
      nextSchema[idx] = { ...existingCredits, ...creditsField };
      diffs.push(diff);
      changed = true;
    }
  }

  if (!changed) {
    console.log("No changes required. Schema already compliant.");
    return;
  }

  if (DRY_RUN) {
    console.log("--dry-run: planned schema changes:");
    console.log(JSON.stringify(diffs, null, 2));
    return;
  }

  // Apply update
  // Try with fields property (PocketBase >=0.26). Fallback to schema if needed.
  try {
    await pb.collections.update(users.id, { fields: nextSchema });
  } catch (e) {
    await pb.collections.update(users.id, { schema: nextSchema });
  }

  // Verify
  const refetched = await pb.collections.getOne("users");
  const names = (refetched.fields || refetched.schema || []).map((f) => f.name);
  if (!names.includes("tier") || !names.includes("credits")) {
    throw new Error("Verification failed: fields not present after update");
  }

  console.log("Schema updated successfully.");
  console.log(JSON.stringify(diffs, null, 2));
}

main().catch((err) => {
  console.error("Error:", err?.response || err?.message || err);
  process.exit(1);
});


