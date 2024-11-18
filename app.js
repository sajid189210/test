const express = require ('express');
const path = require ('path');
const env = require ('dotenv').config ();
const noCache = require( 'nocache' );
const session = require( 'express-session' );

const app = express ();

//to prevent caching all routes
app.use( noCache() );


//session
app.use( session ( {
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false
} ) );


//requiring the user router
const userRouter = require( './routes/user' );

//requiring the admin router.
const adminRouter = require( './routes/admin' );


//setting the render engine and the path
app.set ('views', path.join ( __dirname, 'views' ) );
app.set ('view engine', 'ejs');


//serving static files ( public )
app.use (express.static ( path.join (__dirname, 'public') ) );


// parsing the data submitted via POST method into a req.body
app.use( express.urlencoded( { extended: true } ) );

//parsing json body request
app.use( express.json() );


//admin router.
app.use( '/admin', adminRouter );

//user router
app.use( '/user',  userRouter);


//setting the server.
const PORT = process.env.PORT || 8000;
app.listen (PORT, error => {
  if (error) console.error (`Error running the server on port ${PORT}`);
  else console.log (`Server successfully running on port ${PORT}`);
});
