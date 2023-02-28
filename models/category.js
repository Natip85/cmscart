let mongoose = require('mongoose')

//category schema

let categorySchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String
  }
})

let Category = module.exports = mongoose.model('category', categorySchema)