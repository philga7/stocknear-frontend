import { convertToSlug } from "$lib/utils";

export const load = async ({ locals, params }) => {
  const { pb } = locals;

  const getArticle = async () => {
    // Make the POST request to the endpoint
    const output = await pb.collection("tutorials").getFullList({
      sort: "-created",
    });


    // Find the matching article based on params.slug
    const matchingArticle = output?.find(
      (article) => convertToSlug(article?.title) === params?.slug
    );

    return matchingArticle;
  };

  // Make sure to return a promise
  return {
    getArticle: await getArticle(),
  };
};
