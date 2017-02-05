'use strict'

// useful for fetching secrets from .env file and adding them to process.env
require('dotenv').config()

const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const msg = require('gulp-messenger')
const chalk = require('chalk')
const _ = require('lodash')

const { reblogPost } = require('./tumblrUtils.js')

const app = express()

const _session = session({
  isAuthenticated: false,
  secret: 'dragon',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 60 * 60 * 1000,
  },
})

app.set('view engine', 'pug')
app.set('port', (process.env.PORT || 3000))

app.use(_session)
app.use(express.static(__dirname + '/public'))  // static directory
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const requireLogin = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next() // allow the next route to run
  } else {
    res.redirect('/login')
  }
}

app.get('/login', (req, res) => {
  res.render('login.pug')
})

app.post('/login', (req, res) => {
  if (req.body.password === process.env.LOGIN_PASSWORD) {
    req.session.isAuthenticated = true
    res.redirect('/')
  } else {
    req.session.isAuthenticated = false
    res.render('login.pug', {
      status: 'Password is Incorrect!',
    })
  }
})

// Password protected routes
app.use('/', requireLogin)
app.use('/reblog-post', requireLogin)

app.get('/', (req, res) => {
  res.render('index.pug');
});

app.post('/reblog-post', (req, res) => {
  reblogPost(req.body.url).then(() => {
    res.render('index.pug', {
      reblogged: true,
    })
  }).catch(err => {
    res.render('index.pug', {
      error: err,
    })
  })
})

// start listening
app.listen(app.get('port'), () => {
  msg.log('\n')
  console.log(chalk.cyan('Server Started ' + new Date()));
  msg.log('\n')
  const serverInfo = chalk.yellow(`http://localhost:${app.get('port')}`);
  msg.success('=', _.pad(`Application Running On: ${serverInfo}`, 80), '=')
})
