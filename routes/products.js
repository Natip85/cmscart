let express = require('express')
let router = express.Router()
let fs = require('fs-extra')


// Get product model
let Product = require('../models/product')

// Get category model
let Category = require('../models/category')
const {
  fstat
} = require('fs-extra')

/*
 * GET all products
 */
router.get('/', (req, res) => {
  Product.find((err, products) => {
    if (err)
      console.log(err);
    res.render('all_products', {
      title: 'All products',
      products: products
    })
  })
})

/*
 * GET products by category
 */
router.get('/:category', (req, res) => {
  let categorySlug = req.params.category
  Category.findOne({
    slug: categorySlug
  }, (err, c) => {
    Product.find({
      category: categorySlug
    }, (err, products) => {
      if (err)
        console.log(err);
      res.render('cat_products', {
        title: c.title,
        products: products
      })
    })
  })

})

/*
 * GET product detials
 */
router.get('/:category/:product', (req, res) => {

  let galleryImages = null
  Product.findOne({
    slug: req.params.product
  }, (err, product) => {
    if (err) {
      console.log(err);
    } else {
      let galleryDir = 'public/product_images/' + product._id + '/gallery'
      fs.readdir(galleryDir, (err, files) => {
        if (err) {
          console.log(err);

        } else {
          galleryImages = files
          res.render('product', {
            title: product.title,
            p: product,
            galleryImages: galleryImages
          })
        }
      })
    }
  })
})




//Exports
module.exports = router