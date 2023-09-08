const jwt = require('jsonwebtoken')
const { DataSource } = require('typeorm');
const dotenv = require("dotenv")
dotenv.config()

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
//2. 회원가입
const createUser = async(req, res) => {
    try {
       const { name='아무나', email, password} = req.body
  
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
  
       await myDataSource.query(`INSERT INTO users (name, email,  password) VALUES ('${name}', '${email}', '${password}')`)
      const userData = await myDataSource.query(`SELECT * FROM USERS`)
      console.log(userData)
     return res.status(200).json( { "message": "createuser"})
          } catch (error) { 
          return res.status(400).json({"message":error.message})
              console.log(err)
  
          }
     }
//3. 마지막 유저 삭제
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
//4. 1번 유저 이름 변경
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
//5. 좋아요 누르기
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
//6. 로그인하기
const loginUsers = async(req, res) => {
  
    try {  
      // const [user] = await myDataSource.query(`SELECT * FROM users WHERE email='${email}'`) 배열의 첫번째의 요소로 할당
      const {email, password} = req.body
      const userData = await myDataSource.query(`SELECT * FROM users WHERE email='${email}'`)
      const user = userData[0]
       // email, password KEY_ERROR 확인
       if (!email || !password) {
          const error = new Error("KEY_ERROR")
          error.statusCode=400
          throw error
       }
  
       
       if ( !userData.length ){
         const error = new Error("EMAIL_DOES_NOT_EXIST_IN_DATABASE")
         error.statusCode=400
          throw error
       }
       
       
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
      console.log(error);
      return res.status(400).json( {  "message":error.message
      })
      }
  }

module.exports ={
    loginUsers, getUsers, createUser, deleteUser, putUser,  likesUser}