

export const load = ({ locals, cookies }) => {
  const { user, isUSRegion, wsURL, themeMode } = locals;

  return {
    user: user || undefined,
    isUSRegion,
    cookieConsent: cookies.get("cookie-consent"),
    wsURL,
    themeMode // Add theme mode to returned data
  };
};