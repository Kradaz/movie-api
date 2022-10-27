const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  {check, validationResult } = require('express-validator');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  app.use(bodyParser.json());

let auth = require('./auth')(app);
const cors = require('cors');
app.use(cors());
const passport = require('passport');
require('./passport');

let users = [
  {
    id: 1,
    name: "Alex",
    favoriteMovies: []
  },
  {
    id: 2,
    name: "Jade",
    favoriteMovies: ['Joker']
  },
]


let topMovies = [
  {
    Title: 'A Silent Voice',
    Description: 'The film covers elements of coming of age and psychological drama that deals with themes of bullying, disability, forgiveness, mental health, suicide, and platonic love where it follows the story with compassion and understanding involves the former bully turned social outcast, who decides to reconnect and befriend the deaf girl he had victimized years prior.',
    Genre: {
        Name: 'Drama',
        Description: 'The drama genre features stories with high stakes and a lot of conflicts. They are plot-driven and demand that every character and scene move the story forward. Dramas follow a clearly defined narrative plot structure, portraying real-life scenarios or extreme situations with emotionally-driven characters.',
    },
    Author: 'Naoko Yamada',
  },
  {
    Title: 'Pulp Fiction',
    Description: 'In the realm of underworld, a series of incidents intertwines the lives of two Los Angeles mobsters, a gangsters wife, a boxer and two small-time criminals.',
    Genre: {
        Name: 'Crime',
        Description: 'Crime fiction is the genre of fiction that deals with crimes, their detection, criminals, and their motives.',
    },
    Author: 'Quentin Tarantino',
  },
  {
    Title: 'Joker',
    Description: 'Arthur Fleck, a party clown, leads an impoverished life with his ailing mother. However, when society shuns him and brands him as a freak, he decides to embrace the life of crime and chaos',
    Genre: {
        Name: 'Crime',
        Description: 'Crime fiction is the genre of fiction that deals with crimes, their detection, criminals, and their motives.',
    },
    Author: 'Todd Phillips'
  },
  {
    Title: 'The Wolf of Wall Street',
    Description: 'Introduced to life in the fast lane through stockbroking, Jordan Belfort takes a hit after a Wall Street crash. He teams up with Donnie Azoff, cheating his way to the top as his relationships slide.',
    Genre: {
        Name: 'Drama',
        Description: 'The drama genre features stories with high stakes and a lot of conflicts. They are plot-driven and demand that every character and scene move the story forward. Dramas follow a clearly defined narrative plot structure, portraying real-life scenarios or extreme situations with emotionally-driven characters.',
    },
    Author: 'Martin Scorsese'
  },
  {
    Title: 'Requiem for a Dream',
    Description: 'Sara, a widow who lives a retired life, develops an obsession to lose weight and starts taking pills. However, she gets addicted to the medication and it takes a toll on her mental health.',
    Genre: {
        Name: 'Thriller',
        Description: 'Thriller is a genre of fiction, having numerous, often overlapping subgenres. Thrillers are characterized and defined by the moods they elicit, giving viewers heightened feelings of suspense, excitement, surprise, anticipation and anxiety.',
    },
    Author: 'Darren Aronofsky'
  },
  {
    Title: 'The Irishman',
    description: 'In the 1950s, truck driver Frank Sheeran gets involved with Russell Bufalino and his Pennsylvania crime family. As Sheeran climbs the ranks to become a top hit man, he also goes to work for Jimmy Hoffa -- a powerful Teamster tied to organized crime.',
    Genre: {
        Name: 'Crime',
        Description: 'Crime fiction is the genre of fiction that deals with crimes, their detection, criminals, and their motives.',
    },
    Author: 'Martin Scorsese'
  },
  {
    Title: 'Rocky IV',
    Description: 'Rocky trains his friend Apollo Creed in a match against Drago, an indestructible Russian boxer. But when Apollo is killed in the ring during the match, Rocky vows to avenge his friends death.',
    Genre: {
        Name: 'Sport',
        Description: 'A sports film is a film genre that uses sport as the theme of the film.',
    },
    Author: 'Sylvester Stallone'
  },
  {
    Title: 'Forrest Gump',
    Description: 'Forrest, a man with low IQ, recounts the early years of his life when he found himself in the middle of key historical events. All he wants now is to be reunited with his childhood sweetheart, Jenny.',
    Genre: {
        Name: 'Romance',
        Description: 'Romance films or movies involve romantic love stories recorded in visual media for broadcast in theatres or on television that focus on passion, emotion, and the affectionate romantic involvement of the main characters.',
    },
    Author: 'Robert Zemeckis'
  },
  {
    Title: 'Mr. Nobody',
    Description: 'When humans become immortal, a 118-year-old Nemo, Earths last mortal, recounts his life story to a reporter, explaining to him things that he did at various junctures of his life.',
    Genre: {
        Name: 'Sci-fi',
        Description: 'Science fiction is a film genre that uses speculative, fictional science-based depictions of phenomena that are not fully accepted by mainstream science, such as extraterrestrial lifeforms, spacecraft, robots, cyborgs, interstellar travel or other technologies.',
    },
    Author: 'Jaco Van Dormael'
  },
  {
    Title: 'Jurassic Park',
    Description: 'John Hammond, an entrepreneur, opens a wildlife park containing cloned dinosaurs. However, a breakdown of the islands security system causes the creatures to escape and bring about chaos.',
    Genre: {
        Name: 'Action',
        Description: 'Action film is a film genre in which the protagonist is thrust into a series of events that typically involve violence and physical feats',
    },
    Author: 'Steven Spielberg'
  },
];

// CREATE USER

app.post('/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// default text response when at

app.get('/', (req, res) => {
  res.send('Welcome to MyFlix!');
});

// return JSON object when at /movies / Get all movies

app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + err);
  });
});

//GET JSON MOVIE BY TITLE

app.get('/movies/:Title', (req, res) => {
  Movies.findOne({ Title: req.params.Title })
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//GET ALL USERS

app.get('/users', (req,res) => {
  Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + error);
  });
});

//GET USER BY NAME

app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// ALLOW USER TO REGISTER

app.post('/users', (req,res) => {
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if(user) {
      return res.status(400).send(req.body.Username + 'already exists')
    } else {
      Users.create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      })
      .then((user) => {
        res.status(201).json(user);
      })
      .catch((error) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
    }
  });
});

// UPDATE USER BY USERNAME
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true },
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
  }
});
});

// ADD MOVIE TO A USER'S LIST OF FAVORITES

app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
  $push: { favoriteMovies: req.params.MovieID }
},
{ new: true },
(err, updateUser) => {
  if(err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  } else {
    res.json(updateUser);
  }
});
});

// CREATE USER MOVIES' FAV
app.post('/users/:id/:movieTitle', (req, res) =>{
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);;
  } else {
    res.status(400).send('no such user');
  }
})

// DELETE MOVIE FROM USER

app.delete('/users/:id/:movieTitle', (req, res) =>{
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);;
  } else {
    res.status(400).send('no such user');
  }
})

// DELETE USER
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username})
  .then((user) => {
    if(!user) {
      res.status(400).send(req.params.Username + ' was not found');
    } else {
      res.status(200).send(req.params.Username + ' was deleted');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Get genre of movie
app.get('/topMovies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = topMovies.find (movie => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  }else {
    res.status(400).send('no genre')
  }
})

//To get director name
app.get('/topMovies/director/:author', (req, res) => {
  const { author } = req.params;
  const director = topMovies.find (movie => movie.Author === author);

  if (director) {
    res.status(200).json(director);
  }else {
    res.status(400).send('no author')
  }
})


// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
