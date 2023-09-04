const http = require("http");
const express = require("express");
const dotenv = require("dotenv");
const { DataSource } = require("typeorm");

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
    await myDataSource.query(
      `INSERT INTO users (name, email, profile_image, password) VALUES ('${name}', '${email}', '${profileImage}', '${password}')`
    );

    return res.status(201).json({ message: "userCreated" });
  } catch (error) {
    console.log(error);
  }
};

app.post("/users", createUser);

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

// 과제 3 DELETE
// 가장 마지막 user를 삭제하는 엔드포인트
const deleteUser = async (req, res) => {
  try {
    users.pop();

    return res.status(200).json({ message: "userDeleted" });
  } catch (err) {
    console.log(err);
  }
};

app.delete("/users", deleteUser);

// 과제 4 UPDATE
// 1번 user의 이름을 'Code Kim'으로 바꾸어 보세요.
const updateUser = async (req, res) => {
  try {
    const newName = req.body.name;
    const userId = req.params.id;

    const findUser = users.find((user) => user.id == userId);
    findUser.name = newName;

    return res.status(200).json({ message: "userUpdated" });
  } catch (err) {
    console.log(err);
  }
};

app.put("/users/:id", updateUser);

const server = http.createServer(app);

const start = async () => {
  try {
    server.listen(8000, () => console.log("server is listening on PORT 8000"));
  } catch (error) {
    console.log(error);
  }
};

start();
