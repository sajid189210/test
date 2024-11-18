const bcrypt = require ('bcrypt');
const User = require ('../model/userModel');
const { authenticateUser } = require( '../auth/userLoginAuthentication' );


//Email regex validation.
const validEmail = ( email ) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if ( !regex.test( email ) ) return false;
    return true;
}

//Password regex validation.
const validPassword = ( password ) => {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[_@!#$%^&*])[a-zA-Z\d_@!#$%^&*]{6,}$/;
    if ( !regex.test( password ) ) return false;
    return true;
}

//validating email and password format function.
const regexValidation = ( req ) => {
    const { email, password } = req.body;
    let isEmail = true;
    let isPassword = true;    
    try { 
    //regex validation - Email.
    if( !validEmail( email ) ) {
        req.session.userInvalidEmailMessage = 'Please enter a valid email*';
        isEmail = false;
    }

    //regex validation - Password
    if( !validPassword( password ) ) {
        req.session.userInvalidPasswordMessage = 'Please enter a valid password*';
        isPassword = false;
    }

    if( !isEmail || !isPassword ){
        return false;
    }
    return true;
    } catch ( err ) {
        console.error( `Error caught on regexValidation ${ err }` );
    }
}


//function password hashing
const hashing = async password => {
    try {
        const salt = await bcrypt.genSalt ();
        const hashedPassword = await bcrypt.hash (password, salt);
        return hashedPassword;
    } catch (err) {
        console.error (`Error caught on hashing ${ err }`);
    }
};

//checking if the user exists
const existingUser = async ( req ) => {
    const email = req.body.email;
    try {
        //finding the email in db.
        const isExist = await User.findOne( { email } );

        if( isExist ) {
            req.session.emailErrorMsg = "Email already exists*";
            return true;
        }
        return false;
    } catch ( err ){
        console.error( `Error caught existingUser: ${ err }` );
        
    }
}



/************************************************LOGIN CONTROLS***************************************************************/

//validating the login page
const loginValidation = async (req, res) => {
    try {
        //validating email & password formats.
        const isValid = regexValidation( req );

        //redirecting to admin page if not validated.
        if( !isValid ) return res.redirect( '/user/loginPage' );

        //authenticating the user.
        const user = await authenticateUser( req );

        //redirecting to login page if not authenticated.
        if ( !user ) return res.redirect( '/user/loginPage' );

        req.session.userSession = user;
        res.redirect( '/user/homePage' );
    } catch ( err ) {
        console.error( `Error caught on loginValidation ${ err }` );
    }
};

//render login
const loginPage = ( req, res ) => {
    if (req.session.userSession){
        res.redirect( '/user/homePage' );
    } else {
        //all user login error messages.
        const userInvalidPasswordMessage = req.session.userInvalidPasswordMessage || '';
        const userInvalidEmailMessage = req.session.userInvalidEmailMessage || '';
        const emailNotFoundMessage = req.session.emailNotFoundMessage || '';
        
        //setting default values.
        req.session.userInvalidPasswordMessage = '';
        req.session.userInvalidEmailMessage = '';
        req.session.emailNotFoundMessage = '';

        res.render ( 'userLogin', { 
            userInvalidPasswordMessage,
            userInvalidEmailMessage,
            emailNotFoundMessage
        } );
    }
};

/****************************************************LOGIN CONTROLS END*********************************************************/

/***************************************************SIGNUP CONTROLS***********************************************************/


// validating the credentials for signIn page
const credentialsMatch = ( req, password, confirmPassword, email, confirmEmail ) => {
    try{
        if( password !== confirmPassword || email !== confirmEmail ) {  

            //checking if the email matches.
            if( email !== confirmEmail ) req.session.mismatchEmailErrorMessage = "Email match error.";

            //checking if the password matches.
            if( password !== confirmPassword ) req.session.mismatchPasswordErrorMessage = "Password match error.";

            return false;
        }
        return true;
    }catch( err ){
        console.error( `Error caught on signInValidCredentials: ${ err }` );
    }
};

//validating signIn Page
const signInValidation = async (req, res) => {
    const { username, email, confirmEmail, password, confirmPassword } = req.body;
    try {    
        //validating email & password formats.
        const isValid = regexValidation( req );

        //redirecting to user page if not validated.
        if( !isValid ) return res.redirect( '/user/signIn' );

        //credential validation function.
        const isvalid =  credentialsMatch ( req, password, confirmPassword, email, confirmEmail );

        //redirect the page to user sign in if the credentials not validate.
        if ( !isvalid )  return res.redirect( '/user/signIn' );
        
        //checking if the user already exists.
        const isExist = await existingUser( req );

        //redirect the page to user signIn if the user already exists.
        if( isExist ) return res.redirect( '/user/signIn' );

        //saving the user to db after hashing.
        const hashedPassword = await hashing ( password );
        const newUser = new User ({
            username: username,
            email: email,
            password: hashedPassword,
        });

        //saving new user to the db / handles error.
        try {
            await newUser.save();            
            req.session.userSession = newUser;    //saving user in the session
            res.redirect( '/user/homePage' );
        } catch( err ) {
            console.error( `Error saving new user ${ err }` );
        }
    } catch (err) {
    console.log (`Error caught on signValidation ${ err }`);
    }
};

//render signIn
const signInPage = ( req, res ) => {
    try {
        //checking 
        if(req.session.userSession)  return res.redirect ( '/user/homePage' );

        //all sign in error messages.
        const mismatchPasswordErrorMessage = req.session.mismatchPasswordErrorMessage || '';
        const userInvalidPasswordMessage = req.session.userInvalidPasswordMessage || '';
        const mismatchEmailErrorMessage = req.session.mismatchEmailErrorMessage || '';
        const userInvalidEmailMessage = req.session.userInvalidEmailMessage || '';
        const emailErrorMsg = req.session.emailErrorMsg || '';

        //clearing error messages from the session, when refreshing.
        req.session.mismatchPasswordErrorMessage = '';
        req.session.userInvalidPasswordMessage = '';
        req.session.mismatchEmailErrorMessage = '';
        req.session.userInvalidEmailMessage = '';
        req.session.emailErrorMsg = '';
        return res.render( 'userSignIn', { 
            mismatchPasswordErrorMessage, 
            userInvalidPasswordMessage,
            mismatchEmailErrorMessage,
            userInvalidEmailMessage,
            emailErrorMsg
        } );
    } catch ( err ) {
        console.error( `Error caught on signInPage:  ${ err }` );
    }
};

/************************************************SIGNUP CONTROLS END*************************************************************/
//render home page
const homePage = ( req, res ) => {
    try {
        if( req.session.userSession ) {
            return res.render( 'userHomePage', { username: req.session.userSession.username } );
        } else {
            return res.redirect( '/user/loginPage' );
        }
        
    } catch ( err ) {
        console.error( `Error caught on homePage: ${ err }` );
    }
}

const signOut = ( req, res ) => {
    try {
        req.session.destroy();
        res.redirect( '/user/loginPage' );
    } catch( err ) {
        console.error( `Error caught on signOut: ${ err }` );
    }
}



module.exports = {
  loginPage,
  loginValidation,
  signInPage,
  signInValidation,
  homePage,
  signOut,
  validEmail,
  validPassword,
  credentialsMatch,
  hashing,

};
