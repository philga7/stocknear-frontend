
export const load = async ({locals}) => {
    const { pb } = locals;

    const getAllBlogPost = async () => {


      // make the POST request to the endpoint
      const output = await pb.collection("tutorials").getFullList({
        sort: "-updated",
      });

    return output;
  };

  // Make sure to return a promise
  return {
    getAllBlogPost: await getAllBlogPost(),
  };
};