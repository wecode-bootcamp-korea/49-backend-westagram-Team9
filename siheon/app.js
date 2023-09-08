const http = require('http')
const express = require('express')
const dotenv = require("dotenv")
const jwt = require('jsonwebtoken')
const cors = require('cors')
const { DataSource } = require('typeorm');
const { error } = require('console');
const userService = require('./services/userService')
const postService = require('./services/postService')
dotenv.config()
const app = express()


app.use(cors())
app.use(express.json()) // for parsing application/json

const myDataSource = new DataSource({
  type: process.env.TYPEORM_CONNECTION,
 host: process.env.TYPEORM_HOST,
 port: process.env.TYPEORM_PORT,
 username: process.env.TYPEORM_USERNAME,
 password: process.env.TYPEORM_PASSWORD,
 database: process.env.TYPEORM_DATABASE
})

myDataSource.initialize().then(() => {
     console.log("Data Source has been initialized!")
 })

app.get("/", async(req, res) => {
  try {
    return res.status(200).json({"message": "Welcome to Siheon's server!"})
  } catch (err) {
    console.log(err)
  }
})


//로그인하기
app.post('/login',userService.loginUsers)

 //1. API 로 users 화면에 보여주기
app.get('/users',userService.getUsers)

//2. 회원가입
app.post("/users", userService.createUser )

//3. 마지막 유저 삭제
app.delete("/users",userService.deleteUser )

//4. 1번 유저 이름 변경
app.put("/users/1", userService.putUser) 

//5. 게시글 등록하기
app.post("/posts", postService.createPost )

//6. 게시글 조회하기
app.get('/posts',postService.getPosts)

//7. 요청한 유저의 게시글 조회하기
app.get('/posts/:id',postService.getUserPosts)

//8. 요청한 유저의 게시글 수정하기
app.put('/posts', postService.updateUserPosts)

//9. 요청한 유저의 게시글 삭제하기
app.delete('/posts/:id', postService.deleteUserPosts)

//10. 좋아요 누르기
app.post('/likes/:id', userService.likesUser)

const server = http.createServer(app) // express app 으로 서버를 만듭니다.

const start = async () => { // 서버를 시작하는 함수입니다.
  try {
    server.listen(8000, () => console.log(`Server is listening on 8000`))
  } catch (err) { 
    console.error(err)
    
  }
}

start()

