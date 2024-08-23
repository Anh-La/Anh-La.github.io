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

document.addEventListener('DOMContentLoaded', function() {
    // Get the chart context
    const ctx = document.getElementById('myChart').getContext('2d');

    // Create the chart
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Labels will be set dynamically
            datasets: [{
                label: 'Projected Savings',
                data: [], // Data will be set dynamically
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Update chart and JSON output
    function updateChart() {
        // Get form values
        const startingAmount = parseFloat(document.getElementById('starting_amount').value) || 0;
        const returnRate = parseFloat(document.getElementById('return_rate').value) || 0;
        const numberOfPeriods = parseInt(document.getElementById('number_of_periods').value) || 0;
        const annualAdditionalContribution = parseFloat(document.getElementById('annual_additional_contribution').value) || 0;
        const frequency = document.getElementById('frequency').value;
        const ExtraPerPeriod = document.getElementById('ExtraPerPeriod').value;
        
        // Calculate savings data
        const labels = [];
        const data = [];
        let totalAmount = startingAmount;

        for (let i = 0; i <= numberOfPeriods; i++) {
            labels.push(i);
            data.push(totalAmount.toFixed(2));
            
            // Update totalAmount
            totalAmount = totalAmount * (1 + returnRate / 100) + annualAdditionalContribution;
        }

        // Update chart
        myChart.data.labels = labels;
        myChart.data.datasets[0].data = data;
        myChart.update();

        // Update JSON output
        const jsonOutput = {
            labels: labels,
            data: data
        };
        document.getElementById('jsonOutput').textContent = JSON.stringify(jsonOutput, null, 2);
    }

    // Initialize chart and JSON output
    updateChart();

    // Add event listeners to form elements
    document.getElementById('dataForm').addEventListener('input', updateChart);
});

(function () {
  'use strict'
  feather.replace()
})()
