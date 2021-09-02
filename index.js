const express = require('express')
const app = express()
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')

// Import Routes
const authRoute = require('./routes/auth')
const userRoute = require('./routes/users')
const postRoute = require('./routes/posts')

dotenv.config()

// Connect to DB
mongoose.connect(
    process.env.DB_CONNECT, 
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log('Connected to DB!')
)

// Middleware
app.use(cors({
    origin: 'http://localhost:5000',
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: '*'
}))
app.use(express.json())
app.use(bodyParser.json())


// Route Middlewares
app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)
app.use('/api/posts', postRoute)

app.listen(3000, () => console.log('Server running'))