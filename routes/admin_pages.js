const {
  render
} = require('ejs')
let express = require('express')
let router = express.Router()
let auth = require('../config/auth')
let isAdmin = auth.isAdmin


// Get page model
let Page = require('../models/page')

/*
 * GET pages index
 */
router.get('/', isAdmin, (req, res) => {
  Page.find({}).sort({
    sorting: 1
  }).exec((err, pages) => {
    res.render('admin/pages', {
      pages: pages
    })
  })
})

/*
 * GET add page
 */
router.get('/add-page', isAdmin, (req, res) => {
  let title = ''
  let slug = ''
  let content = ''
  res.render('admin/add_page', {

    title: title,
    slug: slug,
    content: content
  })
})

/*
 * POST add page
 */
router.post('/add-page', (req, res) => {
  req.checkBody('title', 'The title must have a value').notEmpty()
  req.checkBody('content', 'The content must have a value').notEmpty()

  let title = req.body.title
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase()
  if (slug == '') slug = title.replace(/\s+/g, '-').toLowerCase()
  let content = req.body.content

  let errors = req.validationErrors()

  if (errors) {
    console.log(errors);
    res.render('admin/add_page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content
    })
  } else {
    Page.findOne({
      slug: slug
    }, (err, page) => {
      if (page) {
        req.flash('danger', 'Page slug exists, choose another.')
        res.render('admin/add_page', {
          title: title,
          slug: slug,
          content: content
        })
      } else {
        let page = new Page({
          title: title,
          slug: slug,
          content: content,
          sorting: 100
        })
        page.save((err) => {
          if (err) return console.log(err);
          Page.find({}).sort({
            sorting: 1
          }).exec(function (err, pages) {
            if (err) {
              console.log(err);
            } else {
              req.app.locals.pages = pages
            }
          })
          req.flash('success', 'Page added!')
          res.redirect('/admin/pages')
        })
      }
    })
  }

})


//sort pages function
function sortPages(ids, callback) {
  let count = 0
  for (let i = 0; i < ids.length; i++) {
    let id = ids[i]
    count++
    (function (count) {
      Page.findById(id, (err, page) => {
        page.sorting = count
        page.save((err) => {
          if (err) return console.log(err);
          ++count
          if (count >= ids.length) {
            callback()
          }
        })
      })
    })(count)
  }
}

/*
 * POST reorder pages
 */
router.post('/reorder-pages', (req, res) => {
  let ids = req.body['id[]']
  sortPages(ids, () => {
    Page.find({}).sort({
      sorting: 1
    }).exec(function (err, pages) {
      if (err) {
        console.log(err);
      } else {
        req.app.locals.pages = pages
      }
    })
  })
})


/*
 * GET edit page
 */
router.get('/edit-page/:id', isAdmin, (req, res) => {
  Page.findById(req.params.id, (err, page) => {
    if (err) return console.log(err);

    res.render('admin/edit_page', {

      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id
    })
  })

})


/*
 * POST edit page
 */
router.post('/edit-page/:id', (req, res) => {
  req.checkBody('title', 'The title must have a value').notEmpty()
  req.checkBody('content', 'The content must have a value').notEmpty()

  let title = req.body.title
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase()
  if (slug == '') slug = title.replace(/\s+/g, '-').toLowerCase()
  let content = req.body.content
  let id = req.params.id

  let errors = req.validationErrors()

  if (errors) {
    console.log(errors);
    res.render('admin/edit_page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
      id: id
    })
  } else {
    Page.findOne({
      slug: slug,
      _id: {
        '$ne': id
      }
    }, (err, page) => {
      if (page) {
        req.flash('danger', 'Page slug exists, choose another.')
        res.render('admin/edit_page', {
          title: title,
          slug: slug,
          content: content,
          id: id
        })
      } else {
        Page.findById(id, (err, page) => {
          if (err) return console.log(err);
          page.title = title
          page.slug = slug
          page.content = content

          page.save((err) => {
            if (err) return console.log(err);
            Page.find({}).sort({
              sorting: 1
            }).exec(function (err, pages) {
              if (err) {
                console.log(err);
              } else {
                req.app.locals.pages = pages
              }
            })
            req.flash('success', 'Page edited!')
            res.redirect('/admin/pages/edit-page/' + id)
          })
        })

      }
    })
  }

})


/*
 * GET delete page
 */
router.get('/delete-page/:id', isAdmin, (req, res) => {
  Page.findByIdAndRemove(req.params.id, (err) => {
    if (err) return console.log(err);
    Page.find({}).sort({
      sorting: 1
    }).exec(function (err, pages) {
      if (err) {
        console.log(err);
      } else {
        req.app.locals.pages = pages
      }
    })
    req.flash('success', 'Page deleted.')
    res.redirect('/admin/pages/')
  })
})



//Exports
module.exports = router