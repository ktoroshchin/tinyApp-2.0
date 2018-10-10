'use strict';

var express = require('express');

var app = express();

var PORT = 8080;

const bodyParser = require("body-parser");

var cookieSession = require('cookie-session')

const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static('./public'));

app.use(cookieSession({
  name: 'session',
  keys: ['10', '12', '15']
}));

app.set('view engine', 'ejs');

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('purple-monkey-dinosaur', 10)
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('dishwasher-funk',10)
  },
  'user3RandomID': {
    id: 'user3RandomID',
    email: 'k.toroshchin@gmail.com',
    password: bcrypt.hashSync('montreal',10)
  }
};

var urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'userRandomID'
 },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'user2RandomID'
  }
};


//when user visits /urls .get will display urls_index page
app.get('/', (req, res) => {
  if(req.session.user_id) {
    res.redirect('/urls')
  } else {
    res.redirect('/login')
  }
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: displayUserOwnedUrls(urlDatabase,req.session.user_id),
    username: users[req.session.user_id]
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  if(req.session.user_id) {
    res.render('urls_show', templateVars);
  } else {
    res.redirect('/login')
  }
});

app.get('/u/:shortURL' , (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  res.render('registration_form');
});

//updates a long url in database
app.post('/urls/:shortURL', (req, res) => {
  var currentUserId = req.session.user_id
  let shortURL = req.params.shortURL;
  if(urlDatabase[shortURL].userID === currentUserId) {
    urlDatabase[shortURL].longURL = req.body.longURL;
  } else {
   res.send('Not your URL')
   return;
  }
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const shortRandomURL = generateRandomUrl();
  urlDatabase[shortRandomURL] = {longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortRandomURL}`);
});

//deletes the short url from database
app.post('/urls/:id/delete', (req, res) => {
  var currentUserId = req.session.user_id
  if(urlDatabase[req.params.id].userID === currentUserId) {
    delete urlDatabase[req.params.id];
  } else {
   res.send('Not your URL');
   return;
  }
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  res.render('login');
});

//storing cookies when user inputs a name
app.post('/login', (req, res) => {
  if(!req.body.password || !req.body.email) {
    res.status(400).send('Please put valid email and password');
  } else if (!checkIfEmailExist(req.body.email) || !bcrypt.compareSync(req.body.password, users[returnLogedInUserId(req.body.email)].password)) {
    res.status(400).send('Wrong email or password');
  } else {
    req.session.user_id = returnLogedInUserId(req.body.email);
    res.redirect('/urls');
  }
});

//deleting cookie when user click logout button
app.post('/logout', (req, res) => {
  req.session.user_id = null;
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
      password: bcrypt.hashSync(req.body.password,10),
      email: req.body.email
    };
    users[randomUserId] = newUser;

    req.session.user_id = users[randomUserId].id;
    res.redirect('/urls');
  }
});

function returnLogedInUserId (email) {
  for(const user in users) {
    if(users[user].email  === email){
      return users[user].id;
    }
  }
}

function checkIfEmailExist(email) {
  for (const user in users) {
    if(users[user].email === email){
      return true;
    }
  }
}

function generateRandomUrl() {
  const characters = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'a', 'b', 'c', 'd', 'e', 'x', 'w', 'r', 'g', 'p'];
  const strLength = 6;
  let randomized = '';
  for (let i = 0; i < strLength; i++) {
    let randomIndex = characters[Math.floor(Math.random() * characters.length)];
    randomized = randomized.concat(randomIndex);
  }
  return randomized;
}

function displayUserOwnedUrls (urlDatabase, userId) {
  const urlList = {};
  for(const shortUrl in urlDatabase) {
    if(userId === urlDatabase[shortUrl].userID) {
      urlList[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return urlList;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
