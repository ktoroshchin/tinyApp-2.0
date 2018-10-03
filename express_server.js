'use strict';

var express = require('express');

var app = express();

var PORT = 8080;

const bodyParser = require("body-parser");

const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static('./public'));

app.use(cookieParser());

app.set('view engine', 'ejs');

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  },
  'user3RandomID': {
    id: 'user3RandomID',
    email: 'k.toroshchin@gmail.com',
    password: 'montreal'
  }
};

var urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.userName
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  res.render('registration_form')
});

//updates a long url in database
app.post('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const shortRandomURL = generateRandomUrl();
  urlDatabase[shortRandomURL] = req.body.longURL;
  res.redirect(`/urls/${shortRandomURL}`);
});

//deletes the short url from database
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls')
});

//storing cookies when user inputs a name
app.post('/login', (req, res) => {
  res.cookie('userName', req.body.userName)
  res.redirect('/urls');
});

//deleting cookie when user click logout button
app.post('/logout', (req, res) => {
  res.clearCookie('userName');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  if (!req.body.password || !req.body.email) {
    res.status(400).send('Please put valid email and password');
  } else if (checkIfEmailExist(req.body.email)) {
    res.status(400).send('This email is taken');
  } else {
    const randomUserId = generateRandomUrl();
    const newUser = {
      id: randomUserId,
      password: req.body.password,
      email: req.body.email
    };

    users[randomUserId] = newUser;
    res.cookie('id', users[randomUserId].id);
    res.redirect('/urls');
    console.log(users);
    console.log(req.body.email);
  }
});

function checkIfEmailExist(fun) {
  for (var key in users) {
    console.log(users[key].email)
    if(users[key].email === fun){
      return true
    }
  }
}

function authenticateUser(email, password) {
  for (const userId in users) {
    if (users[userId].password === password && users[userId].email === email) {
      var user = users[userId];
    }
  }
  return user;
}

function generateRandomUrl() {
  const characters = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'a', 'b', 'c', 'd', 'e', 'x', 'w', 'r', 'g', 'p'];
  const strLength = 6;
  let randomized = '';
  for (var i = 0; i < strLength; i++) {
    let randomIndex = characters[Math.floor(Math.random() * characters.length)];
    randomized = randomized.concat(randomIndex);
  }
  return randomized;
}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
