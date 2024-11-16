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
controlCarouselItemsById('carouselHomeControls', 4);
controlCarouselItemsById('relatedProjectsCarousel', 4);
