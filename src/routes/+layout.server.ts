export const ssr = true;


export const load = ({ locals, cookies }) => {
  const { user, isUSRegion, wsURL } = locals;
  const themeMode = cookies.get("theme-mode") || "dark"; // Default to dark

  return {
    user: user || undefined,
    isUSRegion,
    cookieConsent: cookies.get("cookie-consent"),
    wsURL,
    themeMode // Add theme mode to returned data
  };
};