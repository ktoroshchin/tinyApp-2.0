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
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: displayUserOwnedUrls(urlDatabase,req.cookies['user_id']),
    username: users[req.cookies['user_id']]
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
  console.log(templateVars.shortUrl)
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  res.render('registration_form')
});

//updates a long url in database
app.post('/urls/:shortURL', (req, res) => {
  var currentUserId = req.cookies.user_id
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
  urlDatabase[shortRandomURL] = {longURL: req.body.longURL, userID: req.cookies.user_id };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortRandomURL}`);
});

//deletes the short url from database
app.post('/urls/:id/delete', (req, res) => {
  var currentUserId = req.cookies.user_id
  if(urlDatabase[req.params.id].userID === currentUserId) {
    delete urlDatabase[req.params.id];
  } else {
   res.send('Not your URL')
   return;
  }


  res.redirect('/urls')
});

app.get('/login', (req, res) => {
  res.render('login')
});

//storing cookies when user inputs a name
app.post('/login', (req, res) => {
  if(!req.body.password || !req.body.email) {
    res.status(400).send('Please put valid email and password');
  } else if (!checkIfEmailExist(req.body.email) || (!checkIfPasswordMatch(req.body.password))) {
    res.status(400).send('Wrong email or password');
  } else {
    res.cookie('user_id', returnLogedInUserId(req.body.email));
    res.redirect('/urls');
  }
});

//deleting cookie when user click logout button
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
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
    res.cookie('user_id', users[randomUserId].id);
    res.redirect('/urls');
    console.log(users);
    console.log(req.body.email);
  }
});

function returnLogedInUserId (email) {
  for(var key in users) {
    if(users[key].email  === email){
      return users[key].id
    }
  }
}

function returnUserId (userID) {
  for(var key in users) {
    if(users[key].id  === userID){
      return users[key].id
    }
  }
}

function checkIfEmailExist(email) {
  for (var key in users) {
    if(users[key].email === email){
      return true
    }
  }
}


function checkIfPasswordMatch(password) {
  for (var key in users) {
    if(users[key].password === password){
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

function displayUserOwnedUrls (urlDatabase, userId) {
  var obj = {};
  for(var i in urlDatabase) {
    if(userId === urlDatabase[i].userID) {
      obj[i] = urlDatabase[i];
    }
  }
  return obj;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
