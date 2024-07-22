let btcData = {};
let exchangeRates = {};

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

function loadExchangeRates() {
    return fetch('https://api.exchangerate-api.com/v4/latest/USD')
        .then(response => response.json())
        .then(data => {
            exchangeRates = data.rates;
        })
        .catch(error => {
            console.error('Error fetching exchange rates:', error);
            exchangeRates = { EUR: 0.85, CZK: 21.5 }; // Fallback values
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

function convertToUSD(amount, currency) {
    if (currency === 'USD') {
        return amount;
    } else {
        return amount / exchangeRates[currency];
    }
}

function convertFromUSD(amount, currency) {
    if (currency === 'USD') {
        return amount;
    } else {
        return amount * exchangeRates[currency];
    }
}

function selectDuration(months) {
    document.getElementById('months').value = months;
    document.querySelectorAll('.tile').forEach(tile => tile.classList.remove('selected'));
    document.querySelector(`.tile[onclick="selectDuration(${months})"]`).classList.add('selected');
}

function calculateCollateral() {
    const startDate = document.getElementById('start-date').value;
    const months = parseInt(document.getElementById('months').value);
    const currency = document.getElementById('currency').value;
    const loanAmount = parseFloat(document.getElementById('loan-amount').value);
    const interestRate = parseFloat(document.getElementById('interest-rate').value);

    if (!startDate || isNaN(months) || isNaN(loanAmount) || isNaN(interestRate)) {
        alert("Please fill in all fields correctly.");
        return;
    }

    const loanAmountUSD = convertToUSD(loanAmount, currency);

    // Calculate the total amount due using the compound interest formula
    let n = 12; // number of compounding periods per year
    let t = months / 12; // time in years
    let r = interestRate / 100; // annual nominal interest rate as a decimal

    // A = P(1 + r/n)^(nt)
    let accruedAmount = loanAmountUSD * Math.pow((1 + r / n), (n * t));
    let totalAmountDueUSD = accruedAmount;

    // Calculate the collateral amount (double the total amount due) and convert to BTC
    const collateralUSD = totalAmountDueUSD * 2;

    // Calculate the end date
    let startDateObj = new Date(startDate);
    let endDateObj = new Date(startDate);
    endDateObj.setMonth(endDateObj.getMonth() + months);
    let endDate = endDateObj.toISOString().split('T')[0];

    // Get Bitcoin prices on the start and end dates
    getBTCPrice(startDate).then(startPrice => {
        if (startPrice === null) {
            alert("No price data available for the start date.");
            return;
        }

        const collateralBTC = collateralUSD / startPrice;

        getBTCPrice(endDate).then(endPrice => {
            if (endPrice === null) {
                alert("No price data available for the end date.");
                return;
            }

            // Calculate the appreciation
            let initialValue = collateralBTC * startPrice;
            let finalValue = collateralBTC * endPrice;
            let appreciation = finalValue - initialValue;

            // Calculate the interest paid
            let interestPaidUSD = totalAmountDueUSD - loanAmountUSD;

            // Determine if the loan was worth it
            let loanWorthIt = appreciation > interestPaidUSD ? "Yes" : "No";

            // Convert results back to the original currency
            let interestPaid = convertFromUSD(interestPaidUSD, currency);
            let initialValueInCurrency = convertFromUSD(initialValue, currency);
            let finalValueInCurrency = convertFromUSD(finalValue, currency);
            let appreciationInCurrency = convertFromUSD(appreciation, currency);
            let totalAmountDueInCurrency = convertFromUSD(totalAmountDueUSD, currency);

            // Display the result in the original currency
            document.getElementById('result-text').innerHTML = `
                Start Date: ${startDate}<br>
                End Date: ${endDate}<br>
                Loan Amount: ${loanAmount.toFixed(2)} ${currency}<br>
                Total Amount Due: ${totalAmountDueInCurrency.toFixed(2)} ${currency}<br>
                Collateral Amount: ${collateralBTC.toFixed(4)} BTC (worth ${convertFromUSD(collateralUSD, currency).toFixed(2)} ${currency})<br>
                Initial Value: ${initialValueInCurrency.toFixed(2)} ${currency}<br>
                Final Value: ${finalValueInCurrency.toFixed(2)} ${currency}<br>
                Appreciation: ${appreciationInCurrency.toFixed(2)} ${currency}<br>
                Interest Paid: ${interestPaid.toFixed(2)} ${currency}<br>
                Was the loan worth it? ${loanWorthIt}
            `;
        });
    });
}

// Load the CSV file and exchange rates when the page loads
document.addEventListener('DOMContentLoaded', function() {
    Promise.all([loadCSV('BTC-USD.csv'), loadExchangeRates()]).then(() => {
        console.log('CSV file and exchange rates loaded successfully.');
    }).catch(error => {
        console.error('Error loading CSV file or exchange rates:', error);
    });
});
