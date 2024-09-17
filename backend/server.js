require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const workoutRoutes = require('./routes/workouts')
const userRoutes = require('./routes/user')
const cors = require('cors')

// express app
const app = express()

// use cors
allowedOrigins = [
  "http://localhost:3000",
  "https://momentum-frontend-x6n5.onrender.com"
]

app.use(cors({
  origin: allowedOrigins,
  methods: 'GET,PATCH,POST,DELETE,OPTIONS',
  optionsSuccessStatus: 200,
  credentials: true
}))

app.options('*', cors()); // Pre-flight request

// other middleware
app.use(express.json())

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

// routes
app.use('/api/workouts', workoutRoutes)
app.use('/api/user', userRoutes)

// connect to db
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log('connected to db & listening on port', process.env.PORT)
    })
  })
  .catch((error) => {
    console.log(error)
  })