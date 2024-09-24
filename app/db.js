const { Pool } = require('pg')

const pool = new Pool({
    user: 'your_db_user',
    host: 'your_host_host',
    database: 'your_db_name',
    password: 'your_db_password',
    port: 5432, // default postgresql port
})

module.exports = pool