
export const load = async ({locals}) => {
    const { pb } = locals;

    const getBlogPosts = async () => {


      // make the POST request to the endpoint
      const output = await pb.collection("articles").getFullList({
        sort: "-created",
      }) || [];

    return output;
  };

      const getTutorialPost = async () => {


      // make the POST request to the endpoint
      const output = await pb.collection("tutorials").getFullList({
        sort: "-created",
      }) || [];

    return output;
  };

  // Make sure to return a promise
  return {
    getBlogPosts: await getBlogPosts(),
    getTutorialPost: await getTutorialPost(),
  };
};