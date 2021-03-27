const mysql = require('mysql');

exports.connect = () => {
  const connection = mysql.createConnection({
    host: 'localhost',
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    charset: 'utf8_general_ci',
    multipleStatements: true
  })
  return connection
}

exports.pool = () => {
    const pool = mysql.createPool({
      host     : 'localhost',
      user     : process.env.DB_USER,
      password : process.env.DB_PW,
      database : process.env.DB_NAME,
      charset: 'utf8_general_ci',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })
    return pool
  }