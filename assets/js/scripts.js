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

// Run authorization check on page load
document.addEventListener('DOMContentLoaded', checkAuthorization);
// Check authorization status and show/hide sidebar items accordingly
function checkAuthorization() {
    const isAuthorized = localStorage.getItem('isAuthorized') === 'true';

    if (!isAuthorized) {
        const authorizedElements = document.querySelectorAll('[data-authorized="true"]');
        authorizedElements.forEach(el => el.style.display = 'none');
    }
}

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

 // Tab pages setup
function openPage(pageName, elmnt) {
    // Hide all elements with class="tabcontent" by default
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    // Remove the background color of all tablinks/buttons
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove('active');
    }
    // Show the specific tab content
    document.getElementById(pageName).style.display = "block";
    // Add the active class to the current button
    elmnt.classList.add('active');
}


// Get the default tab open
document.getElementById("homeTab").click();

// Function to control cards (stacking effect) in carousel slides by carousel ID
function controlCarouselItemsById(carouselId, minPerSlide = 4) {
    // Select the specific carousel using the given ID
    let carousel = document.querySelector(`#${carouselId}`);
    
    // Get all carousel items within the specific carousel
    let items = carousel.querySelectorAll('.carousel-item');
    
    // Apply the logic to clone and append extra cards to each carousel item
    items.forEach((el) => {
        let next = el.nextElementSibling;
        for (let i = 1; i < minPerSlide; i++) {
            if (!next) {
                // Wrap around the carousel by using the first item if there is no next item
                next = items[0];
            }
            let cloneChild = next.cloneNode(true);
            el.appendChild(cloneChild.children[0]);
            next = next.nextElementSibling;
        }
    });
}

// Apply the function to the specific carousels by passing the ID
controlCarouselItemsById('carouselHomeControls1', 4);
controlCarouselItemsById('relatedProjectsCarousel', 4);

// Function to control cards (scroll effect) in specific carousel slides by their IDs with jQuery
$(document).ready(function () {
    // Array of specific carousel IDs
    const carouselIds = ['#carouselBlogBitcoin', '#carouselBlogFinance', '#carouselBlogTax', '#carouselBlogInvesting'];

    // Loop through each specific carousel by ID
    carouselIds.forEach(function (carouselId) {
        const carousel = $(carouselId); // Current carousel element

        // Check if the screen width is greater than 576px
        if (window.matchMedia("(min-width: 576px)").matches) {
            // Initialize the Bootstrap carousel with no interval (no automatic sliding)
            const bsCarousel = new bootstrap.Carousel(carousel[0], {
                interval: false
            });

            // Get the total width of the current carousel content
            var carouselWidth = carousel.find('.carousel-inner')[0].scrollWidth;
            // Get the width of a single card (carousel item)
            var cardWidth = carousel.find('.carousel-item').outerWidth(true); // Use outerWidth(true) to account for margins
            var scrollPosition = 0;

            // Next button click event
            carousel.find('.carousel-control-next').on('click', function () {
                // Check if the scroll position is within bounds
                if (scrollPosition < (carouselWidth - (cardWidth * 4))) {
                    console.log('next');
                    scrollPosition += cardWidth;
                    carousel.find('.carousel-inner').animate({ scrollLeft: scrollPosition }, 600); // Animate the scroll to the new position
                }
            });

            // Previous button click event
            carousel.find('.carousel-control-prev').on('click', function () {
                // Check if the scroll position is greater than 0
                if (scrollPosition > 0) {
                    console.log('prev');
                    scrollPosition -= cardWidth;
                    carousel.find('.carousel-inner').animate({ scrollLeft: scrollPosition }, 600); // Animate the scroll to the new position
                }
            });
        } else {
            // For smaller screens, enable the default Bootstrap sliding behavior
            carousel.addClass('slide');
        }
    });
});
