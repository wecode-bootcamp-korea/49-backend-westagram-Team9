const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const { DataSource } = require('typeorm');
const jwt = require('jsonwebtoken');

const app = express();
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
  });

const test = (req, res) => {
  try {
    return res.status(200).json({ message: 'server on' });
  } catch(err) {
    console.log(err);
  }
}

const users = async(req, res) => {
  try {
    await myDataSource.query('SELECT * FROM USERS',
    (err, rows) => {
      return res.status(200).json({ message: rows });
    })
  } catch(err) {
    console.log(err);
  }
}

const userCreate = async(req, res) => {
  try {
    // const user = req.body;
    const { name, email, password } = req.body; //구조분해할당

    // 이메일에 @가 없을 때
    if (!email.includes('@')) {
      const error = new Error('EMAIL_INVALID');
      error.statusCode = 403;
      throw error;
    }

    // name, email, password가 다 입력되지 않은 경우
    if (name === undefined || email === undefined || !password) {
      const error = new Error('KEY_ERROR');
      error.statusCode = 400;
      throw error;
    }

    // 비밀번호가 8자 이내일 때
    if (password.length < 8) {
      const error = new Error('INVALID_PASSWORD');
      error.statusCode = 400;
      throw error;
    }

    // 중복된 이메일이 있을 때
    const emailCheck = await myDataSource.query(`SELECT email FROM users WHERE email LIKE '${email}'`);

    if (emailCheck.length !== 0) {
      const error = new Error('DUPLICATE_EMAIL');
      error.statusCode = 400;
      throw error;
    }

    // 비밀번호에 특수문자 없을 때
    const specialChar = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g;
    
    if (!specialChar.test(password)) {
      const error = new Error('NOT_FOUND_SPECIAL_CHAR');
      error.statusCode = 400;
      throw error;
    }
   await myDataSource.query(`INSERT INTO users (name, email, password) VALUES ('${name}', '${email}', '${password}')`,
    (err, rows) => {
      return res.status(201).json({ message: "userCreated" });
    });
  } catch(err) {
    console.log(err);
    return res.status(err.statusCode).json({ message: err.message });
  }
}

const login = async(req, res) => {
  try {
    const { name, email, password } = req.body;

    // email, password 키에러 확인
    if (name === undefined || email === undefined || password === undefined) {
      const error = new Error('KEY_ERROR');
      error.statusCode = 400;
      throw error;
    }

    // email 가진 사람 있는지 확인
    // if 없으면 error
    // 있으면 정상진행
    const DBcheck = await myDataSource.query(`SELECT email, password FROM users WHERE email = '${email}'`);
    if (DBcheck.length == 0) {
      const error = new Error('NOT_FOUND_EMAIL');
      error.stautsCode = 400;
      throw error;
    }

    // password 비교
    // 유저가 입력한 password === DB에서 가져온 password
    // if 다르면 error
    // 있으면 정상진행
    const passwordCheck = DBcheck[0].password;
    if (password !== passwordCheck) {
      const error = new Error('INVALID_PASSWORD');
      error.statusCode = 400;
      throw error;
    }

    // generate token
    // 1. use library allowing generating token
    // 2. {"id" : 10} :: 1hour
    // 3. signature

    const token = jwt.sign({ "id": 10 }, 'scret_key');
    return res.status(200).json({
      "message" : "LOGIN_SUCCESS",
      "accessToken" : token
    });
  } catch(err) {
    console.log(err);
    return res.status(err.statusCode).json({ "message" : err.message });
  }
}

app.get('/', test);
app.get('/user', users);
app.post('/user', userCreate);
app.post('/user/login', login);

const port = 8000;
app.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}`);
});