'use strict'

const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const msg = require('gulp-messenger')
const chalk = require('chalk')
const _ = require('lodash')

const app = express()

const sess = session({
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

app.use(sess)
app.use(express.static(__dirname + '/public'))  // static directory
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const requireLogin = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next() // allow the next route to run
  } else {
    // require the user to log in
    res.redirect('/login'); // or render a form, etc.
  }
}

app.get('/login', (req, res) => {
  res.render('login.pug')
})

app.post('/login', (req, res) => {
  if (req.body.password === 'asd') {
    req.session.isAuthenticated = true
    res.redirect('/')
  } else {
    req.session.isAuthenticated = false
    res.status(403).send('Unauthorized!')
  }
})

app.use('/', requireLogin)
app.get('/', (req, res) => {
  res.render('index.pug', {
    status: '',
  });
});

app.use('/reblog-post', requireLogin)
app.post('/reblog-post', (req, res) => {
  res.render('index.pug', {
    status: _.sample(['reblogged!', 'failed!']),
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
