const http = require('http');
const express = require('express');
const { DataSource } = require("typeorm");
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require("dotenv");
require('dotenv').config();




const myDataSource = new DataSource({
 type: process.env.DB_TYPE,
 host: process.env.DB_HOST,
 port: process.env.DB_PORT,
 username: process.env.DB_USER,
 password: process.env.DB_PASSWORD,
 database: process.env.DB_NAME
});

myDataSource.initialize().then(() => {
     console.log("Data Source has been initialized!")
 });

const app = express();

 
dotenv.config();
app.use(express.json())
app.use(cors())



// 회원가입

  const hello = async (req, res) => {
    try {
      return res.status(200).json({ "message": "hello" });
    } catch (error) {
      console.log(error);
    }
  };

  const createUser = async (req, res) => {
    try {
      const newUser = req.body; 
      console.log(newUser);
      const result = await myDataSource.query(
        `INSERT INTO users
        (name, profile_image, password)
        VALUES
        ('${newUser.name}', 
        '${newUser.profile_image}',
        '${newUser.password}')`);

      return res.status(201).json({ "message": "userCreated" });
    } catch (error) {
      console.log(error);
    }
  };

// get user
  const getUser = async (req, res) =>{
    try{
      const users = await myDataSource.query(
        'select * from users'
      );
      return res.status(201).json({"users" : users})
    } catch (error) {
      console.log(error);
    }
  };

  app.get('/', hello);
  app.post('/users', createUser);
  app.get('/users', getUser);


//////////////////////////////////////

app.post("/users", async(req, res) => {
	try {
    // 1. user 정보를 frontend로부터 받는다. (프론트가 사용자 정보를 가지고, 요청을 보낸다) 
    const me = req.body
    

    // 3. DATABASE 정보 저장.
    

    const { name, password, email } = me //구조분해할당
    // const name = me.name // 다나
    // const password = me.password // 비밀번호
    // const email = me.email // email


    // email, name, password가 다 입력되지 않은 경우
    if (email === undefined || name === undefined || password === undefined) {
      const error = new Error("KEY_ERROR")
      error.statusCode = 400
      throw error
    }

    // (필수) 비밀번호가 너무 짧을 때
    if (password.length < 8) {
      const error = new Error("INVALID_PASSWORD")
      error.statusCode = 400
      throw error
    }

    // (심화, 진행) 이메일이 중복되어 이미 가입한 경우
    const a = await myDataSource.query(
   `SELECT * FROM users WHERE email LIKE '${email}'`);
    // 있으면 꺼져라 있으면 truthy 없으면 falsy
    if (a.length) {
      const error = new Error("DUPLICATED_EMAIL_ADDRESS")
      error.statusCode = 400
      throw error
    }

    // (심화, 선택) 비밀번호에 특수문자 없을 때
  
    const regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g;
    if (!regExp.test(password))
     {
      const error = new Error("")
      error.statusCode = 400
      throw error
    }

    const userData = await myDataSource.query(`
      INSERT INTO users (
        name, 
        password,
        email
      )
      VALUES (
        '${name}',
        '${password}', 
        '${email}'
      )
    `)

    // 5. send response to FRONTEND
		return res.status(201).json({
      "message": "userCreated" 
		})
	} catch (error) {
		console.log(error)
    return res.status(error.statusCode).json({
      "message": error.message
    })
	}
})







const server = http.createServer(app) // express app 으로 서버를 만듭니다.

const start = async () => { // 서버를 시작하는 함수입니다.
  try {
    server.listen(8000, () => console.log(`Server is listening on 8000`))
  } catch (err) { 
    console.error(err)
  }
}

start();