export const load = ({ locals, cookies }) => {
  const { user, isUSRegion, wsURL } = locals;

  return {
    user: user || undefined,
    isUSRegion,
    cookieConsent: cookies?.get("cookie-consent"),
    themeMode: cookies?.get("theme-mode"),
    wsURL,
  };
};
