/*!
* Start Bootstrap - Simple Sidebar v6.0.6 (https://startbootstrap.com/template/simple-sidebar)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-simple-sidebar/blob/master/LICENSE)
*/
// 
// Scripts
// 

 /* Running text in top navbar - Text box marquee            */
speed_Scrolling = 150
characters_Scroll = 1

function scrolling_Text() {
    window.setTimeout('scrolling_Text()', speed_Scrolling);

    var msg = document.text_Marquee.text.value;
    document.text_Marquee.text.value =
        msg.substring(characters_Scroll) +
        msg.substring(0, characters_Scroll);
}
scrolling_Text()

// hard coded pass
function validateLogin() {
            // Hard-coded password
            const hardCodedPassword = "Admin12345";

            // Get the value entered in the password field
            const enteredPassword = document.getElementById("inputPassword").value;

            // Validate the password
            if (enteredPassword === hardCodedPassword) {
                // Password is correct, redirect to index.html
                window.location.href = "index.html";
                return false; // Prevent form submission
            } else {
                // Password is incorrect, show an alert
                alert("Incorrect password. Please try again.");
                return false; // Prevent form submission
            }
        }

window.addEventListener('DOMContentLoaded', event => {

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    
    // Apply the sb-sidenav-toggled class by default
    document.body.classList.add('sb-sidenav-toggled');
    
    if (sidebarToggle) {
        // Persist sidebar toggle between refreshes
        if (localStorage.getItem('sb|sidebar-toggle') === 'false') {
            document.body.classList.remove('sb-sidenav-toggled');
        }

        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }

});

window.addEventListener('DOMContentLoaded', event => {
    // Simple-DataTables
    // https://github.com/fiduswriter/Simple-DataTables/wiki

    const datatablesSimple = document.getElementById('datatablesSimple');
    if (datatablesSimple) {
        new simpleDatatables.DataTable(datatablesSimple);
    }
});


//data tables
// Call the dataTables jQuery plugin
$(document).ready(function() {
  $('#dataTable').DataTable();
});
