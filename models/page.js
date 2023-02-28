let mongoose = require('mongoose')

//Page schema

let pageSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String
  },
  content: {
    type: String,
    required: true
  },
  sorting: {
    type: Number
  }
})

let Page = module.exports = mongoose.model('Page', pageSchema)