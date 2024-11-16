// Function to control cards (scroll effect) in specific carousel slides by their IDs with jQuery
$(document).ready(function () {
    // Array of specific carousel IDs
    const carouselIds = ['#carouselVideos', '#carouselBlogInvesting'];

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
