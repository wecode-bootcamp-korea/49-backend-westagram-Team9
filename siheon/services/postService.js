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



//1. 게시글 등록하기
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
//2. 게시글 조회하기
const getPosts = async(req, res) => {
  
    const postData = await myDataSource.query(`SELECT * FROM posts`)
    try {  
      return res.status(200).json( { postData
      })
      } catch (error) {
          console.log(error)
      }
     }
//3. 요청한 유저의 게시글 조회하기
const getUserPosts = async(req, res) => {
  
    try { 
     const reqId = req.params.id
      const userData = await myDataSource.query(`SELECT users.id AS userID FROM users WHERE id ='${reqId}'`)
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
//4. 요청한 유저의 게시글 수정하기
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
//5. 요청한 유저의 게시글 삭제하기
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

module.exports ={createPost, getPosts, getUserPosts, updateUserPosts, deleteUserPosts}