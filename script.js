let btcData = {};

function loadCSV(filePath) {
    return new Promise((resolve, reject) => {
        Papa.parse(filePath, {
            download: true,
            header: true,
            complete: function(results) {
                results.data.forEach(row => {
                    const date = row.Date;
                    const closePrice = parseFloat(row.Close);
                    btcData[date] = closePrice;
                });
                resolve();
            },
            error: function(error) {
                reject(error);
            }
        });
    });
}

function getBTCPrice(date) {
    if (btcData[date]) {
        return Promise.resolve(btcData[date]);
    } else {
        // If the date is not in the CSV, fetch the current price from CoinGecko API
        return fetchCurrentBTCPrice();
    }
}

function fetchCurrentBTCPrice() {
    return fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
        .then(response => response.json())
        .then(data => data.bitcoin.usd)
        .catch(error => {
            console.error('Error fetching current Bitcoin price:', error);
            return null;
        });
}

function calculateCollateral() {
    const startDate = document.getElementById('start-date').value;
    const months = parseInt(document.getElementById('months').value);
    const collateral = parseFloat(document.getElementById('collateral').value);
    const loanAmount = parseFloat(document.getElementById('loan-amount').value);
    const interestRate = parseFloat(document.getElementById('interest-rate').value);

    if (!startDate || isNaN(months) || isNaN(collateral) || isNaN(loanAmount) || isNaN(interestRate)) {
        alert("Please fill in all fields correctly.");
        return;
    }

    // Calculate the end date
    let startDateObj = new Date(startDate);
    let endDateObj = new Date(startDateObj.setMonth(startDateObj.getMonth() + months));
    let endDate = endDateObj.toISOString().split('T')[0];

    // Get Bitcoin prices on the start and end dates
    getBTCPrice(startDate).then(startPrice => {
        if (startPrice === null) {
            alert("No price data available for the start date.");
            return;
        }

        getBTCPrice(endDate).then(endPrice => {
            if (endPrice === null) {
                alert("No price data available for the end date.");
                return;
            }

            // Calculate the appreciation
            let initialValue = collateral * startPrice;
            let finalValue = collateral * endPrice;
            let appreciation = finalValue - initialValue;

            // Calculate the interest paid
            let interestPaid = loanAmount * (interestRate / 100) * (months / 12);

            // Determine if the loan was worth it
            let loanWorthIt = appreciation > interestPaid ? "Yes" : "No";

            // Display the result
            document.getElementById('result-text').innerHTML = `
                Start Date: ${startDate}<br>
                End Date: ${endDate}<br>
                Initial Collateral: ${collateral} BTC<br>
                Initial Value: $${initialValue.toFixed(2)}<br>
                Final Value: $${finalValue.toFixed(2)}<br>
                Appreciation: $${appreciation.toFixed(2)}<br>
                Interest Paid: $${interestPaid.toFixed(2)}<br>
                Was the loan worth it? ${loanWorthIt}
            `;
        });
    });
}

// Load the CSV file when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCSV('BTC-USD.csv').then(() => {
        console.log('CSV file loaded successfully.');
    }).catch(error => {
        console.error('Error loading CSV file:', error);
    });
});
