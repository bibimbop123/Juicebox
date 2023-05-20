// api/users.js
const express = require("express");
const postsRouter = express.Router();
const { getAllPosts, createPost, getPostById } = require("../db");
const { requireUser } = require("./utils");

postsRouter.use((req, res, next) => {
 console.log("A request is being made to /posts");

 next(); // THIS IS DIFFERENT
});

postsRouter.get("/", async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    posts,
  });
});

postsRouter.post("/", requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;
  const tagArr = tags.trim().split(/\s+/);
  const postData = {};
  // only send the tags if there are some to send
  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    postData.title = title;
    postData.authorId = req.user.id;
    postData.content = content;
    console.log("XXXXXXXXXXXpostdata is: ", postData);

    const post = await createPost(postData);
    console.log("THIS IS OUR POST: ", post);
    // this will create the post and the tags for us
    if (post) {
      res.send({ post });
    } else {
      next(error);
    }
    //what would be the question then thats the problem, there is something somewhere asking for an id
    // if the post comes back, res.send({ post });
    // otherwise, next an appropriate error object
  } catch ({ name, message }) {
    next({ name, message });
  }
}); //what you mean we doing it twice? the post already exists

postsRouter.patch("/:postId", requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost });
    } else {
      next({
        name: "UnauthorizedUserError",
        message: "You cannot update a post that is not yours",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = postsRouter;
