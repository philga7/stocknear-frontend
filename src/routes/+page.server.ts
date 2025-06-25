import { error, fail, redirect } from "@sveltejs/kit";
import { allCards} from "$lib/utils";

/// Constants
const CACHE_DURATION = 60 * 1000; // 60 seconds
const REQUEST_TIMEOUT = 5000;

// LRU Cache implementation
class LRUCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    const { data, timestamp } = entry;
    if (Date.now() - timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    // Refresh order
    this.cache.delete(key);
    this.cache.set(key, entry);
    return data;
  }

  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

const dashboardCache = new LRUCache();

// Fetch with timeout
async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}


function pickRandomCards(cards, userTier, count = 6) {
  // Identify the “Unlimited Access” card
  const unlimitedCard = cards?.find(c => c.label === 'Unlimited Access');
  // Pool excluding unlimited
  const withoutUnlimited = cards?.filter(c => c !== unlimitedCard);

  // If user is Plus or Pro, we never include Unlimited
  if (['Plus', 'Pro']?.includes(userTier)) {
    // just pick from the reduced pool
    const shuffled = [...withoutUnlimited]?.sort(() => 0.5 - Math.random());
    return shuffled?.slice(0, count);
  }

  // Otherwise, we *must* include Unlimited at the end.
  // Pick the other (count - 1) cards at random:
  const shuffled = [...withoutUnlimited]?.sort(() => 0.5 - Math.random());
  const picks = shuffled?.slice(0, count - 1);

  // Append the Unlimited card last
  picks?.push(unlimitedCard);
  return picks;
}



// Load function
export async function load({ locals }) {
  const { apiKey, apiURL, user } = locals;
  const cacheKey = `dashboard:${apiKey}`;

  // Check cache
  let dashboardData = dashboardCache.get(cacheKey);

  if (!dashboardData) {
    try {
      dashboardData = await fetchWithTimeout(
        `${apiURL}/dashboard-info`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': apiKey
          },
        }
      );
      dashboardCache.set(cacheKey, dashboardData);
    } catch (err) {
      console.error('Dashboard fetch error', err);
      dashboardData = {}; // or `throw error(500, 'Dashboard fetch failed')` if you want to fail
    }
  }

  return {
    getDashboard: dashboardData,
    selectedCards: pickRandomCards(allCards, user?.tier)
  };
}


async function checkDisposableEmail(email) {
  const url = `https://disposable.debounce.io/?email=${encodeURIComponent(email)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const output = (await response.json())?.disposable ?? false;
  return output;
}

export const actions = {
  login: async ({ request, locals }) => {
    const { formData, errors } = await validateData(
      await request.formData(),
      loginUserSchema,
    );

    if (errors) {
      return fail(400, {
        data: formData,
        errors: errors.fieldErrors,
      });
    }

    try {
      await locals.pb
        .collection("users")
        .authWithPassword(formData.email, formData.password);

      /*	
			if (!locals.pb?.authStore?.model?.verified) {
				locals.pb.authStore.clear();
				return {
					notVerified: true,
				};
			}
			*/
    } catch (err) {
      console.log("Error: ", err);
      error(err.status, err.message);
    }

    redirect(301, "/pricing");
  },

  register: async ({ locals, request }) => {
    const { formData, errors } = await validateData(
      await request.formData(),
      registerUserSchema,
    );
    if (errors) {
      return fail(400, {
        data: formData,
        errors: errors.fieldErrors,
      });
    }
    const isEmailDisposable = await checkDisposableEmail(formData?.email);

    if (isEmailDisposable === "true") {
      error(400, "Disposable Email Addresses not allowed!");
    }

    //let username = generateUsername(formData.name.split(' ').join('')).toLowerCase();

    try {
      await locals.pb.collection("users").create(formData);
      /*
		await locals.pb?.collection('users').update(
						newUser?.id, {
							'freeTrial' : true,
							'tier': 'Pro', //Give new users a free trial for the Pro Subscription
					});
		*/

      await locals.pb.collection("users").requestVerification(formData.email);
    } catch (err) {
      console.log("Error: ", err);
      error(err.status, err.message);
    }

    try {
      await locals.pb
        .collection("users")
        .authWithPassword(formData.email, formData.password);

      /*
			if (!locals.pb?.authStore?.model?.verified) {
				locals.pb.authStore.clear();
				return {
					notVerified: true,
				};
			}
			*/
    } catch (err) {
      console.log("Error: ", err);
      error(err.status, err.message);
    }

    redirect(301, "/pricing");
  },

  oauth2: async ({ url, locals, request, cookies }) => {
    const authMethods = (await locals?.pb
      ?.collection("users")
      ?.listAuthMethods())?.oauth2;


    const data = await request?.formData();
    const providerSelected = data?.get("provider");

    if (!authMethods) {
      return {
        authProviderRedirect: "",
        authProviderState: "",
      };
    }
    const redirectURL = `${url.origin}/oauth`;

    const targetItem = authMethods?.providers?.findIndex(
      (item) => item?.name === providerSelected,
    );
    //console.log("==================")
    //console.log(authMethods.authProviders)
    //console.log('target item is: ', targetItem)

    const provider = authMethods.providers[targetItem];
    const authProviderRedirect = `${provider.authUrl}${redirectURL}`;
    const state = provider.state;
    const verifier = provider.codeVerifier;

    
    
    cookies.set("state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60,
    });

    cookies.set("verifier", verifier, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60,
    });

    cookies.set("provider", providerSelected, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60,
    });

    cookies.set("path", "/", {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60,
    });

    redirect(302, authProviderRedirect);
  },
};




