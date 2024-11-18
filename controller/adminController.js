const { authenticateAdmin } = require( '../auth/adminLoginAuthentication' );
const userController = require( './userController' );
const Admin = require( '../model/adminModel' );
const User = require('../model/userModel');


/*******************************************SIGNUP CONTROLS******************************************************************/
//checking if the admin exists.
const existingAdmin = async ( req ) => {
    try {
        const email = req.body.email;
        //finding the email in db.
        const isExist = await Admin.findOne( { email } );

        if( isExist ) {
            console.warn( "user Exists" );
            req.session.emailErrorMsg = "Email already exists*";
            return true;
        }
        console.warn( "user does not Exists" );

        return false;
    } catch ( err ){
        console.error( `Error caught existingUser: ${ err }` );
        
    }
}

//match validation function. checking if the email & confirmEmail, password & confirmPassword matches.
const checkMatch = ( req ) => {
    const { email, confirmEmail, password, confirmPassword } = req.body;
    try {
        if( password !== confirmPassword || email !== confirmEmail ) {  

            //checking if the email matches.
            if( email !== confirmEmail ) req.session.adminMismatchEmailErrorMessage = "Email match error.";

            //checking if the password matches.
            if( password !== confirmPassword ) req.session.adminMismatchPasswordErrorMessage = "Password match error.";

            return false;
        }
        return true;
    }catch( err ){
        console.error( `Error caught on signInValidCredentials: ${ err }` );
    }
}

//All admin signUp validations take place here.
const adminSignUpValidation = async ( req, res ) => {
    const { email, password } = req.body;
    try {
        //regex validation - Email
        if( !userController.validEmail( email ) ){
            req.session.adminEmailErrorMessage = 'Please enter a valid email*';
            return res.redirect( '/admin' );
        }

        //regex validation - Password
        if( !userController.validPassword( password ) ) {
            console.warn("password invalid");
            req.session.adminPasswordErrorMessage = 'Please enter a valid password*';
            return res.redirect( '/admin' );
        }

        //checking credentials match
        const isMatch = checkMatch( req );

        //redirecting to admin Account Access page if does not match.
        if( !isMatch ) return res.redirect( '/admin' ); 

        //checking if the admin exists.
        const isExist = await existingAdmin( req );

        // redirecting the admin to Account Access Page if the email exist in the db.
        if( isExist ) return res.redirect( '/admin' );
        return true;
    } catch( err ) {
        console.error( `Error caught on adminSignUpValidation: ${ err }` );
    }

}


//admin signUp validation and save 
const adminSignUp = async ( req, res ) => {
    const { username, email, password } = req.body;
    try {
        //if the validation checks.
        const validated = await adminSignUpValidation( req, res );

        if ( validated ) {
            //waiting for password hashing.
            const hashedPassword = await userController.hashing( password );

            //storing email in the session
            req.session.adminSession = email;

            //assigning admin details to appropriate fields.
            const newAdmin  = new Admin( {
                userName: username,
                email: email,
                password: hashedPassword
            } );

            //saving new admin to the database / handles err.
            try {
                await newAdmin.save();
                return res.redirect( '/admin/homePage' );
            } catch( err ) {
                console.error( `Error caught while saving data in the db: ${ err }` );
            }
        }
    } catch( err ) {
        console.error( `Error caught on adminSignUp: ${ err }` );
    }
}

/***********************************************SIGNUP CONTROLS ENDS*******************************************************************/


/************************************************LOGIN CONTROLS***********************************************************************/

//validating the admin login credentials.
const loginValidation = async ( req, res ) => {
    const { email, password } = req.body;
    try {
        //regex validation - Email
        if( !userController.validEmail( email ) ){
            req.session.adminLoginEmailErrorMessage = 'Please enter a valid email*';
            return res.redirect( '/admin' );
        }

        //regex validation - Password
        if( !userController.validPassword( password ) ) {
            console.warn("password invalid");
            req.session.adminLoginPasswordErrorMessage = 'Please enter a valid password*';
            return res.redirect( '/admin' );
        }

        //checking if the admin is authenticated.
        const admin = await authenticateAdmin( req );

        //redirecting to login page if not authenticated.
        if( !admin ) return res.redirect( '/admin' );

        //storing admindetails to session and redirecting to home page.
        req.session.adminSession = admin;
        return res.redirect( '/admin/homePage' );
    } catch( err ) {
        console.error( `Error caught on admin loginValidation: ${ err }` );
        return res.redirect( '/admin' );
    }
}


