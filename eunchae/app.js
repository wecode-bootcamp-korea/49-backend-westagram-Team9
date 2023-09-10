const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { DataSource } = require('typeorm');
const userService = require('./services/userService.js');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const myDataSource = new DataSource({
  type: process.env.TYPEORM_CONNECTION,
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE
});

myDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  }
);

const test = (req, res) => {
  try {
    return res.status(200).json({ message: 'server on' });
  } catch(err) {
    console.log(err);
  }
}

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  // 토큰 유무 확인
  if(!token) {
    return res.status(401).json({ "message": 'ACCESS_TOKEN_DENIED'});
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), 'scret_key');
    const userId = decoded['id'];
    req.user = decoded;
    req.userId = userId;
    next();
  } catch(err) {
    res.status(403).json({ "message": 'INVALID_TOKEN' });
  }
}

const viewPosts = async(req, res) => {
  try {
    const viewPosts = await myDataSource.query('SELECT * FROM posts;');
    return res.status(200).json({ "message" : viewPosts });
  } catch(err) {
    return res.status(err.statusCode).json({ "message" : err.message });
  }
}

const createPost = async(req, res) => {
  try {
    const { title, content } = req.body;
    const user_id = req.userId;
    await myDataSource.query(`INSERT INTO posts (title, content, user_id) VALUES ('${title}', '${content}', '${user_id}')`);
    return res.status(201).json({ "message": "postsCreate" });
  } catch(err) {
    return res.status(err.statusCode).json({ "message" : err.message });
  }
}

// 게시글 수정
// 게시글 삭제
// 좋아요 누르기

app.get('/', test);
app.get('/users', userService.getUsers);
app.post('/users/signup', userService.signUp);
app.post('/users/signin', userService.login);
app.get('/posts', viewPosts);
app.post('/posts', verifyToken, createPost);

const port = 8000;
app.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}`);
});