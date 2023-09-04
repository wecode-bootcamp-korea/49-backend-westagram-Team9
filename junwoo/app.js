const http = require('http')
const express = require('express')
const dotenv = require('dotenv')
const { DataSource } = require('typeorm');  //타입ORM 객체 생성
const mysql = require("mysql2");
dotenv.config();

// const myDataSource = new DataSource({
//   type: 'mysql',
//   host: 'localhost',
//   port: '3306',
//   username: 'root',
//   password: '123',
//   database: 'westagram'
// })
const myDataSource = new DataSource({
  type: process.env.TYPEORM_CONNECTION,
    host: process.env.TYPEORM_HOST,
    port: process.env.TYPEORM_PORT,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE
})

const app = express()

app.use(express.json()) // for parsing application/json

app.get("/", async(req, res) => {
  try {
    return res.status(200).json({"message": "Welcome to Soheon's server!"})
  } catch (err) {
    console.log(err)
  }
})

//1. API 로 users 화면에 보여주기
app.get('/users', async(req, res) => {
	try {
    //이제 쿼리문을 작성해보자
    //DB 소스 변수를 가져오고
    //SELEC id, name, pw FROM users
    const userData = await myDataSource.query(`SELECT id, name, email, password FROM USERS`)
    //콘솔에 출력 해보기
    console.log(userData)
    //프론트에 전달
    return res.status(200).json( {
      "USER DATA " : userData
    })
	} catch (error) {
		console.log(error)
	}
})
//2. users 생성
app.post("/users", async(req, res) => {
	try {
    //1. user 정보를 frontend로 부터 받는다 (프론트가 사용자저옵를 가지고 요청을 보낸다)
    const me = req.body
    //2. user 정보 확인 한번 해보기
    console.log("ME: ", me)
    //3. DB에 정보를 저장
    const name = me.name
    const password = me.password
    const email = me.email

    const userData = await myDataSource.query(`
      INSERT INTO users(
        name,
        password,
        email
      )
      VALUES(
        '${name}',
        '${password}',
        '${email}'
      )
    `)
    //4. DB data 저장 여부 확인
    console.log('iserted user id', userData.insertId)
    console.log(await myDataSource.query(`SELECT * FROM users;`))
    //5. send response to FRONTEND

		return res.status(200).json({
      "message ": "userCreated"   //정상적으로 생성 되었음을 알려줌
		})
	} catch (err) {
		console.log(err)
	}
})


// 과제 3 DELETE 
// 가장 마지막 user를 삭제하는 엔드포인트
app.delete("/users", async(req, res) => {
  try {
    const userDelete = await myDataSource.query(`
      DELETE FROM users ORDER BY id DESC LIMIT 1;
    `)
    // 삭제 여부 확인
    console.log(await myDataSource.query(`SELECT * FROM users;`))
    return res.status(200).json({
        "message": "delete complete!"   //정상적으로 삭제되었음을 알려줌
        
    })
  } catch (err) {
    console.log(err)
  }
})

// 과제 4 UPDATE
// 1번 user의 이름을 'Code Kim'으로 바꾸어 보세요.

app.put("/users/1", async(req, res) => {
  try {
    const newName = req.body.data.name
    const userUpdate = await myDataSource.query(`
      UPDATE users SET name = '${newName}' WHERE id = 1;
    `)
    //DB UPDATE 여부 확인 
    console.log(await myDataSource.query(`SELECT * FROM users;`))
    return res.status(201).json({
        "message": "update complete!"
    })
  } catch (err) {
    console.log(err)
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

myDataSource.initialize() //서버와 DB를 연결해 준다!
 .then(() => {
     console.log("Data Source has been initialized!")
 })

start()