const mongoose = require('mongoose')
const DbModel = require('./DataSchema')
    // This class performs actions on DB. It is called from the DataRoutes.js
    // Each function first checks if dbEnabled is set to true and then performs actions on the DB or the dummy data
    // The current configuration uses MongoDB hence it calls the models from the functions in the DataSchema.js
    // All operations consider the name to be unique 

class DB {
    constructor() {
        // dummy data if db is not enabled
        this.dummyData = [{
                "name": "John Smith",
                "occupation": "Advisor",
                "age": 36
            },
            {
                "name": "Muhi Masri",
                "occupation": "Developer",
                "age": 28
            },
            {
                "name": "Peter Adams",
                "occupation": "HR",
                "age": 20
            },
            {
                "name": "Lora Bay",
                "occupation": "Marketing",
                "age": 43
            }
        ]
    }

    // gets data from DB
    async getData(dbEnabled) {
        if (dbEnabled) {
            try {
                this.Data = await DbModel.find()
                this.Data.forEach((element, index) => {
                    this.Data[index] = {
                        "name": element.name,
                        "occupation": element.occupation,
                        "age": element.age
                    }
                });
                return this.Data
            } catch (error) {
                return 500
            }
        } else {
            return this.dummyData
        }
    }

    // adds data to the DB
    async addData(dRow, dbEnabled) {
        if (dbEnabled) {
            try {
                const dataRow = new DbModel(dRow)
                await dataRow.save()
                return 200
            } catch (error) {
                return 500
            }
        } else {
            this.dummyData.push(dRow)
            return 200
        }

    }

    // deletes data from DB
    async deleteData(dRow, dbEnabled) {
        if (dbEnabled) {
            try {
                const requestStatus = await DbModel.findOneAndDelete({ "name": dRow.name })
                if (requestStatus == null)
                    throw new Error
                return 200
            } catch (error) {
                return 500
            }
        } else {
            this.dummyData = this.dummyData.filter(row => row.name != dRow.name)
            return 200
        }
    }

    // edits data from DB
    async editData(dRow, dbEnabled) {
        if (dbEnabled) {
            try {
                const requestStatus = await DbModel.findOneAndUpdate({ "name": dRow.name }, { "age": dRow.age, "occupation": dRow.occupation })
                if (requestStatus == null)
                    throw new Error
                return 200
            } catch (error) {
                return 500
            }
        } else {
            this.dummyData = this.dummyData.filter(row => row.name != dRow.name)
            this.dummyData.push(dRow)
            return 200
        }
    }
}

module.exports = DB