// api/index.js
require("dotenv").config();

// api/index.js
// Before we start attaching our routers
const jwt = require('jsonwebtoken');
const { getUserById, getUserByUsername } = require("../db");
const { JWT_SECRET } = process.env;
const express = require("express");
const apiRouter = express.Router();

apiRouter.use((req, res, next) => {
  console.log("-----A REQUEST HAS BEEN MADE TO /API-----");
  next();
});

// Attach routers below here
apiRouter.use(async (req, res, next) => {
  console.log("In the Middleware");
  const prefix = "Bearer ";
  const auth = req.header("Authorization");

  apiRouter.use((req, res, next) => {
    if (req.user) {
      console.log("User is set:", req.user);
      // const token = jwt.sign({ users }, process.env.JWT_SECRET);
    }

    next();
  });

  if (!auth) {
    // nothing to see here
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      //id was undefined so I added jsonwebtoken library to deserialize the auth token
      //then letting me get id from it. Once the exception stopped happening and we got id for the user
      //things worked just fine
      const id = jwt.verify(token, JWT_SECRET).user.id;

      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

const usersRouter = require("./users");
apiRouter.use("/users", usersRouter);
const postsRouter = require("./posts");
apiRouter.use("/posts", postsRouter);
const tagsRouter = require("./tags");
apiRouter.use("/tags", tagsRouter);

apiRouter.use((error, req, res, next) => {
  res.send({
    name: error.name,
    message: error.message,
  });
});
//no env set up my b

module.exports = apiRouter;
//newest ff is 16 and thats coming out at somepoint
//ff14 is a mmo thats really good
