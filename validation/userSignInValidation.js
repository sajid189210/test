// validating the credentials for signIn page
const checkCredentials = (req, res, userName, password, confirmPassword, email, confirmEmail) => {
    try{
        console.log("hi");
        
        if( !userName ) {
            console.error('userName not required');
            req.session.userNameErrorMessage = "Must enter userName";
            return res.redirect( '/user/signIn' );
        }
        req.session.userNameErrorMessage = '';
        if( password !== confirmPassword || email !== confirmEmail ) {
            console.error('Password or email mismatch');
            req.session.mismatchErrorMessage = "Password or Email mismatch";
            return res.redirect( '/user/signIn' );
        }
        req.session.mismatchErrorMessage = '';
    }catch( err ){
        console.error( `Error caught on signInValidCredentials: ${ err }` );
    }
};

module.exports = {
    checkCredentials
}