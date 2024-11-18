document.addEventListener( 'DOMContentLoaded', () => {

    const userModal = document.getElementById('userModal');
    const submitBtn = document.getElementById('submitBtn');

    let currentUserId;

    //eventListener for displaying current user details on the modal.
    userModal.addEventListener( 'show.bs.modal', event => {

        //reference to the element that was clicked to open the modal.
        let button = event.relatedTarget;

        //extracting the details from data-bs-whatever="<%#= user._id %> ".
        currentUserId = button.getAttribute('data-bs-id');
        let username = button.getAttribute('data-bs-username');
        let email = button.getAttribute('data-bs-email');

        //populating modal fields with userdetails.
        userModal.querySelector('#username').value = username;
        userModal.querySelector('#email').value = email;
    });

    //updating the user details.
    submitBtn.addEventListener( 'click', event  => {
        event.preventDefault();
        
        const username = userModal.querySelector( '#username' ).value;
        const email = userModal.querySelector( '#email' ).value;

        //sending updated data to the server.
        fetch(`/admin/homePage/update/${ currentUserId }`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(' User details updated successfully.' );
                    window.location.reload();
                } else alert('Update failed. ');
            }).catch(err => console.error( `Error caught on admin home page while fetching  ${ err }` ));
    });            
});

//deleting a user.
const deleteUser = ( userId ) => {
    
        if (confirm( 'Are you sure about this?' )) {
            fetch( `/admin/homePage/deleteUser/${ userId }`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
            
        } ) 
        .then( response => response.json() )
        .then( data => {
            if(data.success){
                alert( 'User deleted successfully' );
                window.location.reload();
            } else alert( 'Delete failed!' );
        } ). catch( err => console.error( `Error caught on admin page while deleting a user ${ err }` ) );
        } else {
            return;
        }
    }
