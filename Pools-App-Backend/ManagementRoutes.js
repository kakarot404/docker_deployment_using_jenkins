const routes = require("express").Router();
const fs = require('fs')

// Returns the config
routes.get('/getConfig', async(req, res) => {
    res.status(200).send({
        "status": 200,
        "authEnabled": req.app.get('authEnabled'),
        "dbEnabled": req.app.get('dbEnabled')
    })
})

// Updates the config and writes it onto the file
routes.post('/updateConfig', async(req, res) => {
    fs.writeFileSync('./config.json', JSON.stringify(req.body))
    res.status(200).send({ status: 200 })
})

module.exports = routes