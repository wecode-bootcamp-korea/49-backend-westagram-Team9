const http = require("http");
const express = require("express");
const { DataSource } = require("typeorm");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const myDataSource = new DataSource({
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

myDataSource.initialize().then(() => {
  console.log("Data Source has been initialized!");
});

const app = express();

dotenv.config();
app.use(express.json());
app.use(cors());

// 사이트 들어가면 환영
const hello = async (req, res) => {
  try {
    return res.status(200).json({ message: "hello" });
  } catch (error) {
    console.log(error);
  }
};

// 회원가입

const signup = async (req, res) => {
  try {
    const newUser = req.body;
    const { name, password, email } = newUser;

    // email, name, password가 다 입력되지 않은 경우
    if (email === undefined || name === undefined || password === undefined) {
      const error = new Error("KEY_ERROR");
      error.statusCode = 400;
      throw error;
    }

    // 비밀번호가 너무 짧을 때
    if (password.length < 8) {
      const error = new Error("INVALID_PASSWORD");
      error.statusCode = 400;
      throw error;
    }

    // 비밀번호에 특수문자 없을 때
    const regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g;
    if (!regExp.test(password)) {
      error.statusCode = 400;
      throw error;
    }

    // 이메일이 중복되어 이미 가입한 경우
    const a = await myDataSource.query(
      `SELECT * FROM users WHERE email LIKE '${email}'`
    );
    // 있으면 꺼져라 있으면 truthy 없으면 falsy
    if (a.length) {
      const error = new Error("DUPLICATED_EMAIL_ADDRESS");
      error.statusCode = 400;
      throw error;
    }

    const result = await myDataSource.query(
      `INSERT INTO users
        (name, password, email)
        VALUES
        ('${newUser.name}', 
        '${newUser.password}',
        '${newUser.email}')`
    );

    return res.status(201).json({ message: "userCreated" });
  } catch (error) {
    console.log(error);
  }
  return res.status(error.statusCode).json({
    message: error.message,
  });
};

// 로그인

const login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    // { email, password } = req.body

    // email, password KEY_ERROR 확인

    if (email === undefined || password === undefined) {
      const error = new Error("KEY_ERROR");
      error.statusCode = 400;
      throw error;
    }

    // Email 가진 사람 있는지 확인
    // if 없으면 -> Error
    // 있으면 -> 정상 진행
    const emailDb = await myDataSource.query(
      `SELECT * FROM users WHERE email LIKE '${email}'`
    );
    if (emailDb.length === 0) {
      const error = new Error("SIGN_UP FIRST");
      error.statusCode = 400;
      throw error;
    }

    // Password 비교
    // 유저가 입력한 password === DB에서 가져온 PASSword
    // if 다르면 -> Error
    // 같으면 -> 정상 진행
    //req.body.email이랑 같은 행에 있는
    const passwordDb = await myDataSource.query(
      `SELECT * FROM users WHERE password AND '${email}'= email LIKE '${password}'`
    );

    if (passwordDb.length === 0) {
      const error = new Error("WRONG_PASSWORD");
      error.statusCode = 400;
      throw error;
    }

    // generate token
    // 1. use library allowing generating token
    // 2. {"id": 10} // 1hour
    // 3. signature
    const payload = { id: 10 };
    const secret = "scret_key";
    const token = jwt.sign(payload, secret);
    const verifiedToken = jwt.verify(token, secret);

    return res.status(200).json({
      message: "LOGIN_SUCCESS",
      accessToken: verifiedToken,
    });
  } catch (error) {
    console.log(error);
  }
};

// 유저 조회하기
const getUser = async (req, res) => {
  try {
    const users = await myDataSource.query("select * from users");
    return res.status(201).json({ users: users });
  } catch (error) {
    console.log(error);
  }
};

// 게시물 등록하기

const createPost = async (req, res) => {
  try {
    const newPost = req.body;

    const result = await myDataSource.query(
      `INSERT INTO posts
        (title, content, user_id)
        VALUES
        ('${newPost.title}', 
        '${newPost.content}',
        '${newPost.user_id}')`
    );

    return res.status(201).json({ message: "postCreated" });
  } catch (error) {
    console.log(error);
  }
};

// 전체 게시물 조회하기

const viewPosts = async (req, res) => {
  try {
    const result = await myDataSource.query("SELECT * FROM posts");

    return res.status(201).json({ data: result });
  } catch (error) {
    console.log(error);
  }
};

// 유저의 게시물 조회하기
const view = async (req, res) => {
  try {
    const newData = req.params.id;
    const result = await myDataSource.query(
      `SELECT
      users.id AS userId,
      users.profile_image AS userProfileImage
      FROM users WHERE users.id = '${newData}'`
    );
    const result2 = await myDataSource.query(
      `SELECT 
      posts.id AS postingId,
      posts.content AS postingContent
      from posts WHERE posts.user_id = '${newData}'`
    );
    result[0].postings = result2;

    return res.status(201).json({ data: result[0] });
  } catch (error) {
    console.log(error);
  }
};

// 게시글 수정하기 post(확인완료)

const modifyPost = async (req, res) => {
  try {
    const newPost = req.body;
    const newPostId = req.body.id;
    const newContent = newPost.content;
    await myDataSource.query(
      `UPDATE posts SET content = '${newContent}' WHERE id = 1 AND user_id = '${newPostId}'`
    );

    const modify = await myDataSource.query(
      `SELECT
      users.id AS userID,
      users.name AS userName,
      posts.id AS postingId,
      posts.title AS postingTitle,
      posts.content AS postingContent
      FROM users
      INNER JOIN posts ON users.id = posts.user_id WHERE users.id = '${newPostId}'`
    );

    return res.status(201).json({ data: modify[0] });
  } catch (error) {
    console.log(error);
  }
};

// 게시글 삭제하기

const deletePost = async (req, res) => {
  try {
    const deleteCommand = req.params.id;
    const deleting = await myDataSource.query(
      `DELETE FROM posts WHERE posts.id = '${deleteCommand}';`
    );
    return res.status(201).json({ message: "postingDeleted" });
  } catch (error) {
    console.log(error);
  }
};

app.get("/", hello);
app.post("/signup", signup);
app.post("/login", login);
app.get("/users", getUser);
app.post("/posts", createPost);
app.get("/posts", viewPosts);
app.get("/view/:id", view);
app.post("/modify", modifyPost);
app.delete("/posts/:id", deletePost);

////////////////////////////////////////////////////////

const server = http.createServer(app); // express app 으로 서버를 만듭니다.

const start = async () => {
  // 서버를 시작하는 함수입니다.
  try {
    server.listen(8000, () => console.log(`Server is listening on 8000`));
  } catch (err) {
    console.error(err);
  }
};

start();

// //폐기
// if (email.indexOf('@') === -1){
//   const error = new Error("EMAIL TYPE WRONG")
//   error.statuscode = 400
//   throw error
// }

// if (password.length < 8){
//   const error = new Error("PASSWORD_TOO_SHORT")
//   error.statuscode = 400
//   throw error
// }
