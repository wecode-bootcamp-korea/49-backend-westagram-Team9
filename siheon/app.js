const http = require('http')
const express = require('express')
const dotenv = require("dotenv")
const jwt = require('jsonwebtoken')
const { DataSource } = require('typeorm');
const { error } = require('console');
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

//0. 로그인 하기
/*
// 로그인
app.post("/login", async(req, res) => {
  try {
    1
    const email = req.body.email
    const password = req.body.password
    // { email, password } = req.body
    2

    // email, password KEY_ERROR 확인
    3

    // Email 가진 사람 있는지 확인
    // if 없으면 -> Error
    // 있으면 -> 정상 진행
    4

    // Password 비교
    // 유저가 입력한 password === DB에서 가져온 PASSword
    // if 다르면 -> Error
    // 같으면 -> 정상 진행

    5 // generate token
    // 1. use library allowing generating token
    // 2. {"id": 10} // 1hour
    const token = jwt.sign({id:____}, 'scret_key')
    // 3. signature 

    return res.status(200).json({ 
      "message" : "LOGIN_SUCCESS",
      "accessToken" : token
    })
    6

  } catch (error) {
    console.log(error)
  }
}) */



const loginUsers = async(req, res) => {
  
  try {  
    const {email, password} = req.body
    const userData = await myDataSource.query(`SELECT * FROM users WHERE email='${email}'`)

     // email, password KEY_ERROR 확인
     if (!email || !password) {
        const error = new Error("KEY_ERROR")
        error.statusCode=400
        throw error
     }

     
     if ( userData.length === 0){
       const error = new Error("EMAIL_DOES_NOT_EXIST_IN_DATABASE")
       error.statusCode=400
        throw error
     }
     const user = userData[0];
     if (password !== user.password ){
        const error = new Error("INVALID_PASSWORD")
        error.statusCode=400
        throw error
     }

     const token = jwt.sign({id: user.id}, 'secret_key')
     const decoded = jwt.verify(token, 'secret_key')
     console.log(decoded)

    return res.status(200).json( {  "message" : "LOGIN_SUCCESS",
    "accessToken" : token
    })
	} catch (error) {
		console.log(error)
	}
}
app.post('/login',loginUsers)


//1. API 로 users 화면에 보여주기
const getUsers = async(req, res) => {
  
  try {  
    const userData = await myDataSource.query(`SELECT * FROM USERS`)
    return res.status(200).json( { userData
    })
	} catch (error) {
		console.log(error)
	}
}
app.get('/users',getUsers)





//2. users 생성



const createUser = async(req, res) => {
  try {
     const { name, email, password, profile_image} = req.body

     //1.email, password, name 다 입력되지 않은경우
     if (!email || !name || !password){
      const error = new Error("KEY_ERROR")
      error.statusCode=400
      throw error
     }

     //2.비밀번호가 너무 짧을때
     if (password.length < 8){
      const error = new Error("INVALID_PASSWORD")
      error.statusCode=400
      throw error
     }

     //3.이메일이 중복되어 이미 가입된경우
    const emailData = await myDataSource.query(`SELECT users.email FROM users WHERE users.email='${email}'`)
     if (emailData.length > 0 ){
      const error = new Error("DUPLICATED_EMAIL_ADDRESS")
      error.statusCode=400
      throw error
     }


      // 4. 특수문자가 빠진경우
      
      // if (userPassword){
      //   const error = new Error("DUPLICATED_EMAIL_ADDRESS")
      //   error.statusCode=400
      //   throw error
      // }


     await myDataSource.query(`INSERT INTO users (name, email, profile_image, password) VALUES ('${name}', '${email}', '${profile_image}', '${password}')`)
    const userData = await myDataSource.query(`SELECT * FROM USERS`)
    console.log(userData)
   return res.status(200).json( { "userData :":userData})
    	} catch (err) { 
        return res.status(400).json( { "message :":err})
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
    `SELECT users.id AS userId, users.name AS userName, posts.id AS postingId, 
    posts.title AS postingTitle, posts.content AS postingContent 
    FROM users INNER JOIN posts ON posts.user_id = users.id
     WHERE posts.id='${id}' and posts.user_id= '${user_id}'`);
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



//로그인 하는 경우
// const  = async(req, res) => {
  
//   try {  
//     const userData = await myDataSource.query()
//     return res.status(200).json( { 
//     })
// 	} catch (error) {
// 		console.log(error)
// 	}
// }
// app.get('/users',getUsers)

const server = http.createServer(app) // express app 으로 서버를 만듭니다.

const start = async () => { // 서버를 시작하는 함수입니다.
  try {
    server.listen(8000, () => console.log(`Server is listening on 8000`))
  } catch (err) { 
    console.error(err)
    
  }
}

start()

