const express = require('express'),
  morgan = require('morgan');

const app = express();

app.use(morgan('common'));

const bodyParser = require('body-parser'),
  methodOverride = require('method-override');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
app.use(methodOverride());

app.use((err, req, res, next) => {
  // logic
});


let topMovies = [
  {
    title: 'A Silent Voice',
    author: 'Naoko Yamada'
  },
  {
    title: 'Pulp Fiction',
    author: 'Quentin Tarantino'
  },
  {
    title: 'Joker',
    author: 'Todd Phillips'
  },
  {
    title: 'The Wolf of Wall Street',
    author: 'Martin Scorsese'
  },
  {
    title: 'Requiem for a Dream',
    author: 'Darren Aronofsky'
  },
  {
    title: 'The Irishman',
    author: 'Martin Scorsese'
  },
  {
    title: 'Rocky IV',
    author: 'Sylvester Stallone'
  },
  {
    title: 'Forrest Gump',
    author: 'Robert Zemeckis'
  },
  {
    title: 'Mr. Nobody',
    author: 'Jaco Van Dormael'
  },
  {
    title: 'Jurassic Park',
    author: 'Steven Spielberg'
  }
];

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to the top 10 movies!');
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});


// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
