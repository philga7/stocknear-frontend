import { error, fail, redirect } from "@sveltejs/kit";
import { validateData } from "$lib/utils";
import { loginUserSchema, registerUserSchema } from "$lib/schemas";


// Constants
const CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds
const REQUEST_TIMEOUT = 5000;

// LRU Cache implementation with automatic cleanup
class LRUCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp >= CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
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

// Optimized fetch function with AbortController and timeout
const fetchWithTimeout = async (url, options, timeout) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

// Dashboard data fetching function with caching
const getDashboard = async (apiURL, apiKey) => {
  const cacheKey = 'dashboard-info';
  const cachedData = dashboardCache.get(cacheKey);
  if (cachedData) return cachedData;

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey
    }
  };

  try {
    const data = await fetchWithTimeout(
      `${apiURL}/dashboard-info`,
      options,
      REQUEST_TIMEOUT
    );
    dashboardCache.set(cacheKey, data);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Dashboard request timeout');
    }
    console.error('Error fetching dashboard:', error);
    return {};
  }
};



// Main load function
export const load = async ({ locals, cookies}) => {
  const { apiKey, apiURL } = locals;
  const defaultSettings =  [
           'gainers',
            'losers',
            'wiim',
            'analystReport',
            'upcomingEarnings',
            'recentEarnings'
          ];

  const getCustomSettings = async () => {
    let output = []
    try {
        output = JSON?.parse(cookies?.get("custom-dashboard-widget")) ?? [];
        output = output?.map(item => item?.id);
    } catch(e) {
      output = []
    }
   
     if(output?.length === 0) {
        output = defaultSettings
       }
       return output;
  };


  try {
    return {
      getDashboard: await getDashboard(apiURL, apiKey),
      getCustomSettings: await getCustomSettings(),
    };
  } catch (error) {
    console.error('Error in dashboard load:', error);
    return {
      getDashboard: {},
      getCustomSettings: defaultSettings,
    };
  }
};


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

