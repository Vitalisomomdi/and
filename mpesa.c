#include <stdio.h>

int main() {
    int choice, account, amount;
    int balance = 1000; // Initial balance

    while (1) {
        // Display menu options
        printf("\nWelcome to BankProgram\n");
        printf("1. Deposit Money\n");
        printf("2. Send Money\n");
        printf("3. Withdraw Money\n");
        printf("4. Check Balance\n");
        printf("5. Exit\n");
        printf("Enter your choice: ");
        scanf("%d", &choice);

        switch (choice) {
            case 1: // Deposit Money
                printf("Enter account number to deposit into: ");
                scanf("%d", &account);
                printf("Enter amount to deposit: ");
                scanf("%d", &amount);
                if (amount > 0) {
                    balance += amount;
                    printf("Transaction successful! New balance is: %d\n", balance);
                } else {
                    printf("Invalid amount entered.\n");
                }
                break;

            case 2: // Send Money
                printf("Enter account number to send money to: ");
                scanf("%d", &account);
                printf("Enter amount to send: ");
                scanf("%d", &amount);
                if (amount > 0 && amount <= balance) {
                    balance -= amount;
                    printf("Transaction successful! New balance is: %d\n", balance);
                } else if (amount > balance) {
                    printf("Insufficient balance.\n");
                } else {
                    printf("Invalid amount entered.\n");
                }
                break;

            case 3: // Withdraw Money
                printf("Enter amount to withdraw: ");
                scanf("%d", &amount);
                if (amount > 0 && amount <= balance) {
                    balance -= amount;
                    printf("Transaction successful! You have withdrawn %d. New balance is: %d\n", amount, balance);
                } else if (amount > balance) {
                    printf("Insufficient balance.\n");
                } else {
                    printf("Invalid amount entered.\n");
                }
                break;

            case 4: // Check Balance
                printf("Your current balance is: %d\n", balance);
                break;

            case 5: // Exit
                printf("Thank you for using BankProgram. Goodbye!\n");
                return 0;

            default:
                printf("Invalid choice. Please try again.\n");
        }
    }

    return 0;
}


mkdir my-ecommerce-backend
cd my-ecommerce-backend
npm init -y
npm install express


const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('E-commerce Backend');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


node server.js

const axios = require('axios');

// Function to initiate M-Pesa payment
async function initiatePayment(phoneNumber, amount) {
    try {
        // Get access token
        const tokenResponse = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            auth: { username: 'YOUR_CONSUMER_KEY', password: 'YOUR_CONSUMER_SECRET' }
        });
        const accessToken = tokenResponse.data.access_token;

        // Initiate STK Push
        const paymentResponse = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
            BusinessShortCode: 'YOUR_SHORTCODE',
            Password: 'YOUR_PASSWORD', // Generate this based on timestamp, shortcode, and key
            Timestamp: '20231031120000', // Use dynamic timestamp
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: 'YOUR_SHORTCODE',
            PhoneNumber: phoneNumber,
            CallBackURL: 'https://yourdomain.com/payment/callback', // Handle response here
            AccountReference: 'Order1234',
            TransactionDesc: 'Order Payment'
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        console.log('Payment response:', paymentResponse.data);
        return paymentResponse.data;
    } catch (error) {
        console.error('Error initiating payment:', error);
    }
}


app.post('/payment/callback', (req, res) => {
    const paymentData = req.body;

    if (paymentData.Body.stkCallback.ResultCode === 0) {
        // Payment was successful
        console.log('Payment successful:', paymentData);
        // Update your order status in the database
    } else {
        console.log('Payment failed:', paymentData);
    }

    res.status(200).json({ message: 'Callback received' });
});

