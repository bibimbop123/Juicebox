const { Client } = require("pg");

const client = new Client("postgres://localhost:5432/juicebox-dev");

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username 
      FROM users;
    `
  );

  return rows;
}
async function createUser({ username, password, name, location }) {
  try {
    const { rows } = await client.query(
      `
        INSERT INTO users(username, password, name, location) 
        VALUES($1, $2, $3, $4) 
        ON CONFLICT (username) DO NOTHING 
        RETURNING *;
      `,
      [username, password, name, location]
    );

    return { rows };
  } catch (error) {
    throw error;
  }
}

async function updateUser(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
        UPDATE users
        SET ${setString}
        WHERE id= ${id}
        RETURNING *;
      `,
      Object.values(fields)
    );

    return user;
  } catch (error) {
    throw error;
  }
}
async function updatePost(id, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }
  try {
    const {
      rows: [posts],
    } = await client.query(
      `
        UPDATE posts
        SET ${setString}
        WHERE id= ${id}
        RETURNING *;
      `,
      Object.values(fields)
    );
    return posts;
  } catch (error) {
    throw error;
  }
}
async function createPost({ authorId, title, content, tags = [] }) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
      INSERT INTO posts("authorId", title, content) 
      VALUES($1, $2, $3)
      RETURNING *;
    `,
      [authorId, title, content]
    );
    const tagList = await createTags(tags);

    return await addTagsToPost(post.id, tagList);
  } catch (error) {
    throw error;
  }
}

async function getAllPosts() {
  try {
    console.log("getting all posts");
    const { rows: postIds } = await client.query(
      `SELECT id 
        FROM posts;
      `
    );
    const posts = await Promise.all(
      postIds.map((post) => getPostById(post.id))
    );
    console.log("posts:", posts);
    return posts;
  } catch (error) {
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    // console.log("getting all posts by users");
    const { rows: postIds } = await client.query(
      `
      SELECT id FROM posts
      WHERE "authorId"=$1;
    `,
      [userId]
    );
    const posts = await Promise.all(
      postIds.map((post) => getPostById(post.id))
    );
    // console.log({ rows });
    return posts;
  } catch (error) {
    throw error;
  }
}

async function getUserById(id) {
  try {
    console.log("get user by Id");
    const {
      rows: [user],
    } = await client.query(
      `
     SELECT * FROM users
     WHERE id = $1;
     `,
      [id]
    );
    if (!user) {
      return null;
    }

    delete user.password;
    user.posts = await getPostsByUser(user.id);
    console.log(user);
    return user;
  } catch (error) {
    throw error;
  }
}
// first get the user (NOTE: Remember the query returns
// (1) an object that contains
// (2) a `rows` array that (in this case) will contain
// (3) one object, which is our user.
// if it doesn't exist (if there are no `rows` or `rows.length`), return null

// if it does:
// delete the 'password' key from the returned object
// get their posts (use getPostsByUser)
// then add the posts to the user object with key 'posts'
// return the user object
async function createTags(tagList) {
  if (tagList.length === 0) {
    return [];
  }

  // need something like: $1), ($2), ($3
  const insertValues = tagList.map((_, index) => `$${index + 1}`).join("), (");
  // then we can use: (${ insertValues }) in our string template

  // need something like $1, $2, $3
  const selectValues = tagList.map((_, index) => `$${index + 1}`).join(", ");
  // then we can use (${ selectValues }) in our string template

  try {
    // insert the tags, doing nothing on conflict
    // returning nothing, we'll query after
    await client.query(
      `
    INSERT INTO tags(name)
    VALUES (${insertValues})
    ON CONFLICT (name) DO NOTHING;
    `,
      tagList
    );

    // select all tags where the name is in our taglist
    // return the rows from the query
    const { rows } = await client.query(
      `
    SELECT * FROM tags
    WHERE name
    IN  (${selectValues});`,
      tagList
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getPostById(postId) {
  try {
    const { rows: [ post ]  } = await client.query(`
      SELECT *
      FROM posts
      WHERE id=$1;
    `, [postId]);

    // THIS IS NEW
    if (!post) {
      throw {
        name: "PostNotFoundError",
        message: "Could not find a post with that postId"
      };
    }
    // NEWNESS ENDS HERE

    const { rows: tags } = await client.query(`
      SELECT tags.*
      FROM tags
      JOIN post_tags ON tags.id=post_tags."tagId"
      WHERE post_tags."postId"=$1;
    `, [postId])

    const { rows: [author] } = await client.query(`
      SELECT id, username, name, location
      FROM users
      WHERE id=$1;
    `, [post.authorId])

    post.tags = tags;
    post.author = author;

    delete post.authorId;

    return post;
  } catch (error) {
    throw error;
  }
}

async function createPostTag(postId, tagId) {
  try {
    await client.query(
      `
      INSERT INTO post_tags("postId", "tagId")
      VALUES ($1, $2)
      ON CONFLICT ("postId", "tagId") DO NOTHING;
    `,
      [postId, tagId]
    );
  } catch (error) {
    throw error;
  }
}

async function addTagsToPost(postId, tagList) {
  try {
    const createPostTagPromises = tagList.map((tag) =>
      createPostTag(postId, tag.id)
    );

    await Promise.all(createPostTagPromises);

    return await getPostById(postId);
  } catch (error) {
    throw error;
  }
}

async function getPostsByTagName(tagName) {
  try {
    const { rows: postIds } = await client.query(
      `
      SELECT posts.id
      FROM posts
      JOIN post_tags ON posts.id=post_tags."postId"
      JOIN tags ON tags.id=post_tags."tagId"
      WHERE tags.name=$1;
    `,
      [tagName]
    );

    return await Promise.all(postIds.map((post) => getPostById(post.id)));
  } catch (error) {
    throw error;
  }
}

async function getAllTags(error) {
  try {
    const { rows } = await client.query(`
      SELECT * 
      FROM tags;
    `);

    return { rows };
  } catch (error) {
    throw error;
  }
}

async function getUserByUsername(username) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE username=$1;
    `,
      [username]
    );

    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getUserById,
  createTags,
  getPostById,
  createPostTag,
  addTagsToPost,
  getPostsByTagName,
  getAllTags,
  getUserByUsername,
  createPost,
};
