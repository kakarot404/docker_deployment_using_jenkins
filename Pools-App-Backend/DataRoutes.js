const routes = require("express").Router();
// Import authenticator middleware from authenticator.js
const auth = require('./authenticator')
    // Import the DB class from DbOperations
const DB = require('./DbOperations')
    // Create db class object
const db = new DB()

// To change the data manipulation functions modify the DbOperations class instead of this file
// calls the auth middleware to check the permissions of the user logged in

// Gets data from DB => db.gedData()
routes.get('/getData', auth, async(req, res) => {
    try {
        const data = await db.getData(req.app.get('dbEnabled'))
        if (data == 500)
            throw new Error
        res.status(200).send({ status: 200, dbContent: data })
    } catch (error) {
        res.status(500).send("Something Went Wrong!")
    }

})

// Update data into DB => db.editData()
routes.post('/updateData', auth, async(req, res) => {
    try {
        const requestStatus = await db.editData(req.body, req.app.get('dbEnabled'))
        if (requestStatus == 500)
            throw new Error
        res.status(200).send({ message: "Data Edited Sucessfully!", status: 200 })
    } catch (error) {
        res.status(500).send({ message: "Something Went Wrong!", status: 500 })
    }
})

// Add data into DB =? db.addData()
routes.post('/addData', auth, async(req, res) => {
    try {
        const requestStatus = await db.addData(req.body, req.app.get('dbEnabled'))
        if (requestStatus == 500)
            throw new Error
        res.status(200).send({ message: "Data Inserted Sucessfully!", status: 200 })
    } catch (error) {
        res.status(500).send("Something Went Wrong!")
    }
})

// Delete data from DB => db.deleteData()
routes.post('/deleteData', auth, async(req, res) => {
    try {
        const requestStatus = await db.deleteData(req.body, req.app.get('dbEnabled'))
        if (requestStatus == 500)
            throw new Error
        res.status(200).send({ message: "Data Deleted Sucessfully!", status: 200 })
    } catch (error) {
        res.status(500).send({ message: "Something Went Wrong!", status: 200 })
    }
})

module.exports = routes;