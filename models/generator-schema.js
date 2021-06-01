const mongo = require('mongoose')

const Schema = new mongo.Schema({
    Guild: String,
    Channel: String,
    Category: String,
})

module.exports = mongo.model('generator', Schema);