const express = require('express');
require('dotenv').config();
const handlebars = require('express-handlebars');
const clubRoutes = require('./routes/clubRoutes-v2');
const playerRoutes = require('./routes/playerRoutes');

const PORT = process.env.PORT || 4000;
const app = express();
const hbs = handlebars.create();

// Settings
app.set('port', PORT);

// Set View Engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.static('public'));

/* ----- Middleware ----- */
// Body parser
app.use(express.json());

// Routing
app.use('/clubs', clubRoutes);
app.use('/players', playerRoutes);

app.get('/', (req, res) => {
  res.render('homePage', {
    layout: 'index',
    data: { title: 'Premier League Database' }
  });
});

app.get('/about', (req, res) => {
  res.render('aboutPage', {
    layout: 'index',
    data: { title: 'About this project' }
  });
});

app.get('/contact', (req, res) => {
  res.render('contactPage', {
    layout: 'index',
    data: { title: 'Contact me' }
  });
});

app.get(/.+/g, (req, res) => {
  res.status(400).render('clubListPage', {
    layout: 'index',
    data: {
      playerInfo: {},
      message: { text: 'Sorry, but the page you were trying to view does not exist.' },
      title: 'Page not found'
    }
  });
});

app.listen(app.get('port'), () => console.log(`Server on port ${app.get('port')}`));
