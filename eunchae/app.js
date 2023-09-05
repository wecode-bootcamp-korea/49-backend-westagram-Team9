const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const { DataSource } = require('typeorm');

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
    const emailCheck = await myDataSource.query(`SELECT * FROM users WHERE email LIKE '${email}'`);

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

    // await myDataSource.query(`INSERT INTO users (name, email, password) VALUES ('${name}', '${email}', '${password}')`);
    await myDataSource.query(`INSERT INTO users (name, email, password) VALUES ('${name}', '${email}', '${password}')`,
    (err, rows) => {
      return res.status(201).json({ message: "userCreated" });
    });
  } catch(err) {
    console.log(err);
    return res.status(err.statusCode).json({ message: err.message });
  }
}

const postCreate = async(req, res) => {
  try {
    const userPost = req.body;
    await myDataSource.query(`INSERT INTO posts (title, content, user_id) VALEUS ('${userPost.title}', '${userPost.content}', '${userPost.user_id}')`, (err, rows) => {
      return res.status(201).json({ message: "postCreated" });
    });
  } catch(err) {
    console.log(err);
  }
}

app.get('/', test);
app.get('/user', users);
app.post('/user', userCreate);
app.post('/posts', postCreate);

const port = 8000;
app.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}`);
});