<<<<<<< HEAD
// inside db/index.js
const { Client } = require("pg"); // imports the pg module

// supply the db name and location of the database
const client = new Client("postgres://localhost:5432/juicebox-dev");

module.exports = {
  client,
};
// inside db/index.js

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username 
      FROM users;
    `
  );

  return rows;
}

// and export them
module.exports = {
  client,
  getAllUsers,
};
=======
const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/juicebox-dev');

module.exports = {
    client,
  }
>>>>>>> 53e09aece533c976bec5efe59409532a70c9e8f7
