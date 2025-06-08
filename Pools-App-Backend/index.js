const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const mongoose = require("mongoose");

// Import config.json file to load the config
const config = require('./config.json')

// Import routing modules
const AuthRoutes = require("./AuthRoutes");
const DataRoutes = require("./DataRoutes");
const ManagementRoutes = require("./ManagementRoutes");
require("./DbOperations")

const app = express();
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(session({
    secret: "asdfllkh3qo5@#B$IUuh0bn6NB^BIOTN*O",
    saveUninitialized: false,
    resave: false
}));

// Redirect routes to appropriate file
app.use("/api/auth", AuthRoutes);
app.use("/api/data", DataRoutes);
app.use("/api/manage", ManagementRoutes);

// set config variables
app.set("authEnabled", config.authEnabled)
app.set("dbEnabled", config.dbEnabled)

// Activate server
app.listen(1234);
console.log("Server Listening at port 1234");

// Modify the connection string to the new database for other than regular docker use
// const dbURI = process.env.ME_CONFIG_MONGODB_SERVER;

//                                  OR

// Modify the connection string to the new database for docker run only.
const dbURI = `mongodb://${process.env.ME_CONFIG_MONGODB_ADMINUSERNAME}:${process.env.ME_CONFIG_MONGODB_ADMINPASSWORD}@${process.env.ME_CONFIG_MONGODB_SERVER}/${process.env.ME_CONFIG_MONGODB_DATABASE}?authSource=admin`;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB!");
    })
    .catch(err => {
        console.log("Error connecting to MongoDB:", err);
    });