const http = require('http')
const express = require('express')
const dotenv = require("dotenv")

const { DataSource } = require('typeorm');
dotenv.config()
const app = express()

app.use(express.json()) // for parsing application/json

const myDataSource = new DataSource({
  type: process.env.TYPEORM_CONNECTION,
 host: process.env.TYPEORM_HOST,
 port: process.env.TYPEORM_PORT,
 username: process.env.TYPEORM_USERNAME,
 password: process.env.TYPEORM_PASSWORD,
 database: process.env.TYPEORM_DATABASE
})

myDataSource.initialize()
 .then(() => {
     console.log("Data Source has been initialized!")
 })

app.get("/", async(req, res) => {
  try { 
    return res.status(200).json({"message": "Welcome to Siheon's server!"})
  } catch (err) {
    console.log(err)
  }
})

//1. API 로 users 화면에 보여주기
const getUsers = async(req, res) => {
  
	try {  const userData = await myDataSource.query(`SELECT * FROM USERS`)
    return res.status(200).json( { userData
    })
	} catch (error) {
		console.log(error)
	}
}
app.get('/users',getUsers)





//2. users 생성

/*
[진행 필수 사항]
GET /users 만들기
getUsers 함수로 분리해서 만듭니다.
POST /users 만들기
createUser 함수로 분리해서 만듭니다.
request body에서 사용자 정보를 받아와서 만듭니다.*/


const createUser = async(req, res) => {

  
  
     
		
    
  try { const { name, email, password, profile_image} = req.body
    const createUser = await myDataSource.query(`INSERT INTO users (name, email, profile_image, password) VALUES ('${name}', '${email}', '${profile_image}', '${password}')`)
    const userData = await myDataSource.query(`SELECT * FROM USERS`)
    console.log(userData)
   return res.status(200).json( { "userData :":userData})
    	} catch (err) {
    		console.log(err)
    	}
    }

app.post("/users", createUser )


const deleteUser = async(req, res) => {
  
  try {
    const deleteData = await myDataSource.query(`SELECT MAX(id) AS lastId FROM USERS`)
    const lastId = deleteData[0].lastId
    const deleteUser = await myDataSource.query(`DELETE FROM users WHERE id = '${lastId}'`)
    const userData = await myDataSource.query(`SELECT * FROM USERS`)
    console.log("변경된 users:", userData)
    return res.status(200).json( { "users":userData}) 
    
  } catch (err) {
    console.log(err)
  }
}

app.delete("/users", deleteUser )


/*
// 과제 4 UPDATE
// 1번 user의 이름을 'Code Kim'으로 바꾸어 보세요.
const putUser = async(req, res) => {
 
  
  try {  console.log("기존의 users:", users)
   const newName = req.body.name//"Ryu Siheon"
   console.log(newName)
   users[0]["name"] = newName;
   console.log("변경된 users:" , users)
   return res.status(200).json( { "요청된 users":users})
  } catch (err) {
    console.log(err)
  }
}

app.put("/users/1", putUser) */

const server = http.createServer(app) // express app 으로 서버를 만듭니다.

const start = async () => { // 서버를 시작하는 함수입니다.
  try {
    server.listen(8000, () => console.log(`Server is listening on 8000`))
  } catch (err) { 
    console.error(err)
  }
}

start()