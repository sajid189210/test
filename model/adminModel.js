const mongoose = require ('mongoose');


//connecting with MongoDB.
mongoose.connect( process.env.MONGODB_URI )
.then( ()=> {
    console.log( 'Connected to MongoDB.' );    
} ).catch( err => {
    console.error( `Error caught while connecting to MongoDB ${ err }` );    
} );

//creating admin schema
const adminSchema = new mongoose.Schema( {
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
} );

//indexing admin email for query performance.
adminSchema.index( { email: 1 } );

//defining admin model.
const Admin = mongoose.model( 'admindetails', adminSchema );

module.exports = Admin;

