# webapp

## Introduction 
This a web application to test the connectivity with the database (postgreSQL) and health of an API using /healthz endpoint.

## Pre-requisites
- Download and install Node 20.15.1 or higher or the LTS version
- Download and install PostgreSQL 16 or higher
- create a database csye6225webapp in postgreSQL

## How to Run the application
- Clone the application in your laptop or computer
- Go to the root directory (webapp) of the application
- Run command "npm install" or "npm i" to install the dependencies
- Go to "app" directory
- add .env file in source directory
- add the credentials (host, user, password, database, port) of the database
- Run command "node app.js" in terminal
- Application will start running at localhost:3000