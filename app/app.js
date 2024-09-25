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

app.listen(port, ()=>{
    console.log(`Webapp listening on port ${port}`)
})