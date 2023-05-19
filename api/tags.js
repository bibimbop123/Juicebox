// api/users.js
const express = require("express");
const tagsRouter = express.Router();
const { getAllTags } = require("../db");

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});
//we know that api/posts exists
//we know we can login
//there is somewhere that needs an id, if i had to guess it would be DB end

// tagsRouter.get('/', async ( req, res) => {
//     const tags = await getAllTags();

//     res.send({
//       tags
//     });
//   });

(module.exports = tagsRouter), getAllTags;
