const User = require ( '../model/userModel' );
const bcrypt = require( 'bcrypt' );

// validating loginCredentials
const authenticateUser = async ( req ) => {
    const { email, password }  = req.body;
    try {
        // checking if the user exists.
        const user = await User.findOne( { email } );
        if ( !user ) {
            req.session.userInvalidEmailMessage = "User not exist. Create an account*";
            return false;
        }

        //comparing the password against the original password.
        //checking if the password is the same as the one in the db in hashed form.
        const isMatch = await bcrypt.compare( password, user.password );
        if( !isMatch ) {
            req.session.userInvalidPasswordMessage = "Incorrect password*";
            return false;
        }
        return user;
    } catch( err ) {
        console.error( `Error caught on authenticateUser ${ err }` );
    }
}

module.exports = {
    authenticateUser
}