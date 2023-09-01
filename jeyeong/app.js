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
let userNum = 3;
const createUser = async (req, res) => {
  try {
    const user = req.body;
    await myDataSource.query(
      `INSERT INTO users (name, email, profile_image, password) VALUES ('${user.name}', '${user.email}', '${user.profile_image}', '${user.password}')`
    );

    return res.status(201).json({ message: "userCreated" });
  } catch (error) {
    console.log(error);
  }
};

app.post("/users", createUser);

/*
let userNum = 3;
function makeUser() {
  users.push({
    id: userNum,
    name: `user ${userNum}`,
    email: `Connell${userNum}@gmail.com`,
    password: "password"
  });
  userNum++;
}
*/

// post 보기
const getPosts = async (req, res) => {
  try {
    return res.status(200).json({
      message: "게시글 조회 성공",
      data: posts
    });
  } catch (error) {
    console.log(error);
  }
};

app.get("/posts", getPosts);

// 3. post 생성
let postNum = 3;
const createPost = async (req, res) => {
  try {
    const post = req.body;
    posts.push({
      id: postNum++,
      title: post.title,
      content: post.content,
      userId: post.userId
    });

    return res.status(201).json({ message: "postCreated" });
  } catch (error) {
    console.log(error);
  }
};

app.post("/posts", createPost);

/*
let postNum = 3;
function makePost() {
  posts.push({
    id: postNum,
    title: "간단한 HTTP API 개발 시작!",
    content: "Node.js에 내장되어 있는 http 모듈을 사용해서 HTTP server를 구현.",
    userId: 2
  });
  postNum++;
}
*/

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
