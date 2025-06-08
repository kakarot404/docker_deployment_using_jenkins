const routes = require("express").Router();
// Import authenticator middleware from authenticator.js
const auth = require('./authenticator')
    // Import the USER class from UserOperations
const USER = require("./UserOperations")
    // Create user class object
const user = new USER()

// To change user operations modify the UserOperations.js class instead of this file
// calls the auth middleware to check the permissions of the user logged in

// Logs in the user => user.login()
routes.post("/login", async(req, res) => {
    try {
        currentUser = await user.login(req.body.email, req.body.password)
        if (currentUser == 400 || currentUser == 401) {
            res.status(400).send({ status: 400, message: "Invalid Credentials!!!" })
        } else {
            res.cookie('userID', currentUser.userID, Math.random(10), { maxAge: 900000, httpOnly: true })
            res.cookie('token', currentUser.token, Math.random(10), { maxAge: 900000, httpOnly: true })
            res.status(200).send({ status: 200, message: "User Logged in Successfully" })
        }

    } catch (error) {
        res.status(500)
    }

})

// Logs out the current user => user.logout()
routes.post("/logout", auth, async(req, res) => {
    try {
        const requestStatus = await user.logout(req.cookies.userID, req.cookies.token)
        if (requestStatus != 200)
            throw new Error
        res.cookie('userID', '', Math.random(10), { maxAge: 0, httpOnly: true })
        res.cookie('token', '', Math.random(10), { maxAge: 0, httpOnly: true })
        res.setHeader("Authorization", "")
        res.status(200).send("Log Out Successful!")
    } catch (error) {
        res.cookie('userID', '', Math.random(10), { maxAge: 0, httpOnly: true })
        res.cookie('token', '', Math.random(10), { maxAge: 0, httpOnly: true })
        res.setHeader("Authorization", "")
        res.status(500).send("Something Went Wrong!")
    }
})

// Logout all sessions of the users => user.logoutAll()
routes.get("/logoutAll", auth, async(req, res) => {
    try {
        await user.logoutAll(req.cookies.userID, req.cookies.token)
        res.cookie('userID', '', Math.random(10), { maxAge: 0, httpOnly: true })
        res.cookie('token', '', Math.random(10), { maxAge: 0, httpOnly: true })
        res.setHeader("Authorization", "")
        res.status(200).send({ message: "Log Out Successful!" })
    } catch (error) {
        res.cookie('userID', '', Math.random(10), { maxAge: 0, httpOnly: true })
        res.cookie('token', '', Math.random(10), { maxAge: 0, httpOnly: true })
        res.setHeader("Authorization", "")
        res.status(500).send({ message: "Something Went Wrong!" })
    }
})

// Reisters new user => user.addUser()
routes.post("/addUser", async(req, res) => {
    try {
        var requestStatus = await user.addUser(req.body)
        res.status(200).send(requestStatus)
    } catch (error) {
        res.status(500).send({ status: 500, message: "Something went wrong !!!" })
    }
})

// Deletes existing user => user.delUser()
routes.post("/deleteUser", auth, async(req, res) => {
    try {
        const requestStatus = await user.delUser({ _id: req.cookies.userID, "token": req.cookies.token })
        res.cookie('userID', '', Math.random(10), { maxAge: 0, httpOnly: true })
        res.cookie('token', '', Math.random(10), { maxAge: 0, httpOnly: true })
        res.setHeader("Authorization", "")
        if (requestStatus != 200) {
            throw new Error
        }
        res.status(200).send({ message: "User Deleted Successfully!" })
    } catch (error) {
        res.cookie('userID', '', Math.random(10), { maxAge: 0, httpOnly: true })
        res.cookie('token', '', Math.random(10), { maxAge: 0, httpOnly: true })
        res.setHeader("Authorization", "")
        res.status(500).send({ message: "Something Went Wrong!" })
    }
})

// Gets current user details => user.getUser()
routes.get("/getUser", auth, async(req, res) => {
    try {
        const currentUser = await user.getUser({ _id: req.cookies.userID, "token": req.cookies.token })
        if (currentUser == 500)
            throw new Error
        res.status(200).send(currentUser)
    } catch (error) {
        res.cookie('userID', '', Math.random(10), { maxAge: 0, httpOnly: true })
        res.cookie('token', '', Math.random(10), { maxAge: 0, httpOnly: true })
        res.setHeader("Authorization", "")
        res.status(500).send("Something Went Wrong!")
    }
})


module.exports = routes;