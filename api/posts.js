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

postsRouter.post("/posts", requireUser, async (req, res, next) => {
  //where do we call this?? post i meant like endpoint would we change this to
  const { title, content, tags = "" } = req.body;
  const tagArr = tags.trim().split(/\s+/);
  const postData = {};

  // only send the tags if there are some to send
  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    // postData.authorId = authorId;
    postData.title = title;
    postData.content = content;
    //post data already exists
    // add authorId, title, content to postData object
    const post = await createPost(postData);
    // this will create the post and the tags for us
    // if the post comes back, res.send({ post });
    // if post comes back/fails(is how im interpreting), it wants us to res.send({post})
    //this one im alittle confused i think it wants us,
    if (post) {
      res.send({ post });
      //so if we get to here and this doesnt work
      //below should fire, if i understand this correctly
    } else {
      throw error;
      //maybe just throw error
    }
    //i think we are done with this function
    // otherwise, next an appropriate error object
  } catch ({ name, message }) {
    next({ name, message });
  }
});
module.exports = postsRouter;
