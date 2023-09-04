const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const { DataSource } = require('typeorm');

const app = express();
app.use(express.json());
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
  });

const test = (req, res) => {
  try {
    return res.status(200).json({ message: 'server on' });
  } catch(err) {
    console.log(err);
  }
}

const users = async(req, res) => {
  try {
    await myDataSource.query('SELECT * FROM USERS',
    (err, rows) => {
      return res.status(200).json({ message: rows });
    })
  } catch(err) {
    console.log(err);
  }
}

const userCreate = async(req, res) => {
  try {
    const user = req.body;

    await myDataSource.query(`INSERT INTO users (name, email, password) VALUES ('${user.name}', '${user.email}', '${user.password}')`,
    (err, rows) => {
      return res.status(201).json({ message: "userCreated" });
    });
  } catch(err) {
    console.log(err);
  }
}

app.get('/', test);
app.get('/user', users);
app.post('/user', userCreate);

const port = 8000;
app.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}`);
});