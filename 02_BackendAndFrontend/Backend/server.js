import express from 'express';

const app = express();
const port = process.env.PORT || 4000;

// app.get('/', (req, res) => {
//     res.send('server is ready')
// })

app.get('/api/jokes', (req, res) => {
    const jokes = [
        {
            id: 1,
            joke: 'joke1',
            content: 'content1'
        },
        {
            id: 2,
            joke: 'joke2',
            content: 'content2'
        },
        {
            id: 3,
            joke: 'joke3',
            content: 'content3'
        },
        {
            id: 4,
            joke: 'joke4',
            content: 'content4'
        },
        {
            id: 5,
            joke: 'joke5',
            content: 'content5'
        }
    ]
    res.send(jokes)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
