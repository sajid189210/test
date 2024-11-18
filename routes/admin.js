const express = require ( 'express' );
const router = express.Router ();
const adminController = require ( '../controller/adminController' );

//login router
try {
  router.get ( '/', adminController.accountAccessPage );
} catch ( err ) {
  console.error ( `Error caught on admin /admin router: ${ err }`);
}

try {
  router.post( '/login', adminController.loginValidation );
} catch( err ) {
  console.error( `Error caught on admin /login router: ${ err }` );
}


//router for signUp
try {
  router.post ( '/signUp', adminController.adminSignUp );
} catch ( err ) {
  console.error (`Error caught on admin /signUp router: ${ err }`);
}

//router for homepage.
try {
  router.get ( '/homePage', adminController.adminHomePage );
} catch ( err ) {
  console.error (`Error caught on admin /homepage router: ${ err }`);
}

//router for update user details.
try {
  router.put ( '/homePage/update/:userId', adminController.updateUserDetails );
} catch( err ) {
  console.error( `Error caught on admin /homepage/update router ${ err }` );
}

//route for deleting the user.
try {
  router.delete( '/homePage/deleteUser/:userId', adminController.deleteUser );
} catch ( err ) {
  console.error( `Error caught on admin /homepage/delete router ${ err }` );
}

//route for searching user.
try{
  router.post( '/homepage', adminController.searchUsers );
} catch( err){
  console.error ( `Error caught on admin search router: ${ err }`);
}

//router signOut
try {
  router.get ( '/signOut', adminController.adminSignOut );
} catch ( err ) {
  console.error ( `Error caught on admin /signOut router: ${ err }`);
}

module.exports = router;
