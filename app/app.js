require('dotenv').config();
const express = require('express')
const app = express()
const port = 3000
const { Client } = require('pg')

const client = new Client({ 
    user: process.env.DB_USER,
    host: process.env.DB_HOST, 
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD, 
    port: process.env.DB_PORT, 
    });

client.connect() 
    .then(() => { console.log('Connected to PostgreSQL database!'); }) 
    .catch((err) => { console.error('Error connecting to the database:', err); });

app.get('/', (req, res)=>{
    res.send('Hello World!')
})

app.get('/healthz', async (req, res) => {
    // api contains any payload
    if(req.body && Object.keys(req.body).length > 0){
        return res.status(400).set('Cache-Control', 'no-cache').send();
    }

    try{
        await client.query('SELECT 1');
        res.status(200).set('Cache-Control', 'no-cache').send();
    } catch(err){
        res.status(503).set('Cache-Control', 'no-cache').send();
    }
});

app.listen(port, ()=>{
    console.log(`Webapp listening on port ${port}`)
})