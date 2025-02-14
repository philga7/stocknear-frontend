
export const load = async ({locals}) => {
    const { pb } = locals;

    const getAllBlogPost = async () => {


      // make the POST request to the endpoint
      const output = await pb.collection("articles").getFullList({
        sort: "-created",
        filter: "category='blog'"
      });

    return output;
  };

  
  // Make sure to return a promise
  return {
    getAllBlogPost: await getAllBlogPost(),
  };
};