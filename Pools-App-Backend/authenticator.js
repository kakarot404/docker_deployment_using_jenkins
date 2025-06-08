const jwt = require('jsonwebtoken')
const userOperations = require("./UserOperations")
const userDb = new userOperations()
    // middleware to check users permissions
    // Checks if auth is enabled and proceeds accordingly
    // checks the user based on the 'Authorization' header which holds the token if auth is enabled

const auth = async(req, res, next) => {
    if (req.app.get('authEnabled') == true) {
        try {
            const token = req.header('Authorization').replace('Bearer ', '')
            const data = jwt.verify(token, "CHIMI143CHANGA")
            const user = await userDb.getUser({ _id: data._id, 'token': token })
            if (user == 500) {
                throw new Error()
            }
            req.user = user
            req.token = token
            next()
        } catch (error) {
            res.status(401).send({ error: 'Not authorized to access this resource' })
        }
    } else {
        next()
    }


}
module.exports = auth