require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/twitter', (req, res) => {
    res.send('myTwitter')
})

app.get('/github', (req, res) => {
    res.send('<a href="https://github.com/adilahmed3886">myGithub</a>')
})

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${port}`)
})