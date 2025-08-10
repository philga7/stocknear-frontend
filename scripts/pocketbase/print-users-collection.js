import PocketBase from "pocketbase";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://localhost:8090";
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Missing POCKETBASE_ADMIN_EMAIL/POCKETBASE_ADMIN_PASSWORD");
  process.exit(1);
}

async function main() {
  const pb = new PocketBase(POCKETBASE_URL);
  await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
  const users = await pb.collections.getOne("users");
  console.log(JSON.stringify(users, null, 2));
}

main().catch((e) => {
  console.error(e?.response || e?.message || e);
  process.exit(1);
});


