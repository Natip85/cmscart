let express = require('express')
let path = require('path')
let mongoose = require('mongoose')
let config = require('./config/database')
let bodyParser = require('body-parser')
let session = require('express-session')
let expressValidator = require('express-validator')
let fileUpload = require('express-fileupload')
let passport = require('passport')
mongoose.set('strictQuery', true);

//Connect to db
mongoose.connect(config.database)
let db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
  console.log('Connected to MongoDB');
})

//Init app
let app = express()

//View engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//Set public folder
app.use(express.static(path.join(__dirname, 'public')))

//Set global errors variable
app.locals.errors = null


// Get page model
let Page = require('./models/page')

// Get all pages to pass to header.ejs
Page.find({}).sort({
  sorting: 1
}).exec(function (err, pages) {
  if (err) {
    console.log(err);
  } else {
    app.locals.pages = pages
  }
})

// Get Category model
let Category = require('./models/category')

// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
  if (err) {
    console.log(err);
  } else {
    app.locals.categories = categories
  }
})

//Express fileupload misddleware
app.use(fileUpload())

//body Parser middleware
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

//express sessions middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  // cookie: {
  //   secure: true
  // }
}))

//Express validator middleware
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    let namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']'
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    }
  },
  customValidators: {
    isImage: function (value, filename) {
      let extension = (path.extname(filename)).toLowerCase()
      switch (extension) {
        case '.jpg':
          return '.jpg'
        case '.jpeg':
          return '.jpeg'
        case '.png':
          return '.png'
        case '':
          return '.jpg'
        default:
          return false
      }
    }
  }
}))

//Express messages middleware
app.use(require('connect-flash')())
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

//Passport Config
require('./config/passport')(passport)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.get('*', (req, res, next) => {
  res.locals.cart = req.session.cart
  res.locals.user = req.user || null
  next()
})

//Set routes
let pages = require('./routes/pages.js')
let products = require('./routes/products.js')
let cart = require('./routes/cart.js')
let users = require('./routes/users.js')
let adminPages = require('./routes/admin_pages.js')
let adminCategories = require('./routes/admin_categories.js')
let adminProducts = require('./routes/admin_products.js')

app.use('/admin/pages', adminPages)
app.use('/admin/categories', adminCategories)
app.use('/admin/products', adminProducts)
app.use('/users', users)
app.use('/cart', cart)
app.use('/products', products)
app.use('/', pages)

//Start the server
let port = 3008

app.listen(port, () => {
  console.log('Server started on port ' + port);
})