//rendering admin account access page.
const accountAccessPage = ( req, res ) => {
    try {
        //if the session has value it will stay in homepage.
        if( req.session.adminSession ){
            console.warn("admin page session on aap");            
            return res.redirect( '/admin/homePage' );
        } else {
            //storing all error messages
            const adminMismatchPasswordErrorMessage = req.session.adminMismatchPasswordErrorMessage || '';
            const adminMismatchEmailErrorMessage = req.session.adminMismatchEmailErrorMessage || '';
            const adminLoginPasswordErrorMessage = req.session.adminLoginPasswordErrorMessage || '';
            const adminLoginEmailErrorMessage = req.session.adminLoginEmailErrorMessage || '';
            const adminPasswordErrorMessage = req.session.adminPasswordErrorMessage || '';
            const adminEmailErrorMessage = req.session.adminEmailErrorMessage || '';
            const emailErrorMsg = req.session.emailErrorMsg || '';

            //setting default values for the error messages
            req.session.adminMismatchPasswordErrorMessage = '';
            req.session.adminMismatchEmailErrorMessage = '';
            req.session.adminLoginPasswordErrorMessage = '';
            req.session.adminLoginEmailErrorMessage = '';
            req.session.adminPasswordErrorMessage  = '';
            req.session.adminEmailErrorMessage = '';
            req.session.emailErrorMsg = '';
            
            //render admin page if an error occur.
            res.render( 'adminAccountAccessPage', { 
                adminMismatchPasswordErrorMessage,
                adminMismatchEmailErrorMessage,
                adminLoginPasswordErrorMessage,
                adminLoginEmailErrorMessage,
                adminPasswordErrorMessage,
                adminEmailErrorMessage,
                emailErrorMsg
            } );
        }
    } catch ( err ) {
        console.error( `Error caught on admin loginPage ${ err }` );
    }
}

/***********************************************lOGIN CONTROLS ENDS*****************************************************************************/


/*************************************************HOME PAGE*****************************************************************/

//updating user details.
const updateUserDetails = async ( req,res ) => {
    const userId = req.params.userId;
    const { email, username } = req.body;
    try {
        //regex validation - Email
        if( !userController.validEmail( email ) ){
            console.log('got in')
            req.session.adminUpdateErrorMessage = 'Please enter a valid email*';
            return res.redirect( '/admin' );
        }

        //updating the user details and return the updated data '{ new: true }'.
        const updatedUser = await User.findByIdAndUpdate( userId, { username, email }, { new: true } );

        //if the update fails it will return success: false.
        if( !updatedUser ) return res.status( 404 ).json( { success: false } );

        //if the update successes it will return success: true.
        return res.json( { success: true, user: updatedUser } );
    } catch ( err ) {
        console.error( `Error caught on updateUserDetails ${ err }` );
        res.status( 500 ).json( { success: false } );
    }
}

//deleting user.
const deleteUser = async ( req, res ) => {
    const userId = req.params.userId;
    try {  
        //deleting the user.
        const deleted = await User.findByIdAndDelete( userId );

        //if the delete fails it will will return success: false.
        if( !deleted ) return res.status( 404 ).json( { success: false } );

        //if the delete successes it will return success: true.
        return res.json( { success: true } );
    }catch ( err ) {
        console.error( `Error caught on deleteUser ${ err }` );
        res.status( 500 ).json( { success: false } );
        
    }
}

//admin userdetails search.
const searchUsers = async ( req, res ) => {
    try {
        // const search = req.params.value || '' ;
        const { search } = req.body;
        const regex = new RegExp( search, 'i' );

        const users = await User.find( { username: regex } );

        if( !users ) return res.redirect( '/admin/homePage', { } );

        res.render( 'adminHomePage', { users } );

    } catch( err ){
        console.error( `Error caught on searchUsers ${ err }` );
        
    }
}

//rendering  admin home page.
const adminHomePage = async ( req, res ) => {
    const adminUpdateErrorMessage = req.session.adminUpdateErrorMessage || '';
    req.session.adminUpdateErrorMessage = '';
    try {
        if( req.session.adminSession ){
            console.warn("homepage session on");

            //getting all the users
            const users = await User.find({});

            if ( !users ) return res.render( 'adminHomePage', {
                users: [],

            } );

            return res.render( 'adminHomePage', { 
                users,
                adminUpdateErrorMessage
            } );
        } else {
            console.warn('homepage session off');
            return res.redirect( '/admin' );
        }
    } catch( err ) {
        console.error( `Error caught on admin home page ${ err }` );
    }
}

//admin home page sign out.
const adminSignOut = ( req, res ) => {
    try {
        req.session.destroy();
        res.redirect( '/admin' );
    } catch ( err ) {
        console.error( `Error caught on adminSignOut: ${ err }` );
    }
}

/*************************************************HOME PAGE ENDS****************************************************************** */



module.exports = {
    accountAccessPage,
    adminSignUp,
    adminHomePage,
    adminSignOut,
    loginValidation,
    updateUserDetails,
    deleteUser,
    searchUsers
}