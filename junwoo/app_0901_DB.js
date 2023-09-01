const http = require('http')
const express = require('express')
const { DataSource } = require('typeorm');  //타입ORM 객체 생성
const mysql = require("mysql2");


const myDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: '3306',
  username: 'root',
  password: '123',
  database: 'westagram'
})

const app = express()

app.use(express.json()) // for parsing application/json

// 이제 필요없어! DB로 보내주자!
// const users = [
//   {
//     id: 1,
//     name: "Rebekah Johnson",
//     email: "Glover12345@gmail.com",
//     password: "123qwe",
//   },
//   {
//     id: 2,
//     name: "Fabian Predovic",
//     email: "Connell29@gmail.com",
//     password: "password",
//   },
// ];

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
    console.log(userData)
    return res.status(200).json( {
      "users": userData
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
        '${password}'
        '${email}'
      )
    `)
    //4. DB data 저장 여부 확인

    //5. send response to FRONTEND

		return res.status(201).json({
      "users": users
		})
	} catch (err) {
		console.log(err)
	}
})


// 과제 3 DELETE 
// 가장 마지막 user를 삭제하는 엔드포인트
app.delete("/users", async(req, res) => {
  try {
    users.pop()
    console.log(users)
    return res.status(201).json({
        "users": users
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
    users[0].name = newName
    console.log(users)
    return res.status(201).json({
        "users": users
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