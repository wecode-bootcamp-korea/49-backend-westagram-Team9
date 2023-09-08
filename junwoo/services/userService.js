const jwt = require("jsonwebtoken");

const signUp = async (req, res) => {
  try {
    //1. user 정보를 frontend로 부터 받는다 (프론트가 사용자저옵를 가지고 요청을 보낸다)
    const me = req.body;
    //2. user 정보 확인 한번 해보기
    console.log("ME: ", me);
    //3. DB에 정보를 저장
    const name = me.name;
    const password = me.password;
    const email = me.email;
    // const {name, password, email} = me   위의 선언과 같은 의미 대신 객체선언값이 같아야한다! // 구조분해할당

    //////// 예외 처리 시작 ////////
    // 위 세개의 값이 다 입력 되었는지?
    //key값이 안들어 간 것과 key 자체가 들어가지 않았을 때 둘은 다른 오류다
    // {
    //   "name": "JasonPark",
    //   "password": "123123"
    // } 이것은 undefined가 되고
    // 이것과
    // {
    //   "name": "JasonPark",
    //   "password": "123123"
    //   "email" : "",
    // } 이것은 비어있다고 표현 된다.
    // 이 둘은 다른 오류라는 뜻이다.
    if (email === undefined || name === undefined || password === undefined) {
      const error = new Error("KEY_ERROR");
      error.statusCode = 400;
      throw error;
    }

    // (필수) 비밀번호가 너무 짧을 때
    if (password.length < 8) {
      const error = new Error("INVALID_PASSWORD");
      error.statusCode = 400;
      throw error;
    }

    // (심화, 진행) 이메일이 중복되어 이미 가입한 경우
    // DB 접근해서 이메일 검색해서 객체로 저장
    const emaildata = await myDataSource.query(`
        SELECT email  
        FROM users
        WHERE email LIKE '${email}';
      `);
    // 객체가 비어있다면 중복되는 이메일 없음 하지만 하나라도 있다면 중복
    // Object key로 되어있을지
    if (!(Object.keys(emaildata).length === 0)) {
      const error = new Error("DUPLICATED_EMAIL_ADDRESS");
      error.statusCode = 400;
      throw error;
    }

    // (심화, 선택) 비밀번호에 특수문자 없을 때
    // 특수 문자열 선언
    var s_parttern = /[`~!@#$%^&*|\\\'\";:\/?]/gi;
    // 특수문자 확인후 에러확인
    if (!s_parttern.test(password)) {
      const error = new Error("INVALID_PASSWORD_SPECIAL");
      error.statusCode = 400;
      throw error;
    }
    //// 유저 생성
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
      `);
    //4. DB data 저장 여부 확인
    console.log("iserted user id", userData.insertId);
    //5. send response to FRONTEND
    return res.status(200).json({
      "message ": "userCreated", //정상적으로 생성 되었음을 알려줌
    });
  } catch (err) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }
};

const logIn = async (req, res) => {
  try {
    const { email, password } = req.body; //로그인 정보 받아옴

    //////// 예외 처리 시작 ////////
    //이메일 비밀번호 key error확인
    if (email === undefined || password === undefined) {
      const error = new Error("KEY_ERROR");
      error.statusCode = 400;
      throw error;
    }
    //이메일이 등록되어있는지 확인
    //없으면 Error
    const user_data = await myDataSource.query(`
      SELECT id, email, password 
      FROM users 
      WHERE email = '${email}';`);

    if (user_data.length == 0) {
      const error = new Error("UNKWON_ID");
      error.statusCode = 400;
      throw error;
    }
    //비밀번호 비교
    //유저의 비밀번호와 데이터베이스 비밀번호가 같은지 비교
    //다르면 Error
    if (user_data[0].password != password) {
      const error = new Error("INCORRECT_PASSWORD");
      error.statusCode = 400;
      throw error;
    }

    // generate token
    //1. use library allowing generating token
    //2. {"id"} //1hour
    const token = jwt.sign({ id: email }, "sceret key"); // accessToken: token,
    //3. signiture

    console.log("LOGIN_SUCCESS");
    return res.status(200).json({
      message: "LOGIN_SUCCESS",
      accessToken: token,
    });
  } catch (err) {
    console.log(err);
  }
};

const getUser = async (req, res) => {
  try {
    //이제 쿼리문을 작성해보자
    //DB 소스 변수를 가져오고
    //SELEC id, name, pw FROM users
    const userData = await myDataSource.query(
      `SELECT id, name, email, password FROM USERS`
    );
    //콘솔에 출력 해보기
    console.log(userData);
    //프론트에 전달
    return res.status(200).json({
      "USER DATA ": userData,
    });
  } catch (error) {
    console.log(error); //무슨 에러인지 알아야 디버깅이 가능하다.
    return res.status(500).json({
      //500은 서버 문제를 의미
      message: "UNKNOWN_SERVER_ERROR", //프론트에게도 오류 상황에 대해서 안내한다.
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userDelete = await myDataSource.query(`
        DELETE FROM users ORDER BY id DESC LIMIT 1;
      `);
    // 삭제 여부 확인
    console.log(await myDataSource.query(`SELECT * FROM users;`));
    return res.status(200).json({
      message: "delete complete!", //정상적으로 삭제되었음을 알려줌
    });
  } catch (err) {
    console.log(err);
  }
};

const updateUser = async (req, res) => {
  try {
    const newName = req.body.data.name;
    const userUpdate = await myDataSource.query(`
        UPDATE users SET name = '${newName}' WHERE id = 1;
      `);
    //DB UPDATE 여부 확인
    console.log(await myDataSource.query(`SELECT * FROM users;`));
    return res.status(201).json({
      message: "update complete!",
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  signUp: signUp,
  logIn: logIn,
  getUser: getUser,
  deleteUser: deleteUser,
  updateUser: updateUser,
};
