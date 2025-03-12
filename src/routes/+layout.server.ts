	import {  setMode,  } from "mode-watcher";


export const load = ({ locals, cookies }) => {
  const { user, isUSRegion, wsURL } = locals;

  setMode(cookies?.get("theme-mode"));

  return {
    user: user || undefined,
    isUSRegion,
    cookieConsent: cookies?.get("cookie-consent"),
    wsURL,
  };
};
