# CodeConnected

This project is implementing a social recruitment platform that'll simplify the interaction between an employer and an employee.

The platform was implemented using modern web development technologies like: React.js, React Router, Axios.js, Pusher.js, Material-UI and so on.
The application is mobile friendly and it works well on different browsers like: Mozilla Firefox, Google Chrome, Edge or IE10.

Before you're trying to run the application, make sure you've installed the following:
- Node.js
- PHP 7.3+
- create-react-app through NPM
- MySQL and PHP server apps

To start the application you'll need to do the following:
- make sure your PHP, Node.js and MySQL are running on the same server, but on different ports
	e.g. node on 192.168.0.40:3000
	     PHP on 192.168.0.40:8000
	     MySQL on 192.168.0.30:3306

- root server locations are:
	- /l2019en for the Node.js with React
	- /l2019en/api for the PHP server
- run an "npm install" in the /l2019en to add all the modules

- to start the servers you'll need to type the following commands:
	- "npm start" in the Terminal/CMD/PowerShell in the /l2019en folder -> Node.js and React
	- PHP server will need to have the root in the /l2019/api folder - start from CMD or GUI
	- MySQL server - CMD or GUI

Platform configurations before deploying it:

1. Initially you'll need to import the MySQL database from the /db folder(it's a dummy database with records for test purposes, you'll only need the schema if you want to deploy)
2. After importing the db, you'll need to configure your MySQL server credentials from /l2019en/api/dbclass.php. You'll need to add your database server, name and credentials
3. Leave the /profiles folder as it is, avoid moving it. User Avatars and CVs will be stored there.
4. You'll need to configure the Pusher API with your API keys (necessary for the Chat and Notifications modules to work). Creating and getting the Pusher Channels API keys will be done by registering here: https://pusher.com/
5. These are the places you'll need to set your Pusher API keys:
	- /l2019en/api/chatFunctions.php - 1 time
	- /l2019en/api/handleProfile.php - 2 times
	- /l2019en/src/App.js - 1 time
	- /l2019en/src/Components/Header/TopNav.js - 1 time
	- /l2019en/src/PageContent/Chat.js - 1 time
6. You'll need to set the PHPMailer function with your own credentials. The file can be found at /l2019en/api/sendMail.php
7. The symmetric key for the JWT token encryption/decryption can be found at /l2019en/api/config/secret.key. You'll need to change it with your own key for security reasons.
8. You'll need to have the following extensions enabled in your PHP config file:
	- curl
	- fileinfo
	- mbstring
	- openssl
	- pdo_mysql
