// Sample list of product names to match against the search query
const productList = [
    "Apple iPhone 14", "Samsung Galaxy S21", "MacBook Pro", "Dell XPS 13",
    "Sony WH-1000XM4 Headphones", "Bose QuietComfort 35", "iPad Pro",
    "Apple Watch Series 8", "Samsung Galaxy Tab S7", "Google Pixel 6",
    "HP Spectre x360", "Lenovo ThinkPad X1 Carbon", "Microsoft Surface Laptop 4"
];

function showSuggestions() {
    const searchBox = document.getElementById('search-box');
    const suggestionBox = document.getElementById('suggestion-box');
    const searchText = searchBox.value.toLowerCase();

    // Clear previous suggestions
    suggestionBox.innerHTML = '';

    if (searchText.length > 0) {
        const suggestions = productList.filter(product =>
            product.toLowerCase().includes(searchText)
        );

        if (suggestions.length > 0) {
            // Display suggestions in a dropdown list
            suggestions.forEach(suggestion => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = suggestion;

                // Allow clicking suggestion to auto-fill search box
                suggestionItem.onclick = () => {
                    searchBox.value = suggestion;
                    suggestionBox.innerHTML = '';
                };

                suggestionBox.appendChild(suggestionItem);
            });
        } else {
            // Show "No matches found" if no related items are found
            const noMatch = document.createElement('div');
            noMatch.classList.add('suggestion-item');
            noMatch.textContent = 'No matches found';
            suggestionBox.appendChild(noMatch);
        }
    }
}

function searchProducts() {
    const searchBox = document.getElementById('search-box');
    const searchText = searchBox.value.toLowerCase();
    const products = document.querySelectorAll('.product');
    let found = false;

    products.forEach(product => {
        const productName = product.querySelector('h3').textContent.toLowerCase();
        if (productName.includes(searchText)) {
            product.style.display = 'block';
            found = true;
        } else {
            product.style.display = 'none';
        }
    });

    if (!found) {
        searchBox.value = 'Not Found';
    }

    // Clear suggestions after search
    document.getElementById('suggestion-box').innerHTML = '';

    return false; // Prevent form submission
}


// Function to open the popup
    function openPopup() {
        document.querySelector('.categories-popup').style.display = 'block';
    }

    // Function to close the popup
    function closePopup() {
        document.querySelector('.categories-popup').style.display = 'none';
    }

    // Event listener for close button
    document.addEventListener('DOMContentLoaded', function () {
        const closeButton = document.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', closePopup);
        }
    });

// Function to add product to the cart
function addToCart(productName, productPrice) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ name: productName, price: productPrice });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${productName} has been added to your cart!`);
}

// Function to redirect to the Cart page
function goToCart() {
    window.location.href = 'cart.html'; // Redirect to cart page
}

// Function to load the cart from localStorage and display it
function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');
    let total = 0;

    cartItems.innerHTML = ''; // Clear the cart display

    // Loop through the cart items and create list items for each
    cart.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} - $${item.price.toFixed(2)}`;
        cartItems.appendChild(listItem);
        total += item.price;
    });

    // Update total price
    totalPrice.textContent = `Total: $${total.toFixed(2)}`;

    // If the cart is empty, display a message
    if (cart.length === 0) {
        cartItems.innerHTML = '<li>Your cart is empty.</li>';
        totalPrice.textContent = 'Total: $0.00';
    }
}
async function initiateMpesaPayment() {
    const phone = document.getElementById("phone").value;
    const amount = document.getElementById("amount").value;
    const responseElement = document.getElementById("response");

    if (!phone || !amount) {
        alert("Please enter both phone number and amount.");
        return;
    }

    try {
        // 1. Obtain access token
        const accessToken = await getAccessToken();

        //*** Authorization Request in NodeJS ***|
 
        var unirest = require("unirest");
        var req = unirest("GET", "https://sandbox.safaricom.co.ke/oauth/v1/generate");
         
        req.query({
         "grant_type": "client_credentials"
        });
         
        req.headers({
         "Authorization": "Basic SWZPREdqdkdYM0FjWkFTcTdSa1RWZ2FTSklNY001RGQ6WUp4ZVcxMTZaV0dGNFIzaA=="
        });
         
        req.end(res => {
         if (res.error) throw new Error(res.error);
         console.log(res.body);
        });

        // 2. Send payment request to M-Pesa API
        const result = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                BusinessShortCode: "YOUR_SHORTCODE",
                Password: generatePassword(),
                Timestamp: getCurrentTimestamp(),
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: phone,
                PartyB: "YOUR_SHORTCODE",
                PhoneNumber: phone,
                CallBackURL: "YOUR_CALLBACK_URL",
                AccountReference: "OrderPayment",
                TransactionDesc: "Payment for Order",
            }),
        });

        const data = await result.json();

        if (data.ResponseCode === "0") {
            responseElement.innerHTML = "Payment initiated. Complete the payment on your M-Pesa phone.";
            
            // Simulate callback handling by setting a timeout (replace this with actual M-Pesa callback handling)
            setTimeout(() => confirmPayment(phone, amount), 5000);
        } else {
            responseElement.innerHTML = `Payment failed: ${data.errorMessage}`;
        }
    } catch (error) {
        responseElement.innerHTML = "An error occurred. Please try again.";
        console.error("Error:", error);
    }
}

// Simulated payment confirmation function
function confirmPayment(phone, amount) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    // Save cart, date, and time to localStorage for order summary only if payment is successful
    const order = {
        items: cart,
        totalPrice: total.toFixed(2),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };
    localStorage.setItem('order', JSON.stringify(order));

    // Clear the cart after order is confirmed
    localStorage.removeItem('cart');

    // Redirect to order summary page
    window.location.href = 'order.html';
}



// Checkout function - redirect to order summary page, forward items and total, and clear cart
function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Save cart, date, and time to localStorage for order summary
    const order = {
        items: cart,
        totalPrice: total.toFixed(2),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };
    localStorage.setItem('order', JSON.stringify(order));

    // Clear the cart after checkout
    //localStorage.removeItem('cart');

    // Refresh the cart display by calling loadCart function
    loadCart();

    // Redirect to order summary page
   // window.location.href = 'order.html';
}

// Function to load the order details from localStorage and display them
function loadOrder() {
    const order = JSON.parse(localStorage.getItem('order')) || {};
    const orderItems = document.getElementById('orderItems');
    const orderDate = document.getElementById('orderDate');
    const orderTime = document.getElementById('orderTime');
    const orderTotal = document.getElementById('orderTotal');

    // Clear previous order display
    orderItems.innerHTML = '';

    // Display order items
    if (order.items) {
        order.items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.name} - $${item.price.toFixed(2)}`;
            orderItems.appendChild(listItem);
        });
    }

    // Display order date, time, and total price
    orderDate.textContent = `Order Date: ${order.date}`;
    orderTime.textContent = `Order Time: ${order.time}`;
    orderTotal.textContent = `Total Price: $${order.totalPrice}`;
}

// Call loadCart when the cart page loads
if (window.location.pathname.includes('cart.html')) {
    window.onload = loadCart;
}


