const mongoose = require("mongoose")
const UserModel = require("./UserSchema")
    // This class performs user authentication actions
    // Each function performs different actions on users
    // The current cofiguration is MongDB hence it calls model from UserSchema.js

class USER {
    constructor() {}

    // login user
    async login(email, password) {
        try {
            const user = await UserModel.findByCredentials(email, password)
            if (!user) {
                return 401
            }
            const token = await user.generateAuthToken()
            return ({ userID: user._id, token: token })
        } catch (error) {
            return 400
        }
    }

    // logout user
    async logout(userID, userToken) {
        try {
            var flag = 0
            const currentUser = await UserModel.findOne({ _id: userID })
            currentUser.tokens = currentUser.tokens.filter((token) => {
                if (token.token == userToken) {
                    flag = 1
                    return token.token != userToken
                }
            })
            await currentUser.save()
            if (flag != 1) {
                flag = 0
                return 400
            }
            return 200
        } catch (error) {
            return 500
        }

    }

    // logout user from all sessions
    async logoutAll(userID, userToken) {
        try {
            const currentUser = await UserModel.findOne({ _id: userID })
            currentUser.tokens = []
            await currentUser.save()
            return 200
        } catch (error) {
            return 500
        }
    }

    // register new user
    async addUser(userDetails) {
        try {
            const user = new UserModel(userDetails)
            await user.save()
            return { status: 200, message: "User registered successfully!!!" }
        } catch (error) {
            return { status: 400, message: "User already exists!!!" }
        }

    }

    // delete user
    async delUser(userDetails) {
        try {
            await UserModel.deleteOne({ _id: userDetails._id, "tokens.token": userDetails.token })
            return 200
        } catch (error) {
            return 500
        }

    }

    async getUser(userDetails) {
        try {
            const currentUser = await UserModel.findOne({ _id: userDetails._id, "tokens.token": userDetails.token })
            return ({
                "email": currentUser.email,
                "name": currentUser.name
            })
        } catch (error) {
            return (500)
        }
    }
}

module.exports = USER