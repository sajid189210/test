const express = require( 'express' );
const router = express.Router();
const userController = require( '../controller/userController' );


//user login rendering
router.get( '/loginPage', userController.loginPage );

//user loginValidation
router.post( '/loginPage', userController.loginValidation );

//user Sign In rendering
router.get( '/signIn', userController.signInPage );

//signIn validation
router.post( '/signIn', userController.signInValidation );

//homepage rendering 
router.get( '/homePage', userController.homePage );

//signOut
router.get( '/signOut',userController.signOut );


module.exports = router;