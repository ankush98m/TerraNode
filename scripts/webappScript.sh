#!/bin/bash
# Navigate to the tmp directory
cd /tmp

# Unzip the web application
# sudo mv /tmp/webapp /opt/
sudo unzip webapp.zip -d /opt/webapp    

# Navigate to the web application directory
cd /opt/webapp/webapp

# Install Node.js dependencies
sudo npm install

# Run npm test to execute any test cases
# npm test

# Navigate to the app directory
cd /opt/webapp/webapp/app

# Start the Node.js server using node app.js and run it in the background
nohup node app.js > app.log 2>&1 &