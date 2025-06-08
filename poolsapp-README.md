# Pools-App | an app to test different deployment strategies <br /> <img src='https://img.shields.io/badge/-v10-white?style=plastic&logo=node.js'> <img src='https://img.shields.io/badge/-v10-red?style=plastic&logo=angular'> <img src='https://img.shields.io/badge/-v4.4-white?style=plastic&logo=mongodb'>

A web application with a frontend and a backend that can be used to test deployment on different platforms like IaaS, containers, serverless, etc.

The frontend is written in Angular and is in the directory - Pools-App-Frontend

The backend is writtend in Node.js (Express) and is in the directory - Pools-App-Backend

## Contents
* [Introduction](#introduction)
* [Versioning](#versioning)
* [Pools-App-Frontend](#pools-app-frontend)
* [Pools-App-Backend](#pools-app-backend)
* [Conclusion](#conclusion)

## <a name="introduction"></a>Introduction
There are too many options to host/deploy your applications today. People often find a need to deploy some code on these options to learn more about them before actually using it to test that the platform suits their needs. Creating an app everytime to test the platforms may prove to be cumbersome. To reduce this task one can use this app for testing.
The frontend and backend can be deployed together or individually according to need. The backend provides two main features:
* Database connectivity
* Authentication

These can be maually editied from the config file or through the UI. You can find the installation for frontend and backend in their individual sections

## <a name='versioning'></a> Versioning
The app has different versions based on the type of deployments. You can use switch to versions from tags/branches. You will find the details of the deployment in the readme file of that version. The main branch will always have the basic app with MongoDB connection.


## <a name="pools-app-frontend"></a> Pools-App-Frontend
Angular based frontend. It has multiple components with services to communicate with the backend.
* DBservice - connects to db operations api
* AuthService - connects to auth operations api
* ManageService - connects to manage operations api 

Manageservice can enable or disable the two features (db and auth). It can be used when you only want to test a particular feature without having to configure the other.

You can make changes to services to call different api without disrupting the UI


#### Pre-requisites
* Node.js
* npm
* Angular CLI

#### Steps to install the frontend [run in 'Pools-App-Frontend' directory]
```
$ npm install
$ npm start
```
#### Important points to remember:
* You can change the feature status from the gear icon at the right in the nav bar
* When you enable Auth, the DB page can be visible only by first logging in from the auth page
* For MongoDB, the DB needs to be enabled to use the Auth feature as user details are stored in MongoDB

## <a name="pools-app-backend"></a> Pools-App-Backend
Node.js (Express) based backend. It has apis which perform actions on the DB or auth service.

#### Api endpoints:
* /api/data/* - db operations
* /api/manage/* - auth opeartions
* /api/manage/* - managing the config

The api is distributed into different files to make it easy to make changes according to need. Mostly you will need to make changes in the 'DbOperations.js' and 'UserOpeartions.js' to mold it to your needs. You can also go throught the comments for better understanding of where to make the changes. By default it runs on port 1234.

#### Pre-requisites:
* Node.js
* npm
* A MongoDB database. You can install one on your local machine or create a free cloud based one from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

#### Steps to install the backend [run in 'Pools-App-Backend' directory]:
```
$ npm install
$ npm install -g nodemon # for dev purpose, you can use other process manager if you want
$ npm start
```

### <a name="conclusion"></a> Conclusion
I like to explore different cloud services wherein we can deploy our applications. Making a new app each time troubled me. So the aim of this app was to make a app which can be deployed to different platforms with as few cahnges as possible. I'm aiming to publish those changes too in the coming future which will enable to have different versions of a single app which can be deployed to different platforms. You can ask for a specific deployment in the issues section.

#trigger 8+


