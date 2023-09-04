const http = require('http');
const express = require('express');
const { DataSource } = require("typeorm");
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require("dotenv");
require('dotenv').config();


//주석adsfasf

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

  app.get('/', hello);
  app.post('/users', createUser);




const server = http.createServer(app) // express app 으로 서버를 만듭니다.

const start = async () => { // 서버를 시작하는 함수입니다.
  try {
    server.listen(8000, () => console.log(`Server is listening on 8000`))
  } catch (err) { 
    console.error(err)
  }
}

start();