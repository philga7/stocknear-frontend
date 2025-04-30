import { redirect } from "@sveltejs/kit";

export const load = async ({ params, url }) => {
    const { tickerID } = params;
    
    if (!tickerID) {
        throw redirect(302, "/etf");
    }

    const lowerTicker = tickerID.toLowerCase();
    const pathname = url.pathname;

    // If tickerID is not lowercase, redirect to the lowercase version
    if (tickerID !== lowerTicker) {
        const updatedPath = pathname.replace(tickerID, lowerTicker);
        throw redirect(301, updatedPath);
    }

    // No redirect needed
    return {};
};
