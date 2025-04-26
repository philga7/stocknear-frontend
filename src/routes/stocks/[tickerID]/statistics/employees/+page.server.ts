import { redirect } from "@sveltejs/kit";

export const load = async ({ params}) => {
    redirect(303, `/stocks/${params.tickerID}/profile/employees/`);
};