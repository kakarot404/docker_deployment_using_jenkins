const validator = require('validator')
const mongoose = require('mongoose')
    // MongoDB schema for Data

const dataSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    occupation: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
    }
})

const DataModel = mongoose.model('Data', dataSchema)

module.exports = DataModel