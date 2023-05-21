// api/users.js
const express = require("express");
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require("../db");

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});
//we know that api/posts exists
//we know we can login
//there is somewhere that needs an id, if i had to guess it would be DB end

tagsRouter.get('/', async ( req, res) => {
    const tags = await getAllTags();

    res.send({
      tags
    });
  });

  tagsRouter.get("/:tagName/posts", async (req, res, next) => {
    console.log("a request to /tag/:tagid/posts ");
    console.log("req.params", req.params);
    const tag = decodeURIComponent(req.params.tagName);
  
    try {
      console.log(tag);
      posts = await getPostsByTagName(tag);
      console.log("posts after await", posts);
      res.status(200).send(posts);
      // use our method to get posts by tag name from the db
      // send out an object to the client { posts: // the posts }
    } catch ({ name, message }) {
      next(name, message);
    }
  });

(module.exports = tagsRouter), getAllTags;
