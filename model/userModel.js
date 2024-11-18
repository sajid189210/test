const mongoose = require ('mongoose');

//connecting with db
mongoose.connect ( process.env.MONGODB_URI )
.then( () => {
  console.log( 'connected to db' );
}).catch ( (err) =>{
  console.error( `Connecting to db: ${ err }` );;
} );


//defining the schema
const userSchema = new mongoose.Schema ({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});


//creating index on email
userSchema.index( { email: 1 } );


//defining the db model

const User = mongoose.model ('userdetails', userSchema);

module.exports = User;