const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// const axios = require('axios');
const { DataSource } = require('typeorm');
const userService = require('./services/userService.js');

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

// 게시글 등록
// 게시글 조회
// 유저 게시글 조회
// 게시글 수정
// 게시글 삭제
// 좋아요 누르기

app.get('/', test);
app.get('/users', userService.getUsers);
app.post('/users/signup', userService.signUp);
app.post('/users/signin', userService.login);

const port = 8000;
app.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}`);
});