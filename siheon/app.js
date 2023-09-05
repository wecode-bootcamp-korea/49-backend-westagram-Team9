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
  
  const userData = await myDataSource.query(`SELECT * FROM USERS`)
  try {  
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
  try {
     const { name, email, password, profile_image} = req.body
     await myDataSource.query(`INSERT INTO users (name, email, profile_image, password) VALUES ('${name}', '${email}', '${profile_image}', '${password}')`)
    const userData = await myDataSource.query(`SELECT * FROM USERS`)
    console.log(userData)
   return res.status(200).json( { "userData :":userData})
    	} catch (err) {
    		console.log(err)
    	}
    }

app.post("/users", createUser )


// 과제 2-1 마지막 유저 삭제하기

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



// 과제 2-2 UPDATE
// 1번 user의 이름을 'Code Kim'으로 바꾸어 보세요.

const putUser = async(req, res) => {
  try {  const userData = await myDataSource.query(`SELECT * FROM USERS`)
  console.log("기존의 데이터:" ,userData)
   const newName = req.body.name ;//"Ryu Siheon"
   console.log(newName);
   const updateData = await myDataSource.query(`UPDATE users SET name = '${newName}' WHERE id=1`)
   console.log("변경된 users:" , userData)
   return res.status(200).json( { "요청된 users":userData})
  } catch (err) {
    console.log(err)
  }
}

app.put("/users/1", putUser) 

// 과제 3 게시글 등록하기 

const createPost = async(req, res) => {

  try { 
    const { title, content, user_id,} = req.body
     await myDataSource.query(`INSERT INTO posts (title, content, user_id) VALUES ('${title}', '${content}', '${user_id}')`)
    const userData = await myDataSource.query(`SELECT * FROM posts`)
    console.log(userData)
   return res.status(200).json({"message": "postCreated"})
    	} catch (err) {
    		console.log(err)
    	}
    }

app.post("/posts", createPost )

//과제 4 게시글 조회하기

const getPosts = async(req, res) => {
  
  const postData = await myDataSource.query(`SELECT * FROM posts`)
  try {  
    return res.status(200).json( { postData
    })
	} catch (error) {
		console.log(error)
	}
}
app.get('/posts',getPosts)


//과제 5 한 유저의 게시글 조회하기


const getUserPosts = async(req, res) => {
  
  try { 
   const reqId = req.params.id
    const userData = await myDataSource.query(`SELECT users.id AS userID, users.profile_image AS userProfileImage FROM users WHERE id ='${reqId}'`)
    const postData = await myDataSource.query(`SELECT posts.id AS postingId, posts.content AS postingContent From posts WHERE user_id ='${reqId}'`)
    console.log(userData)
    console.log(postData)
    userData[0].postings=postData
 
    return res.status(200).json({ data: userData[0]
    })
	} catch (error) {
		console.log(error)
	}
}
app.get('/posts/:id',getUserPosts)

//과제 6 한 유저의 게시글 수정하기

const updateUserPosts = async(req, res) => {
  
  try { 
   const {id, user_id, title, content} = req.body
   await myDataSource.query(`UPDATE posts SET title = '${title}', content = '${content}' WHERE id='${id}' and user_id= '${user_id}'`)
   const updateData = await myDataSource.query(
    `SELECT users.Id AS userId, users.name AS userName, posts.id AS postingId, 
    posts.title AS postingTitle, posts.content AS postingContent 
    FROM users INNER JOIN posts ON posts.user_id = users.id WHERE posts.id='${id}' and posts.user_id= '${user_id}'`);
   console.log(updateData)
    return res.status(200).json({ data: updateData
    })
	} catch (error) {
		console.log(error)
	}
}
app.put('/posts', updateUserPosts)

//과제 7 게시글 삭제하기

const deleteUserPosts = async(req, res) => {
  
  try { 
   const id = req.params.id
   await myDataSource.query(`DELETE FROM posts WHERE posts.id='${id}'`)
   const deleteData = await myDataSource.query('SELECT * FROM posts');
   console.log(deleteData)
    return res.status(200).json({ "message": "postingDeleted"
    })
	} catch (error) {
		console.log(error)
	}
}
app.delete('/posts/:id', deleteUserPosts)

//과제 8 좋아요 

const likesUser = async(req, res) => {
  
  try { 
   const post_id = req.params.id
   const userId = req.body.id
   await myDataSource.query(`INSERT INTO likes (user_id, post_id) VALUES ('${userId}','${post_id}')`)
   const likeUser = await myDataSource.query('SELECT * FROM likes');
   console.log(likeUser)
    return res.status(200).json({ "message" : "likeCreated"
    })
	} catch (error) {
		console.log(error)
	}
}
app.post('/likes/:id', likesUser)

const server = http.createServer(app) // express app 으로 서버를 만듭니다.

const start = async () => { // 서버를 시작하는 함수입니다.
  try {
    server.listen(8000, () => console.log(`Server is listening on 8000`))
  } catch (err) { 
    console.error(err)
    
  }
}

start()