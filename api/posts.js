// api/users.js
const express = require("express");
const postsRouter = express.Router();
const { getAllPosts } = require("../db");
const { requireUser } = require("./utils");

postsRouter.post("/", requireUser, async (req, res, next) => {
  res.send({ message: "under construction" });
});

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next(); // THIS IS DIFFERENT
});

postsRouter.get("/", async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    posts,
  });
});

const { requireUser } = require("./utils");

postsRouter.post("/", requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;

  const tagArr = tags.trim().split(/\s+/);
  const postData = { authorId, title, content };

  // only send the tags if there are some to send
  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    const post = await createPost(postData);
    // this will create the post and the tags for us
    if (post) {
      res.send({ post });
    } else {
      next(error);
    }
    // if the post comes back, res.send({ post });
    // otherwise, next an appropriate error object
  } catch ({ name, message }) {
    next({ name, message });
  }
});
module.exports = postsRouter;
