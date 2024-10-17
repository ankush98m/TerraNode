#!/bin/bash
# Create group and user
sudo groupadd csye6225
sudo useradd -r -g csye6225 -s /usr/sbin/nologin csye6225

# Ensure correct permissions for the web application
sudo chown -R csye6225:csye6225 /opt/webapp