// Customise form
document.addEventListener('DOMContentLoaded', function() {
    var initialAmountInput = document.getElementById('starting_amount');
    var initialRangeInput = document.getElementById('starting_amount_range');
    var periodInput = document.getElementById('number_of_periods');
    var periodRangeInput = document.getElementById('number_of_periods_range');
    var rateInput = document.getElementById('return_rate');
    var rateRangeInput = document.getElementById('return_rate_range');
    var additionalAmountInput = document.getElementById('annual_additional_contribution');
    var additionalRangeInput = document.getElementById('annual_additional_contribution_range');
    
    // Match value field with value range
    initialAmountInput.addEventListener('input', function() {
        initialRangeInput.value = initialAmountInput.value;
    });

    initialRangeInput.addEventListener('input', function() {
        initialAmountInput.value = initialRangeInput.value;
    });

    periodInput.addEventListener('input', function() {
        periodRangeInput.value = periodInput.value;
    });

    periodRangeInput.addEventListener('input', function() {
        periodInput.value = periodRangeInput.value;
    });

    rateInput.addEventListener('input', function() {
        rateRangeInput.value = rateInput.value;
    });

    rateRangeInput.addEventListener('input', function() {
        rateInput.value = rateRangeInput.value;
    });

    additionalAmountInput.addEventListener('input', function() {
        additionalRangeInput.value = additionalAmountInput.value;
    });

    additionalRangeInput.addEventListener('input', function() {
        additionalAmountInput.value = additionalRangeInput.value;
    });

    // Update range backgrounds on load
    [initialRangeInput, periodRangeInput, rateRangeInput, additionalRangeInput].forEach(function(rangeInput) {
        updateRangeBackground(rangeInput);
    });

    // Update range backgrounds on input
    [initialRangeInput, periodRangeInput, rateRangeInput, additionalRangeInput].forEach(function(rangeInput) {
        rangeInput.addEventListener('input', function() {
            updateRangeBackground(rangeInput);
        });
    });
});
