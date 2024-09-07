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

// login
function validateLogin() {
    const hardCodedPassword = "Admin12345";
    const enteredEmail = document.getElementById("inputEmail").value;
    const enteredPassword = document.getElementById("inputPassword").value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(enteredEmail)) {
        alert("Please enter a valid email address.");
        return false;
    }

    if (enteredPassword === hardCodedPassword) {
        // Set authorization in localStorage
        localStorage.setItem('isAuthorized', 'true');
        window.location.href = "index.html";
        return false;
    } else {
        alert("Incorrect password. Please try again.");
        return false;
    }
}

// Simulate an authentication check
var isAuthenticated = false; // Change this to true if the user is authenticated

// Get the sidenav element
var sidenav = document.getElementById('layoutSidenav');

// Show or hide the sidenav based on authentication status
if (isAuthenticated) {
    sidenav.classList.remove('hidden');
} else {
    sidenav.classList.add('hidden');
}

// Check authorization status and show/hide sidebar items accordingly

function checkAuthorization() {
    const isAuthorized = localStorage.getItem('isAuthorized') === 'true';

    if (!isAuthorized) {
        const authorizedElements = document.querySelectorAll('[data-authorized="true"]');
        authorizedElements.forEach(el => el.style.display = 'none');
    }
}

// Run authorization check on page load
document.addEventListener('DOMContentLoaded', checkAuthorization);

//logout
function logout() {
    localStorage.removeItem('isAuthorized');
    window.location.href = "login.html";
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
