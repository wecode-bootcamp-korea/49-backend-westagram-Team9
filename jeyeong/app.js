const http = require("http");
const express = require("express");
const dotenv = require("dotenv");
const { DataSource } = require("typeorm");
const jwt = require("jsonwebtoken");

dotenv.config();

const myDataSource = new DataSource({
  type: process.env.TYPEORM_CONNECTION,
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE
});

myDataSource.initialize().then(() => console.log("Data Source has been initialized!"));

const app = express();

app.use(express.json());

const getIndex = async (req, res) => {
  try {
    return res.status(200).json({ message: "류제영 서버" });
  } catch (error) {
    console.log(error);
  }
};

app.get("/", getIndex);

// 1. API로 users 화면에 보여주기
const getUsers = async (req, res) => {
  try {
    const users = await myDataSource.query(`SELECT * FROM users`);

    return res.status(200).json({
      message: "유저 조회 성공",
      data: users
    });
  } catch (error) {
    console.log(error);
  }
};

app.get("/users", getUsers);

// 2. user 생성
const createUser = async (req, res) => {
  try {
    const { name, email, profileImage, password } = req.body;

    // email, name, password가 다 입력되지 않은 경우
    if (!email || !name || !password) {
      const error = new Error("KEY_ERROR");
      error.statusCode = 400;
      throw error;
    }

    // 비밀번호가 너무 짧을 때 (8자리 이상만 가능)
    if (password.length < 8) {
      const error = new Error("INVALID_PASSWORD");
      error.statusCode = 400;
      throw error;
    }

    // 이메일이 중복되어 이미 가입한 경우
    const users = await myDataSource.query(`SELECT * FROM users WHERE email = '${email}'`);
    if (users.length) {
      const error = new Error("DUPLICATED_EMAIL_ADDRESS");
      error.statusCode = 400;
      throw error;
    }

    // 비밀번호에 특수문자 없을 때
    const hasSpecialChar = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g;
    if (!hasSpecialChar.test(password)) {
      const error = new Error("NO_SPECIAL_CHARACTERS");
      error.statusCode = 400;
      throw error;
    }

    await myDataSource.query(
      `INSERT INTO users (name, email, profile_image, password) VALUES ('${name}', '${email}', '${profileImage}', '${password}')`
    );

    return res.status(201).json({ message: "userCreated" });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode).json({
      message: error.message
    });
  }
};

app.post("/users", createUser);

// 로그인
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("KEY_ERROR");
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await myDataSource.query(`
      SELECT email, password FROM users WHERE email = '${email}'
    `);

    const { email: emailData, password: passwordData } = existingUser[0];

    if (!emailData) {
      const error = new Error("EMAIL_DOES_NOT_EXIST");
      error.statusCode = 404;
      throw error;
    }

    if (password !== passwordData) {
      const error = new Error("PASSWORD_DOES_NOT_MATCH");
      error.statusCode = 400;
      throw error;
    }

    const token = jwt.sign({ id: email }, process.env.SECRET_KEY);

    return res.status(200).json({
      message: "LOGIN_SUCCESS",
      accessToken: token
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode).json({
      message: error.message
    });
  }
};

app.post("/login", login);

// 3. post 생성
const createPost = async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    await myDataSource.query(
      `INSERT INTO posts (title, content, user_id) VALUES ('${title}', '${content}', '${userId}')`
    );

    return res.status(201).json({ message: "postCreated" });
  } catch (error) {
    console.log(error);
  }
};

app.post("/posts", createPost);

// 4. post 보기
const getPosts = async (req, res) => {
  try {
    const posts = await myDataSource.query(
      `SELECT posts.user_id AS userId, users.profile_image AS userProfileImage, posts.id AS postingId, posts.content AS postingContent FROM posts INNER JOIN users ON users.id = user_id`
    );

    return res.status(200).json({ data: posts });
  } catch (error) {
    console.log(error);
  }
};

app.get("/posts", getPosts);

// 5. 유저의 게시글 조회
const getPostByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await myDataSource.query(
      `SELECT users.id AS userId, users.profile_image AS userProfileImage FROM users WHERE users.id = ${id}`
    );
    const posts = await myDataSource.query(
      `SELECT posts.id AS postingId, posts.content AS postingContent FROM posts WHERE posts.user_id = ${id}`
    );

    users[0].posting = posts;

    return res.status(200).json({ data: users[0] });
  } catch (error) {
    console.log(error);
  }
};

app.get("/posts/:id", getPostByUserId);

// 6. 게시글 수정하기
const updatePost = async (req, res) => {
  try {
    const { userId, content: newContent } = req.body;
    const { id } = req.params;

    const hasUpdated = await myDataSource.query(
      `UPDATE posts SET content = '${newContent}' WHERE id = ${id} and user_id = ${userId}`
    );

    // 나중에 예외추가
    if (!hasUpdated.affectedRows) return res.status(400).json({ message: "Update failed" });

    const post = await myDataSource.query(
      `SELECT posts.user_id, users.name AS userName, posts.id AS postingId, posts.title AS postingTitle, posts.content AS postingContent FROM posts INNER JOIN users ON posts.user_id = users.id WHERE posts.id = ${id} and posts.user_id = ${userId}`
    );

    return res.status(200).json({ data: post });
  } catch (err) {
    console.log(err);
  }
};

app.put("/posts/:id", updatePost);

// 7. 게시글 삭제하기
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const hasDeleted = await myDataSource.query(`DELETE FROM posts WHERE id = ${id}`);

    if (!hasDeleted.affectedRows) return res.status(400).json({ message: "Delete failed" });

    return res.status(200).json({ message: "postingDeleted" });
  } catch (err) {
    console.log(err);
  }
};

app.delete("/posts/:id", deletePost);

// 8. 좋아요 누르기
const createLike = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { userId } = req.body;

    await myDataSource.query(`INSERT INTO likes (user_id, post_id) VALUES (${userId}, ${postId})`);

    return res.status(200).json({ message: "likeCreated" });
  } catch (err) {
    console.log(err);
  }
};

app.post("/likes/:id", createLike);

const server = http.createServer(app);

const start = async () => {
  try {
    server.listen(8000, () => console.log("server is listening on PORT 8000"));
  } catch (error) {
    console.log(error);
  }
};

start();
