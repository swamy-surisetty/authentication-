const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')

const app = express()
app.use(express.json())

let database = null
const dbPath = path.join(__dirname, 'userData.db')

// ServerDBInitialization
const ServerDBInitialization = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

ServerDBInitialization()

// Register API 1
app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`

  const dbUser = await database.get(selectUserQuery)
  if (dbUser !== undefined) {
    response.status(400)
    response.send('User already exists')
  } else {
    if (password.length < 5) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const createUserQuery = `
          INSERT INTO 
             user (username, name, password, gender, location)
          VALUES 
            (
              '${username}',
              '${name}',
              '${hashedPassword}',
              '${gender}',
              '${location}'
            )`

      const dbResponse = await database.run(createUserQuery)
      const newUserId = dbResponse.lastId
      response.send('User Created Successfully')
    }
  }
})

// Login API
app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`

  const dbUser = await database.get(selectUserQuery)
  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password)
    if (isPasswordMatched === true) {
      response.status(200)
      response.send('Login success')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})

// Update API
app.put('/change-password', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body
})

// Get Users
app.get('/users', async (request, response) => {
  const getUsersQuery = `
    SELECT 
      * 
    FROM
      user;`
  const getUsers = await database.all(getUsersQuery)
  console.log(getUsers.length)
  response.send(getUsers)
})
