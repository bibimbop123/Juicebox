// api/users.js
const express = require('express');
const tagsRouter = express.Router();
const { getAllTags } = require('../db');

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});


tagsRouter.get('/', async ( req, res) => {
    const tags = await getAllTags();
  
    res.send({
      tags
    });
  });

  function errorHandler (err, req, res, next) {
    if (res.headersSent) {
      return next(err)
    }
    res.status(500)
    res.render('error', { error: err })
  }
module.exports = tagsRouter, getAllTags;