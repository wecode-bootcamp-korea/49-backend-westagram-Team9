const { DataSource } = require('typeorm');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();

const myDataSource = new DataSource({
  type: process.env.TYPEORM_CONNECTION,
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE
});

myDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  }
);

const signUp = async(req, res) => {
  try {
    // const user = req.body;
    const { name, email, password } = req.body; //구조분해할당

    // 이메일에 @가 없을 때
    if (!email.includes('@')) {
      const error = new Error('EMAIL_INVALID');
      error.statusCode = 403;
      throw error;
    }

    // name, email, password가 다 입력되지 않은 경우
    if (name === undefined || email === undefined || !password) {
      const error = new Error('KEY_ERROR');
      error.statusCode = 400;
      throw error;
    }

    // 비밀번호가 8자 이내일 때
    if (password.length < 8) {
      const error = new Error('INVALID_PASSWORD');
      error.statusCode = 400;
      throw error;
    }

    // 중복된 이메일이 있을 때
    const emailCheck = await myDataSource.query(`SELECT email FROM users WHERE email LIKE '${email}';`);

    if (emailCheck.length !== 0) {
      const error = new Error('DUPLICATE_EMAIL');
      error.statusCode = 400;
      throw error;
    }

    // 비밀번호에 특수문자 없을 때
    const specialChar = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g;
    
    if (!specialChar.test(password)) {
      const error = new Error('NOT_FOUND_SPECIAL_CHAR');
      error.statusCode = 400;
      throw error;
    }

    // 비밀번호 암호화
    const saltRounds = 12;

    bcrypt.hash(password, saltRounds, async(err, hash) => {
      if (err) {
        console.log(err);
      } else {
        await insertUser(hash);
      }
    });

    // 유저 생성
    const insertUser = async(hash) => {
      try {
        const rows = await myDataSource.query(`INSERT INTO users (name, email, password) VALUES ('${name}', '${email}', '${hash}');`);
        return res.status(201).json({ "message": "userCreated" }
        );
      } catch(err) {
        const error = new Error('USER_NOT_CREATED');
        error.statusCode = 400;
        throw error;
      }
    }
  } catch(err) {
    console.log(err);
    return res.status(err.statusCode).json({ message: err.message });
  }
}

const login = async(req, res) => {
  try {
    const { email, password } = req.body;

    // email, password 키에러 확인
    if (email === undefined || password === undefined) {
      const error = new Error('KEY_ERROR');
      error.statusCode = 400;
      throw error;
    }

    // email 가진 사람 있는지 확인
    // if 없으면 error
    // 있으면 정상진행
    const userCheck = await myDataSource.query(`SELECT id, email, password FROM users WHERE email = '${email}';`);
    if (userCheck.length == 0) {
      const error = new Error('NOT_FOUND_EMAIL');
      error.stautsCode = 400;
      throw error;
    }

    // password 비교
    // 유저가 입력한 password === DB에서 가져온 password
    // if 다르면 error
    // 있으면 정상진행
    const passwordCheck = userCheck[0].password;

    bcrypt.compare(password, passwordCheck, (err, result) => {
      if (err) {
        const error = new Error('INVALID_PASSWORD');
        error.statusCode = 400;
        throw error;
      } else if (result === true) {
        const token = jwt.sign({ "id": userCheck[0].id }, 'scret_key');
        res.header('Authorization', `Bearer ${token}`);
        res.status(200).json({ "message" : "LOGIN_SUCCESS" });
      }
    });

    // generate token
    // 1. use library allowing generating token
    // 2. {"id" : 10} :: 1hour
    // 3. signature
  } catch(err) {
    console.log(err);
    return res.status(err.statusCode).json({ "message" : err.message });
  }
}

const getUsers = async(req, res) => {
  try {
    await myDataSource.query('SELECT * FROM USERS',
    (err, rows) => {
      return res.status(200).json({ message: rows });
    })
  } catch(err) {
    console.log(err);
  }
}

// update
// delete

module.exports = { signUp, login, getUsers };