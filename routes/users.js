let express = require('express')
let router = express.Router()
let passport = require('passport')
let bcrypt = require('bcryptjs')
let nodemailer = require('nodemailer')

// Get User model
let User = require('../models/user')


/*
 * Get register
 */
router.get('/register', (req, res) => {
  res.render('admin/register', {
    title: "Register"
  })
})

/*
 * POST register
 */
router.post('/register', (req, res) => {
  let {
    name,
    email,
    username,
    password,
    password2
  } = req.body
console.log(req);
  req.checkBody('name', 'Name is required!').notEmpty()
  req.checkBody('email', 'Email is required!').isEmail()
  req.checkBody('username', 'Username is required!').notEmpty()
  req.checkBody('password', 'Password is required!').notEmpty()
  req.checkBody('password2', 'Passwords do not match!').equals(password)

  let errors = req.validationErrors()

  if (errors) {
    res.render('admin/register', {
      errors: errors,
      user: null,
      title: "Register"
    })
  } else {
    User.findOne({
      username: username
    }, (err, user) => {
      if (err) console.log(err);
      if (user) {
        req.flash('danger', 'Username exists, choose another.')
        res.redirect('/users/register')
      } else {
        let user = new User({
          name: name,
          email: email,
          username: username,
          password: password,
          admin: 0
        })
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) console.log(err);
            user.password = hash

            user.save((err) => {
              if (err) {
                console.log(err);
              } else {
                let mailTransporter = nodemailer.createTransport({
                  service:'gmail',
                  auth:{
                    user: 'webdev15121985@gmail.com',
                    pass: 'crqftepjimrdmphd'
                  }
                })
                let msg = {
                  from: 'webdev15121985@gmail.com',
                  to: `${email}`,
                  subject: "Thank you for registering!",
                  html: `<h1>Here is a discount code to help get started!</h1>
                  <p>WELCOME15</p>
                  `
                }
                mailTransporter.sendMail(msg, (err)=>{
                  if (err){
                      console.log('Mail did not send');
                    }else{
                      console.log('Mail sent.');
                      req.flash('success', 'You are now registered')
                                    res.redirect('/users/login')
                    }
                })
                
              }
            })
          })
        })
      }
    })
  }
})


/*
 * Get login
 */
router.get('/login', (req, res) => {

  if (res.locals.user) res.redirect('/')

  res.render('admin/login', {
    title: "Log in"
    
  })

})

/*
 * POST login
 */
router.post('/login', (req, res, next) => {

  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)

})

/*
 * Get logout
 */
router.get('/logout', (req, res) => {

  req.logout((err) => {
    if (err) console.log(err);
  })

  req.flash('success', 'You are logged out.')
  res.redirect('/users/login')

})

/*
 * GET reset password request
 */
router.get('/reset', (req, res)=>{
res.render('admin/reset_pass_req',{
  title: "Reset Password"
})
})

/*
 * POST reset password request
 */
router.post('/reset', (req, res)=>{
 let {
    email
  } = req.body

  
  req.checkBody('email', 'Email is required!').isEmail()
 

  let errors = req.validationErrors()

if (errors) {
    res.render('admin/reset_pass_req', {
      errors: errors,
      user: null,
      title: "Reset Password"
    })
  }else{
                let mailTransporter = nodemailer.createTransport({
                  service:'gmail',
                  auth:{
                    user: 'webdev15121985@gmail.com',
                    pass: 'crqftepjimrdmphd'
                  }
                })
                let msg = {
                  from: 'webdev15121985@gmail.com',
                  to: `${email}`,
                  subject: "Reset your password",
                  html: `<p>Click <a href="http://localhost:3008/users/reset-pass">here</a> to reset your password</p>`
                }
                mailTransporter.sendMail(msg, (err)=>{
                   if (err){
                      console.log('Mail did not send');
                    }else{
                      console.log('Mail sent.');
                      req.flash('success', 'Email sent')
                                    res.redirect('/users/login')
                    }
                })
  }
  
})


/*
 * GET reset password 
 */
router.get('/reset-pass', (req, res)=>{
res.render('admin/reset_pass',{
  title: "Reset Password"
})
})

/*
 * POST reset password 
 */
router.post('/reset-pass', (req, res)=>{
let {
  email,
  password,
  password2
}=req.body

  req.checkBody('email', 'Email is required!').isEmail()
  req.checkBody('password', 'Password is required!').notEmpty()
  req.checkBody('password2', 'Passwords do not match!').equals(password)

  let errors = req.validationErrors()

  if (errors) {
    res.render('admin/reset_pass', {
      errors: errors,
      user: null,
      title: "Reset Password"
    })
  }else{
    User.findOne({
      email:email
    }, (err, user)=>{
      user.password=password
      bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) console.log(err);
            user.password = hash
      user.save((err)=>{
        if (err){
console.log(err);
        }else{
          req.flash('success', 'Password reset!')
          res.redirect('/users/login')
        } 

      })
      })
      })
    })
  }

})

//Exports
module.exports = router