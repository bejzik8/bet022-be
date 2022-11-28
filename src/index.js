import * as dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import jwt from 'jsonwebtoken'

import authRoutes from './routes/auth.js'
import betRoutes from './routes/bet.js'
import adminRoutes from './routes/admin.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3000

main().catch(err => console.log(err))

async function main() {
    await mongoose.connect(
        `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster0.whedoef.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`,
        { useNewUrlParser: true, useUnifiedTopology: true }
    ).then(() => console.log('Connected to database...'))
}

const verifyToken = (req, res, next) => {
    const token = req.header('auth-token')

    if (!token) return res.json({ error: 'Access denied!' })

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)

        req.user = verified

        next()
    } catch (error) {
        res.json({ error: 'Token isn\'t valid!' })
    }
}

const isAdmin = async (req, res, next) => {
    if (!req.user.isAdmin) return res.send({ message: 'Not an admin!' })

    next()
}

app.use('/', authRoutes)
app.use('/user', verifyToken, betRoutes)
app.use('/admin', verifyToken, isAdmin, adminRoutes)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
})
