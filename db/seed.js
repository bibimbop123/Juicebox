const {
  client,
  getAllUsers,
  createUser,
  updateUser,
  updatePost,
  createPost,
  getAllPosts,
  getPostsByUser,
  getUserById,
  createTags,
  getPostById,
  createPostTag,
  addTagsToPost,
  getPostsByTagName,
  getUserByUsername,
} = require("./index");

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
        DROP TABLE IF EXISTS  post_tags, posts, tags, users
      `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}
async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`

        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          active BOOLEAN DEFAULT true
        );

        CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          "authorId" INTEGER REFERENCES users(id),
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          active BOOLEAN DEFAULT true
          );

          CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL
        );

        CREATE TABLE post_tags (
          "postId" INTEGER REFERENCES posts(id),
          "tagId" INTEGER REFERENCES tags(id),
          UNIQUE ("postId", "tagId")  
          );
      `);

    console.log("creatingTagTable");
    console.log("postsTagsTable");

    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  } // not posts are doubel but not tags
}

async function createInitialUsers() {
  try {
    // console.log("Starting to create users...");

    const sandra = await createUser({
      username: "sandra",
      password: "12345678",
      name: "Just Sandra",
      location: "Ain't tellin",
    });
    const glamgal = await createUser({
      username: "glamgal",
      password: "12345678",
      name: "Joshua",
      location: "Upper East side",
    });
    const Kashnipur = await createUser({
      username: "Kashman",
      password: "12345678",
      name: "kashisking",
      location: "Upper nawf side",
    });
    // console.log(sandra);
    // console.log(glamgal);

    // console.log("Finished creating users!");
  } catch (error) {
    // console.error("Error creating users!");
    throw error;
  }
}

async function createInitialPost() {
  console.log("creating initial posts");
  try {
    const [albert, sandra, glamgal] = await getAllUsers();
    const post1 = await createPost({
      authorId: 1,
      title: "a great title",
      content: "we did it",
      // tags: ["#happy", "#youcandoanything"],
    });
    const post2 = await createPost({
      authorId: 2,
      title: "fresh agua",
      content: "quench your thirst",
      // tags: ["#happy", "#worst-day-ever"],
    });
    const post3 = await createPost({
      authorId: 3,
      title: "canada",
      content: "maplesyrup nation",
      // tags: ["#happy", "#youcandoanything", "#canmandoeverything"],
    });
    // console.log(post1);
    // console.log("finished creating posts");
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function createInitialTags() {
  try {
    console.log("Starting to create tags...");

    const [happy, sad, inspo, catman] = await createTags([
      "#happy",
      "#worst-day-ever",
      "#youcandoanything",
      "#catmandoeverything",
    ]);

    const [postOne, postTwo, postThree] = await getAllPosts();

    await addTagsToPost(postOne.id, [happy, inspo]);
    await addTagsToPost(postTwo.id, [sad, inspo]);
    await addTagsToPost(postThree.id, [happy, catman, inspo]);

    console.log("Finished creating tags!");
  } catch (error) {
    console.log("Error creating tags!");
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    // await createPostsTable(); //yea let me show you
    await createInitialUsers();
    await createInitialPost();
    await updateUser(1, { username: "andy" });

    // console.log("updating posts");
    await updatePost(1, { content: "lorem ipsum" });
    // await getPostsByUser(1);
    // await getUserById(1);
    await createTags(["tagList"]);
    // await getPostById(1);
    await createPostTag(1, 1);
    // await createInitialTags();
    // await addTagsToPost(1, ["hello"]);//found one there was double initialpost
    await getPostsByTagName(); //welp looks like everything works now...
    await getUserByUsername();
  } catch (error) {
    throw error;
  }
} //yea this is guided // im trying to figure out why our db or atleast mine doubles// we should clrean that out
//testing has ended
// async function testDB() {
//   try {
//     // console.log("Starting to test database...");

//     // console.log("Calling getAllUsers");
//     const users = await getAllUsers();
//     // console.log("Result:", users);

//     // console.log("Calling updateUser on users[0]");
//     const updateUserResult = await updateUser(users[0].id, {
//       name: "Newname Sogood",
//       location: "Lesterville, KY",
//     });
//     // console.log("Result:", updateUserResult);
//     // console.log("calling getAllPosts")
//     const posts = await getAllPosts();
//     // console.log("posts:", posts)
//     // console.log("Finished database tests!");
//     console.log("Calling getPostsByTagName with #happy");
//     const postsWithHappy = await getPostsByTagName("#happy");
//     console.log("Result:", postsWithHappy);
//   } catch (error) {
//     console.error("Error testing database!");
//     throw error;
//   }
// }

rebuildDB()
  // .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
