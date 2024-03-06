const mysql = require('mysql');
require('dotenv').config();

// 创建数据库连接
const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

// 连接数据库
connection.connect((err) => {
  if (err) {
    console.error('数据库连接失败 ', err);
    return;
  }
});

module.exports = connection

// 关闭数据库连接
// connection.end();
