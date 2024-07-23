# Firefish Calculator

#### This code, including the `README.md`, was entirely generated by ChatGPT, an AI language model developed by OpenAI. While efforts have been made to ensure accuracy and functionality, please review and test the code thoroughly before using it in a production environment.

Firefish calculator lets you explore historical situations where using BTC as collateral paid off, showing the potential benefits of leveraging Bitcoin's long-term value growth. The example website is running on https://firefish.cz for you to try it.

<img width="400" alt="firefish calculator" src="https://github.com/user-attachments/assets/aa631765-56be-426a-82d0-4d8ba7c60b98">


## Features

- Calculate potential benefits of using BTC as collateral
- Explore historical BTC price scenarios
- Supports multiple currencies (USD, EUR, CZK)
- Adjustable loan duration and interest rates
- Real-time calculations and results display

## Getting Started

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/firefish-calculator.git
    cd firefish-calculator
    ```

2. **Install dependencies:**

    There are no specific dependencies for this project apart from Python 3.

### Running the Server

To run the project locally, you can use a simple Python HTTP server. Here's how you can do it:

1. **Navigate to the project directory:**

    ```bash
    cd firefish-calculator
    ```

2. **Run the Python HTTP server:**

    For Python 3.x:

    ```bash
    python -m http.server
    ```

    The default port is `8000`. If you need to use a different port, you can specify it like this:

    ```bash
    python -m http.server 8080
    ```

3. **Open your browser and navigate to:**

    ```
    http://localhost:8000
    ```

    Replace `8000` with your specified port if you used a different one.

### Usage

1. **Open the Firefish Calculator in your browser.**
2. **Enter the start date, loan duration, currency, loan amount, and interest rate.**
3. **View the results to see if using BTC as collateral was worth it for the specified period.**
