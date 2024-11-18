const Admin = require( '../model/adminModel' );
const bcrypt = require ( 'bcrypt' );

const authenticateAdmin = async ( req ) => {
    const { email, password } = req.body;
    try {
        //checking if the admin exists in th db.
        const admin = await Admin.findOne( { email } );

        if( !admin ){
            console.warn("Admin does not exist");
            req.session.adminLoginEmailErrorMessage = 'Enter a valid email or sign up*';
            return false;
        }

        //comparing entered password with hashed password.
        const isMatch = await bcrypt.compare( password, admin.password );

        //checking if the password matches.
        if( !isMatch ) {
            console.warn("password does not match hashing");            
            req.session.adminLoginPasswordErrorMessage = 'Incorrect password.'
            return false;
        }
        return admin;
    } catch( err ) {
        console.error( `Error caught on authenticateAdmin: ${ err }` );
        
    }
}


module.exports = {
    authenticateAdmin
};