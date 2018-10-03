'use strict';

var express = require('express');

var app = express();

var PORT = 8080;

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('./public'));

app.set('view engine', 'ejs');


var urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

//updates a long url in database
app.post('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});


app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
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
