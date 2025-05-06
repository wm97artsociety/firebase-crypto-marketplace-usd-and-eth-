<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Product Details</title>
    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>
    <style>
        body { font-family: Arial; background: #f4f4f4; padding: 20px; }
        .product { background: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);} /* Added box shadow */
         /* Style for product image if you add it */
         .product img {
             max-width: 100%;
             height: auto;
             border-radius: 4px;
             margin-bottom: 15px;
             object-fit: cover;
             aspect-ratio: 1 / 1; /* Maintain aspect ratio */
             display: block; /* Ensure it takes up space when shown */
             margin-left: auto; /* Center image */
             margin-right: auto; /* Center image */
           }
        .price { font-size: 18px; margin: 8px 0; color: #333; } /* Adjusted price style */
         .product h2 { margin-bottom: 10px; color: #333; text-align: center; } /* Style for product name */
         .product p:not(.price) { font-size: 1em; color: #555; margin-bottom: 10px; line-height: 1.5;} /* Style for description */
         .product a { color: #0073e6; text-decoration: none;} /* Link style */
         .product a:hover { text-decoration: underline;}

        .wallet { margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; } /* Added separator */
        button { padding: 10px 20px; margin-top: 10px; cursor: pointer; background-color: #0073e6; color: white; border: none; border-radius: 4px; font-size: 1em;} /* Styled buttons */
        button:hover:not(:disabled) { background-color: #005bb5; } /* Hover style */
        button:disabled { background-color: #ccc; cursor: not-allowed; } /* Disabled style */

        label { display: block; margin-bottom: 5px; font-weight: bold; color: #555;} /* Label style */
        select { padding: 8px; border-radius: 4px; border: 1px solid #ccc; font-size: 1em; width: 100%; box-sizing: border-box;} /* Select style */

        #nftDetails, #otherLinks {
             margin-top: 15px;
             padding-top: 15px;
             border-top: 1px solid #eee;
             display: none; /* Hidden by default */
         }
         #nftDetails h3, #otherLinks h3 {
             margin-bottom: 10px;
             color: #333;
         }
         #nftDetails p, #otherLinks p {
              margin-bottom: 8px;
              font-size: 0.95em;
              color: #555;
           }

        /* Styles for the new Cash Payment Methods section */
        #cashPaymentMethods {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
            display: none; /* Hide by default until methods are loaded */
        }

        #cashPaymentMethods h3 {
            margin-bottom: 10px;
            color: #333;
        }

        #cashPaymentMethods button {
            display: inline-block; /* Display buttons side-by-side if space allows */
            width: auto; /* Auto width based on content */
            margin-right: 10px; /* Space between buttons */
            margin-bottom: 10px; /* Space below buttons */
            background-color: #28a745; /* Green color for cash buttons */
            color: white;
        }

        #cashPaymentMethods button:hover {
             background-color: #218838; /* Darker green on hover */
        }

        #cashDetailsDisplay {
            margin-top: 15px;
            padding: 10px;
            border: 1px dashed #ccc;
            background-color: #f9f9f9;
            word-break: break-all; /* Break long strings */
            white-space: pre-wrap; /* Preserve whitespace and wrap text */
            display: none; /* Hide by default */
            color: #555;
        }

        #paymentStatusMessage, #productStatusMessage {
            margin-top: 15px;
            font-weight: bold;
        }

        #orderFormElement { /* Style for the form */
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        #orderFormElement input {
            margin-bottom: 10px;
        }


    </style>
</head>
<body>
    <div class="product">
         <button onclick="location.href='index.html'" style="background: #4CAF50; color: white; padding: 8px 12px; border-radius: 5px; font-size: 0.9em; border: none; cursor: pointer; margin-bottom: 15px; display: block; width: auto;">🏠 Back to Products</button>


        <img id="productImage" src="" alt="Product Image" style="display: none;">
        <p id="productDescription" style="display: none;"></p>

        <h2 id="productName">Loading...</h2>
        <p class="price" id="ethPriceText">ETH Price: —</p>
        <p class="price" id="polPriceText">MATIC Price: —</p> <p id="productStatusMessage" style="color: gray;"></p> <div id="nftDetails">
            <h3>NFT Details:</h3>
            <p id="nftContractAddressText"></p>
            <p id="nftTokenIdText"></p>
            <p id="nftMarketplaceLinkText"></p>
        </div>

        <div id="otherLinks">
             <h3>Relevant Links:</h3>
              <p id="listingLinkText"></p>
        </div>

         <form id="orderFormElement">
             <h3>Shipping Information:</h3>
             <label for="name">Full Name:</label>
             <input type="text" id="name" required>

             <label for="address">Street Address:</label>
             <input type="text" id="address" required>

             <label for="city">City:</label>
             <input type="text" id="city" required>

             <label for="state">State/Province:</label>
             <input type="text" id="state"> <label for="region">Country/Region:</label>
             <input type="text" id="region" required>

             <label for="zip">Zip/Postal Code:</label>
             <input type="text" id="zip" required>

             <label for="quantity">Quantity:</label>
             <input type="number" id="quantity" value="1" min="1" required>
         </form>
         <div class="wallet">
            <label for="tokenSelect">Select Crypto Payment Token:</label>
            <select id="tokenSelect">
                 <option value="eth">Ethereum (ETH)</option>
                 <option value="matic">Polygon (MATIC)</option> </select>

            <button id="connectBtn">🔌 Connect Wallet</button>
            <button id="payBtn" disabled>💳 Pay with Selected Token</button>
            <p id="paymentStatusMessage" style="color: green; margin-top: 10px;"></p> </div>

        <div id="cashPaymentMethods">
            <h3>Alternatively, Pay with:</h3>
            </div>

        <div id="cashDetailsDisplay">
            </div>
        <p id="walletDisplay" style="margin-top: 15px; font-style: italic;">Wallet: —</p>


    </div>

    <script>
        // ** Firebase Configuration **
        // You MUST replace this with your project's actual configuration.
        // Ensure this matches the config used in your index.html if you integrate Firebase there.
        const firebaseConfig = {
            apiKey: "YOUR_API_KEY", // Replace with your API Key
            authDomain: "YOUR_AUTH_DOMAIN", // Replace with your Auth Domain
            projectId: "YOUR_PROJECT_ID", // Replace with your Project ID
            storageBucket: "YOUR_STORAGE_BUCKET", // Replace with your Storage Bucket
            messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your Messaging Sender ID
            appId: "YOUR_APP_ID" // Replace with your App ID
        };

        // Initialize Firebase
        // Check if Firebase app is already initialized to avoid errors
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        } else {
            firebase.app(); // if already initialized, use that app
        }

        // Get a reference to the Firestore database
        const db = firebase.firestore();

        // Chain IDs for both Ethereum and Polygon
        const ETH_CHAIN_ID = 1; // Ethereum mainnet chain ID
        const POLYGON_CHAIN_ID = 137; // Polygon mainnet chain ID (for MATIC)

        // !! IMPORTANT: Replace with your actual receiving wallet address for crypto payments !!
        // This should likely be the ADMIN_WALLET address from admin.html.
        // For security, avoid hardcoding sensitive addresses in client-side code in production.
        // You might fetch this from a config or backend.
        const RECIPIENT_WALLET_ADDRESS = "0xYourReceivingWalletAddress"; // <-- REPLACE THIS!


        let userAccount = null; // Currently connected wallet account
        let provider; // Ethers provider
        let signer; // Ethers signer (connected wallet)
        let ethToUsd = 0; // ETH to USD price rate
        let maticToUsd = 0; // MATIC to USD price rate
        let currentProduct = null; // Variable to store the fetched product data
        let cashPaymentDetails = {}; // Variable to store fetched cash details

        // Get Product ID from URL query parameter
        function getProductIdFromUrl() {
            const params = new URLSearchParams(window.location.search);
            return params.get('id');
        }

        // Get elements for status messages, payment button, and cash display
        const productStatusMessageEl = document.getElementById('productStatusMessage');
        const paymentStatusMessageEl = document.getElementById('paymentStatusMessage');
        const payBtn = document.getElementById('payBtn'); // Get button reference for Crypto Pay
        const cashDetailsDisplayEl = document.getElementById('cashDetailsDisplay'); // Get cash display element
        const tokenSelect = document.getElementById('tokenSelect'); // Get the select dropdown

        // --- Function to fetch product from localStorage by ID ---
        // This function reads the products array saved by your admin panel
        function fetchProductFromLocalStorage(id) {
            try {
                const products = JSON.parse(localStorage.getItem('products')) || [];
                // Find the product in the array that matches the passed ID
                return products.find(p => p.id === id);
            } catch (error) {
                console.error("Error reading products from localStorage:", error);
                return null;
            }
        }

         // --- Function to fetch cash payment methods from localStorage ---
         function fetchCashPaymentMethods() {
             try {
                 return JSON.parse(localStorage.getItem('cashPaymentMethods')) || {};
             } catch (error) {
                 console.error("Error reading cash payment methods from localStorage:", error);
                 return {};
             }
         }


        // Fetch live ETH and MATIC (POL) prices from CoinGecko
        async function fetchPrices() {
            try {
                // Optional: Show loading status for prices
                if (productStatusMessageEl && productStatusMessageEl.textContent !== "Error loading product details.") {
                    productStatusMessageEl.textContent = "Fetching live prices...";
                    productStatusMessageEl.style.color = 'gray';
                }


                // Fetch ETH price
                const ethRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
                const ethData = await ethRes.json();
                if (ethData && ethData.ethereum && ethData.ethereum.usd) {
                    ethToUsd = parseFloat(ethData.ethereum.usd);
                } else {
                     console.warn("Could not fetch ETH price.");
                     ethToUsd = 0; // Set to 0 on failure
                 }

                // Fetch MATIC price (Using matic-network ID for CoinGecko)
                const maticRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd');
                const maticData = await maticRes.json();
                if (maticData && maticData['matic-network'] && maticData['matic-network'].usd) {
                    maticToUsd = parseFloat(maticData['matic-network'].usd);
                } else {
                     console.warn("Could not fetch MATIC price.");
                     maticToUsd = 0; // Set to 0 on failure
                 }

                 // Update the displayed product details, including prices, after fetching rates
                 if (currentProduct) {
                     displayProductDetails(currentProduct); // Call the main display function
                 } else {
                     console.warn("Prices fetched, but product not yet loaded when fetchPrices finished.");
                 }

             } catch (err) {
                 console.error('Error fetching prices:', err);
                 ethToUsd = maticToUsd = 0; // Handle error by setting prices to 0
                 if (currentProduct) {
                     displayProductDetails(currentProduct); // Attempt to display even without rates
                 }
                  if (productStatusMessageEl) {
                      productStatusMessageEl.textContent = "Could not fetch live prices.";
                      productStatusMessageEl.style.color = 'orange';
                   }
              }
              // Clear message if it was just about fetching prices and product is loaded
               if (productStatusMessageEl && productStatusMessageEl.textContent === "Fetching live prices...") {
                    productStatusMessageEl.textContent = "";
               }
           }

        // Function to display all product details on the page
        // This includes name, image, description, NFT details, links, and prices.
        function displayProductDetails(product) {
            const productNameEl = document.getElementById("productName");
            const ethPriceTextEl = document.getElementById("ethPriceText");
            const polPriceTextEl = document.getElementById("polPriceText"); // Using polPriceText for consistency with HTML
            const productImageEl = document.getElementById("productImage");
            const productDescriptionEl = document.getElementById("productDescription");
            const nftDetailsDiv = document.getElementById("nftDetails");
            const nftContractAddressTextEl = document.getElementById("nftContractAddressText");
            const nftTokenIdTextEl = document.getElementById("nftTokenIdText");
            const nftMarketplaceLinkTextEl = document.getElementById("nftMarketplaceLinkText");
            const otherLinksDiv = document.getElementById("otherLinks");
            const listingLinkTextEl = document.getElementById("listingLinkText");
            const tokenSelectEthOption = tokenSelect.querySelector('option[value="eth"]'); // Get the ETH option
            const tokenSelectMaticOption = tokenSelect.querySelector('option[value="matic"]'); // Get the MATIC option

             // Ensure essential elements exist before trying to update them
             if (!productNameEl || !ethPriceTextEl || !polPriceTextEl || !tokenSelect || !payBtn || !paymentStatusMessageEl || !productStatusMessageEl) {
                 console.error("Essential product display elements not found in HTML.");
                  if (productStatusMessageEl) {
                      productStatusMessageEl.textContent = "Error: Page elements missing.";
                      productStatusMessageEl.style.color = 'red';
                   }
                 if (payBtn) payBtn.disabled = true;
                 return; // Cannot proceed without essential elements
             }


            if (!product) {
                // State when product is not found or an error occurred loading
                productNameEl.textContent = "Product Not Found";
                ethPriceTextEl.textContent = "ETH Price: N/A";
                polPriceTextEl.textContent = "MATIC Price: N/A"; // Update text to MATIC
                if (productImageEl) productImageEl.style.display = 'none';
                if (productDescriptionEl) productDescriptionEl.style.display = 'none';
                if (nftDetailsDiv) nftDetailsDiv.style.display = 'none';
                if (otherLinksDiv) otherLinksDiv.style.display = 'none';
                if (payBtn) payBtn.disabled = true; // Disable pay button

                // Disable and hide token select options
                if(tokenSelectEthOption) tokenSelectEthOption.disabled = true;
                if(tokenSelectMaticOption) tokenSelectMaticOption.disabled = true;
                tokenSelect.style.display = 'none';


                if (productStatusMessageEl) {
                    productStatusMessageEl.textContent = "Error: Product details could not be loaded or found.";
                    productStatusMessageEl.style.color = 'red';
                }

                 paymentStatusMessageEl.textContent = "Cannot process crypto payment.";
                 paymentStatusMessageEl.style.color = 'red';

                return;
            }

            // --- Display basic product details ---
            productNameEl.textContent = product.name || "Unnamed Product";

            // Display image if available (checks for base64 string or URL)
            if (productImageEl) {
                if (product.image && typeof product.image === 'string' && (product.image.startsWith('data:image') || product.image.startsWith('http'))) {
                     productImageEl.src = product.image;
                     productImageEl.style.display = 'block';
                 } else {
                     productImageEl.style.display = 'none'; // Hide if no valid image data
                 }
            }
            // Display description if available
            if (productDescriptionEl) {
                 if (product.description) {
                     productDescriptionEl.textContent = product.description;
                     productDescriptionEl.style.display = 'block';
                 } else {
                     productDescriptionEl.style.display = 'none'; // Hide if no description
                 }
            }


            // --- Display NFT details and links ---
            let showNftDetails = false;
            if (nftContractAddressTextEl) {
                if (product.contractAddress) {
                     nftContractAddressTextEl.innerHTML = `<strong>Contract:</strong> <a href="https://etherscan.io/address/${product.contractAddress}" target="_blank" rel="noopener noreferrer">${product.contractAddress}</a>`;
                     showNftDetails = true;
                 } else {
                     nftContractAddressTextEl.textContent = '';
                 }
            }
            if (nftTokenIdTextEl) {
                 if (product.tokenId) {
                      const openseaLink = product.contractAddress ? `<a href="https://opensea.io/assets/ethereum/${product.contractAddress}/${product.tokenId}" target="_blank" rel="noopener noreferrer">View on OpenSea</a>` : '';
                      nftTokenIdTextEl.innerHTML = `<strong>Token ID:</strong> ${product.tokenId} ${openseaLink ? `(${openseaLink})` : ''}`;
                      showNftDetails = true;
                  } else {
                      nftTokenIdTextEl.textContent = '';
                  }
             }
              if (nftMarketplaceLinkTextEl) {
                  if (product.nftMarketplaceLink && typeof product.nftMarketplaceLink === 'string' && product.nftMarketplaceLink.startsWith('http')) {
                       nftMarketplaceLinkTextEl.innerHTML = `<strong>NFT Marketplace Link:</strong> <a href="${product.nftMarketplaceLink}" target="_blank" rel="noopener noreferrer">${product.nftMarketplaceLink}</a>`;
                       showNftDetails = true;
                   } else {
                       nftMarketplaceLinkTextEl.textContent = '';
                   }
               }

            // Show or hide the NFT details div
            if (nftDetailsDiv) {
                nftDetailsDiv.style.display = showNftDetails ? 'block' : 'none';
            }

            // --- Display other relevant links ---
            let showOtherLinks = false;
             if (listingLinkTextEl) {
                 if (product.listingLink && typeof product.listingLink === 'string' && product.listingLink.startsWith('http')) {
                      listingLinkTextEl.innerHTML = `<strong>Listing Link:</strong> <a href="${product.listingLink}" target="_blank" rel="noopener noreferrer">${product.listingLink}</a>`;
                      showOtherLinks = true;
                  } else {
                      listingLinkTextEl.textContent = '';
                  }
               }
             // Show or hide the Other Links div
             if (otherLinksDiv) {
                 otherLinksDiv.style.display = showOtherLinks ? 'block' : 'none';
             }


            // --- Display prices and manage payment options ---
            let ethAvailable = false;
            let maticAvailable = false;

            // Display ETH price if available and is a valid number
            if (product.ethPrice !== undefined && product.ethPrice !== null && !isNaN(parseFloat(product.ethPrice))) {
                const ethAmount = parseFloat(product.ethPrice);
                const ethUsd = ethToUsd > 0 ? (ethAmount * ethToUsd).toFixed(2) : 'N/A';
                ethPriceTextEl.textContent = `${ethAmount} ETH ${ethUsd !== 'N/A' ? `(~$${ethUsd})` : ''}`;
                ethAvailable = true;
            } else {
                ethPriceTextEl.textContent = "ETH Price: N/A";
            }

            // Display MATIC price if available and is a valid number
            // Assuming 'polPrice' from admin panel maps to 'maticPrice' here
            if (product.polPrice !== undefined && product.polPrice !== null && !isNaN(parseFloat(product.polPrice))) {
                 const maticAmount = parseFloat(product.polPrice); // Use polPrice from product data
                 const maticUsd = maticToUsd > 0 ? (maticAmount * maticToUsd).toFixed(2) : 'N/A';
                 polPriceTextEl.textContent = `${maticAmount} MATIC ${maticUsd !== 'N/A' ? `(~$${maticUsd})` : ''}`;
                 maticAvailable = true;
             } else {
                polPriceTextEl.textContent = "MATIC Price: N/A";
             }

             // Enable/Disable token select options based on price availability
             if(tokenSelectEthOption) tokenSelectEthOption.disabled = !ethAvailable;
             if(tokenSelectMaticOption) tokenSelectMaticOption.disabled = !maticAvailable;


             // Manage visibility and selection of the token select dropdown
             if (ethAvailable && !maticAvailable) {
                 tokenSelect.value = 'eth'; // Auto-select ETH if only ETH is available
                 tokenSelect.style.display = ''; // Ensure select is visible
             } else if (!ethAvailable && maticAvailable) {
                 tokenSelect.value = 'matic'; // Auto-select MATIC if only MATIC is available
                 tokenSelect.style.display = ''; // Ensure select is visible
             } else if (!ethAvailable && !maticAvailable) {
                 tokenSelect.style.display = 'none'; // Hide select if neither is available
             } else { // Both ETH and MATIC are available (or only ETH, which is the default)
                 // tokenSelect.value remains its current value (defaults to 'eth' initially in HTML)
                 tokenSelect.style.display = ''; // Ensure select is visible
             }


            // Enable/Disable the Crypto Payment button based on available prices and wallet connection
            // Button is enabled only if a token price is available AND wallet is connected AND a method is selected
             const selectedPaymentMethod = tokenSelect.value; // Get selected value from the dropdown
             const isMethodAvailable = (selectedPaymentMethod === 'eth' && ethAvailable) || (selectedPaymentMethod === 'matic' && maticAvailable);

             if (isMethodAvailable && userAccount) {
                 payBtn.disabled = false;
             } else {
                 payBtn.disabled = true;
             }


             // Update payment status message based on wallet connection and price availability
             if (!userAccount) {
                 paymentStatusMessageEl.textContent = "Please connect your wallet to pay with crypto.";
                 paymentStatusMessageEl.style.color = 'blue';
             } else {
                 // Check if selected method is available now that wallet is connected
                 const selectedPaymentMethod = tokenSelect.value;
                 const isMethodAvailable = (selectedPaymentMethod === 'eth' && ethAvailable) || (selectedPaymentMethod === 'matic' && maticAvailable);

                 if (isMethodAvailable) {
                     paymentStatusMessageEl.textContent = `Wallet connected. Ready to pay with ${selectedPaymentMethod.toUpperCase()}.`;
                     paymentStatusMessageEl.style.color = 'green';
                 } else if (ethAvailable || maticAvailable) {
                      // Wallet connected, but selected method is N/A, or no method selected yet
                      paymentStatusMessageEl.textContent = "Wallet connected. Please select an available crypto payment method.";
                      paymentStatusMessageEl.style.color = 'orange';
                  }
                 else {
                     // Wallet connected, but neither ETH nor MATIC is available for this product
                     paymentStatusMessageEl.textContent = "Crypto payment is not available for this product.";
                     paymentStatusMessageEl.style.color = 'red';
                 }
             }


            // Clear product status message if successful load
             if (productStatusMessageEl && productStatusMessageEl.textContent === "Loading product details...") {
                  productStatusMessageEl.textContent = ""; // Clear initial loading message
                  productStatusMessageEl.style.color = 'gray'; // Reset color
              }

        }

        // --- Display cash payment methods as buttons ---
        function displayCashPaymentMethods(methods) {
            const cashMethodsDiv = document.getElementById('cashPaymentMethods');
            if (!cashMethodsDiv || !cashDetailsDisplayEl) {
                console.error("Cash payment method display elements not found.");
                return;
            }

            cashMethodsDiv.innerHTML = ''; // Clear existing buttons
            cashDetailsDisplayEl.style.display = 'none'; // Hide details display initially

            let methodsAvailable = false;

            // Helper to create and append a button
            const createButton = (name, emoji, detail) => {
                if (detail) {
                    methodsAvailable = true;
                    const button = document.createElement('button');
                    button.textContent = `${emoji} Pay with ${name}`;
                    button.addEventListener('click', () => {
                        cashDetailsDisplayEl.textContent = `${name} Details: ${detail}`;
                        cashDetailsDisplayEl.style.display = 'block';
                    });
                    cashMethodsDiv.appendChild(button);
                }
            };

            // Create buttons for each available method
            createButton('Venmo', '💸', methods.venmo);
            createButton('Cash App', '💰', methods.cashapp);
            createButton('Apple Pay', '📱', methods.applepay);
            createButton('PayPal', '📧', methods.paypal); // Or 🅿️

            // Show the cash payment section if any methods were added
            if (methodsAvailable) {
                cashMethodsDiv.style.display = 'block';
            } else {
                cashMethodsDiv.style.display = 'none';
            }
        }


        // --- Wallet Connection and Disconnection ---

        async function connectWallet() {
            if (window.ethereum) {
                try {
                     paymentStatusMessageEl.textContent = "Connecting wallet...";
                     paymentStatusMessageEl.style.color = 'orange';
                     // Request accounts will prompt the user to connect
                     provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                     const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }); // Use request directly
                     if (accounts.length > 0) {
                         userAccount = accounts[0];
                         signer = provider.getSigner(userAccount); // Get signer for the connected account

                         document.getElementById('walletDisplay').textContent = `Wallet: ${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;
                          paymentStatusMessageEl.textContent = `Wallet connected: ${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;
                          paymentStatusMessageEl.style.color = 'green';
                          localStorage.setItem('walletAddress', userAccount.toLowerCase()); // Remember wallet

                         // Update payment button state now that wallet is connected
                          if(currentProduct) { // Only update display if product is loaded
                               displayProductDetails(currentProduct); // Re-evaluate pay button state
                           }

                     } else {
                          console.warn("Wallet connected, but no accounts available.");
                          document.getElementById('walletDisplay').textContent = 'Wallet: —';
                          paymentStatusMessageEl.textContent = "Wallet connected, but no account available.";
                          paymentStatusMessageEl.style.color = 'orange';
                          if(payBtn) payBtn.disabled = true; // Disable pay
                      }
                      document.getElementById('connectBtn').textContent = '✅ Connected (Disconnect)';


                } catch (error) {
                     console.error("Wallet connection failed:", error);
                     if (error.code === 4001) { // User rejected request
                         paymentStatusMessageEl.textContent = "Wallet connection rejected by user.";
                     } else {
                         paymentStatusMessageEl.textContent = "Wallet connection failed. See console.";
                     }
                     paymentStatusMessageEl.style.color = 'red';
                     document.getElementById('walletDisplay').textContent = 'Wallet: —';
                     document.getElementById('connectBtn').textContent = '🔌 Connect Wallet';
                     if(payBtn) payBtn.disabled = true; // Disable pay
                     userAccount = null; // Ensure userAccount is null on failure
                     signer = undefined; // Clear signer
                     provider = undefined; // Clear provider
                }
            } else {
                paymentStatusMessageEl.textContent = "Please install MetaMask or an Ethereum-compatible wallet.";
                paymentStatusMessageEl.style.color = 'red';
                alert("Please install MetaMask or an Ethereum-compatible browser extension!");
                 document.getElementById('walletDisplay').textContent = 'Wallet: N/A';
                 document.getElementById('connectBtn').textContent = '🔌 Connect Wallet';
                 if(payBtn) payBtn.disabled = true; // Disable pay
                 userAccount = null; // Ensure userAccount is null
                 signer = undefined; // Clear signer
                 provider = undefined; // Clear provider
            }
        }

        function disconnectWallet() {
            userAccount = null;
            provider = undefined;
            signer = undefined;
            document.getElementById('walletDisplay').textContent = 'Wallet: —';
            document.getElementById('connectBtn').textContent = '🔌 Connect Wallet';
            if(payBtn) payBtn.disabled = true; // Disable pay on disconnect
            localStorage.removeItem('walletAddress'); // Clear stored wallet
             paymentStatusMessageEl.textContent = "Wallet disconnected.";
             paymentStatusMessageEl.style.color = 'gray';
             // Re-evaluate payment button state based on now disconnected wallet
              if(currentProduct) displayProductDetails(currentProduct);
        }


        // Handle Crypto Payment
        async function handleCryptoPayment() {
             if (!userAccount || !signer || !provider) {
                 paymentStatusMessageEl.textContent = "Please connect your wallet to make a purchase.";
                  paymentStatusMessageEl.style.color = 'blue';
                  return;
              }
             if (!currentProduct) {
                 paymentStatusMessageEl.textContent = "Product details not loaded.";
                  paymentStatusMessageEl.style.color = 'red';
                  return;
              }

             // Get shipping and quantity details from the form
             const form = document.getElementById('orderFormElement'); // Get the form element
             if (!form) {
                 console.error("Order form element not found.");
                  paymentStatusMessageEl.textContent = "Error: Order form not found.";
                  paymentStatusMessageEl.style.color = 'red';
                  return;
              }
             // Using checkValidity() requires form elements to have 'required' attribute
             if (!form.checkValidity()) {
                  alert("Please fill in all required shipping details.");
                  paymentStatusMessageEl.textContent = "Please fill in all required shipping details.";
                  paymentStatusMessageEl.style.color = 'red';
                  return;
               }

             const quantityInput = document.getElementById('quantity');
             if (!quantityInput) {
                  console.error("Quantity input element not found.");
                   paymentStatusMessageEl.textContent = "Error: Quantity input not found.";
                   paymentStatusMessageEl.style.color = 'red';
                   return;
                }
             const quantity = parseInt(quantityInput.value);

             if (isNaN(quantity) || quantity <= 0) {
                 alert('Please enter a valid quantity (at least 1).');
                  paymentStatusMessageEl.textContent = "Please enter a valid quantity (at least 1).";
                  paymentStatusMessageEl.style.color = 'red';
                  return;
              }

             // Get selected payment method from the dropdown
             const paymentMethod = tokenSelect.value; // 'eth' or 'matic'

             if (!paymentMethod || tokenSelect.style.display === 'none') { // Check if a method is selected and the select is visible
                  paymentStatusMessageEl.textContent = "Please select a crypto payment method (ETH or MATIC).";
                  paymentStatusMessageEl.style.color = 'red';
                  return;
              }

            let pricePerUnit;
            let tokenSymbol;
            let chainIdRequired;
            let tokenDecimals = 18; // Standard for ETH and MATIC (Gwei)

            if (paymentMethod === 'eth') {
                pricePerUnit = parseFloat(currentProduct.ethPrice);
                tokenSymbol = 'ETH';
                chainIdRequired = ETH_CHAIN_ID;
            } else if (paymentMethod === 'matic') {
                pricePerUnit = parseFloat(currentProduct.polPrice); // Use polPrice from product data
                tokenSymbol = 'MATIC'; // Use MATIC symbol for payment
                chainIdRequired = POLYGON_CHAIN_ID;
            } else {
                paymentStatusMessageEl.textContent = 'Invalid payment method selected.';
                paymentStatusMessageEl.style.color = 'red';
                return;
            }

            if (isNaN(pricePerUnit) || pricePerUnit <= 0) {
                 paymentStatusMessageEl.textContent = `Payment is not available for ${tokenSymbol} on this product.`;
                 paymentStatusMessageEl.style.color = 'red';
                 return;
             }

            const totalPrice = pricePerUnit * quantity;
            const totalUsd = (tokenSymbol === 'ETH' ? ethToUsd : maticToUsd) * totalPrice; // Calculate USD based on selected token rate


             if (RECIPIENT_WALLET_ADDRESS === "0xYourReceivingWalletAddress") {
                  alert("Recipient wallet address is not set in the code. Please update.");
                  paymentStatusMessageEl.textContent = "Error: Recipient wallet not configured.";
                  paymentStatusMessageEl.style.color = 'red';
                  return;
              }


            // Confirm transaction with the user
             const confirmationMessage = `Confirm Payment:\n\nItem: ${currentProduct.name || 'Unnamed Product'} (x${quantity})\nAmount: ${totalPrice} ${tokenSymbol}${totalUsd > 0 ? ' (~$' + totalUsd.toFixed(2) + ' USD)' : ''}\nTo: ${RECIPIENT_WALLET_ADDRESS.slice(0, 6)}...${RECIPIENT_WALLET_ADDRESS.slice(-4)}\n\nDo you want to proceed?`;

            if (!confirm(confirmationMessage)) {
                 paymentStatusMessageEl.textContent = "Payment cancelled by user.";
                 paymentStatusMessageEl.style.color = 'gray';
                 return; // User cancelled
             }

             paymentStatusMessageEl.textContent = `Checking network for ${tokenSymbol} payment...`;
             paymentStatusMessageEl.style.color = 'orange';

            try {
                // Ensure the user is on the correct network for the selected token
                const network = await provider.getNetwork();
                const chainId = network.chainId;

                 if (chainId !== chainIdRequired) {
                      alert(`Please switch your wallet network to ${tokenSymbol === 'ETH' ? 'Ethereum Mainnet' : 'Polygon Mainnet'} (Chain ID ${chainIdRequired}) to pay with ${tokenSymbol}.`);
                      paymentStatusMessageEl.textContent = `Payment cancelled (wrong network).`;
                      paymentStatusMessageEl.style.color = 'red';
                      return; // Stop if wrong chain
                   }

                  paymentStatusMessageEl.textContent = `Preparing transaction to send ${totalPrice} ${tokenSymbol}... Confirm in wallet.`;


                // Prepare and send the transaction
                // Use parseUnits with 18 decimals for both ETH and MATIC (Gwei)
                const amountWei = ethers.utils.parseUnits(totalPrice.toString(), tokenDecimals);

                const tx = await signer.sendTransaction({
                    to: RECIPIENT_WALLET_ADDRESS,
                    value: amountWei
                });

                console.log('Transaction sent:', tx.hash);
                 paymentStatusMessageEl.textContent = `Transaction sent! Tx Hash: ${tx.hash.substring(0, 6)}...${tx.hash.slice(-4)}. Waiting for confirmation...`;
                 paymentStatusMessageEl.style.color = 'orange';

                // Wait for the transaction to be mined and confirmed
                const receipt = await tx.wait();
                console.log('Transaction confirmed:', receipt);

                paymentStatusMessageEl.textContent = '✅ Payment successful and confirmed!';
                paymentStatusMessageEl.style.color = 'green';
                alert(`✅ Payment successful! Transaction confirmed! Tx Hash: ${receipt.hash}`);

                // --- Save Order to Firestore (AFTER successful payment confirmation) ---
                // Get shipping info again to ensure it's the latest from the form
                 const nameInput = document.getElementById('name');
                 const addressInput = document.getElementById('address');
                 const cityInput = document.getElementById('city');
                 const stateInput = document.getElementById('state');
                 const regionInput = document.getElementById('region');
                 const zipInput = document.getElementById('zip');


                 const shippingInfo = {
                     name: nameInput ? nameInput.value.trim() : 'N/A',
                     address: addressInput ? addressInput.value.trim() : 'N/A',
                     city: cityInput ? cityInput.value.trim() : 'N/A',
                     state: stateInput ? stateInput.value.trim() : 'N/A',
                     region: regionInput ? regionInput.value.trim() : 'N/A',
                     zip: zipInput ? zipInput.value.trim() : 'N/A',
                 };


                 const order = {
                     productId: getProductIdFromUrl(),
                     productName: currentProduct.name || 'Unnamed Product',
                     quantity: quantity,
                     totalAmountCrypto: totalPrice,
                     cryptoToken: tokenSymbol,
                     totalUsd: totalUsd > 0 ? parseFloat(totalUsd.toFixed(2)) : null,
                     buyerWallet: userAccount,
                     shippingInfo: shippingInfo,
                     transactionHash: receipt.hash,
                     timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                     status: 'Paid - Pending Fulfillment'
                 };

                 paymentStatusMessageEl.textContent = "Saving order details...";
                 paymentStatusMessageEl.style.color = 'orange';

                 // Add a small delay to allow user to read success message before Firestore
                 await new Promise(resolve => setTimeout(resolve, 1500));


                 await db.collection('orders').add(order);
                 console.log("Order saved to Firestore:", order);
                  paymentStatusMessageEl.textContent = '✅ Order placed successfully (Firestore saved)!';
                  paymentStatusMessageEl.style.color = 'green';
                  // alert('Order placed successfully and saved to admin panel!'); // Redundant alert


                 // Clear the order form after successful submission
                  if(form) form.reset();

             } catch (error) {
                console.error('Payment failed:', error);
                let errorMessage = '❌ Payment failed. Please try again.';
                 // Check for common errors (e.g., user rejected transaction, insufficient funds, network switch issues)
                 if (error.code === 4001) {
                     errorMessage = '❌ Transaction rejected by user.';
                 } else if (error.message && error.message.includes('insufficient funds')) { // Basic check for common error message
                      errorMessage = '❌ Payment failed: Insufficient funds.';
                  } else if (error.code === -32603) { // Internal error, often from chain mismatch or other provider issues
                       errorMessage = '❌ Payment failed: Wallet error (e.g., wrong network or RPC issue).';
                  }
                paymentStatusMessageEl.textContent = errorMessage;
                paymentStatusMessageEl.style.color = 'red';
             }
         }


        // --- On page load ---
        window.onload = async () => {
             // 1. Fetch product details first from localStorage
             const productId = getProductIdFromUrl();
             if (productId) {
                  productStatusMessageEl.textContent = "Loading product details...";
                  productStatusMessageEl.style.color = 'gray';

                 currentProduct = fetchProductFromLocalStorage(productId);

                 if (!currentProduct) {
                     console.error("Product not found in localStorage with ID:", productId);
                     updateProductDisplay(); // Display "Product Not Found" state
                 } else {
                     console.log("Product loaded:", currentProduct);
                      // Product found, now fetch live rates and update display fully
                      // Display basic details immediately while rates fetch
                       document.getElementById("productName").textContent = currentProduct.name || "Loading Prices...";
                        if (currentProduct.ethPrice !== undefined && currentProduct.ethPrice !== null) document.getElementById("ethPriceText").textContent = `${currentProduct.ethPrice} ETH`;
                         // Changed POL to MATIC text and check
                         if (currentProduct.polPrice !== undefined && currentProduct.polPrice !== null) document.getElementById("polPriceText").textContent = `${currentProduct.polPrice} MATIC`;


                      // Fetch live rates (this will call updateProductDisplay again with USD values and final button/select state)
                       fetchPrices();
                   }
              } else {
                 // No product ID in the URL
                 console.error("No product ID provided in URL.");
                 productStatusMessageEl.textContent = "Error: No product selected.";
                 productStatusMessageEl.style.color = 'red';
                 updateProductDisplay(); // Display "Error: No Product Selected" state
              }

             // 2. Fetch and display cash payment methods
             cashPaymentDetails = fetchCashPaymentMethods();
             displayCashPaymentMethods(cashPaymentDetails);


            // Add event listeners
            document.getElementById("connectBtn").addEventListener("click", connectWallet);
            // Use form submit listener instead of button click for better form handling (validation)
            document.getElementById('orderFormElement')?.addEventListener('submit', function(event) {
                 event.preventDefault(); // Prevent default form submission
                 handleCryptoPayment(); // Call your payment handler
             });

             // Update display when the selected token changes
             if(tokenSelect) {
                 tokenSelect.addEventListener('change', () => {
                     // Only update if a product is loaded and potentially purchaseable
                     if (currentProduct && (currentProduct.ethPrice > 0 || currentProduct.polPrice > 0)) {
                          displayProductDetails(currentProduct); // Update button state and status message
                     }
                 });
             }


             // Initial wallet check on load
             // Check if window.ethereum is available and user has previously connected
              if (window.ethereum) {
                  window.ethereum.on('accountsChanged', (accounts) => {
                      if (accounts.length === 0) {
                          // Wallet disconnected or all accounts removed
                          disconnectWallet();
                      } else {
                          // Account changed (or connected if previously disconnected)
                          userAccount = accounts[0];
                          provider = new ethers.providers.Web3Provider(window.ethereum, "any"); // Re-initialize provider
                          signer = provider.getSigner(userAccount); // Re-initialize signer
                          document.getElementById('walletDisplay').textContent = `Wallet: ${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;
                          paymentStatusMessageEl.textContent = `Wallet account changed to: ${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;
                          paymentStatusMessageEl.style.color = 'blue';
                          localStorage.setItem('walletAddress', userAccount.toLowerCase()); // Remember new wallet

                           if(currentProduct) {
                               displayProductDetails(currentProduct); // Update display based on new account/connection
                            }
                      }
                  });

                  window.ethereum.on('chainChanged', (chainId) => {
                      // Reload the page or update UI to reflect the new chain
                      console.log("Chain changed to", chainId);
                      paymentStatusMessageEl.textContent = `Wallet network changed. Please check if it matches your selected payment token.`;
                      paymentStatusMessageEl.style.color = 'orange';
                      // Optionally, you could prompt the user to switch back or refresh
                       if(currentProduct) {
                            // Re-evaluate button state and status message
                           displayProductDetails(currentProduct);
                       }
                       // Consider a full page reload for simplicity, but this can disrupt user
                       // window.location.reload();
                  });


                   // Check initial connection state on load if MetaMask is already unlocked and connected
                   // Use listAccounts() as it doesn't prompt the user
                   const checkInitialConnection = async () => {
                       try {
                           // Only proceed if ethereum is available and connected (avoids errors if not)
                           if (window.ethereum && window.ethereum.isConnected()) {
                               provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                               const accounts = await provider.listAccounts();
                               if (accounts.length > 0) {
                                   userAccount = accounts[0];
                                   signer = provider.getSigner(userAccount);
                                   document.getElementById('walletDisplay').textContent = `Wallet: ${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;
                                    paymentStatusMessageEl.textContent = `Wallet connected: ${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`;
                                    paymentStatusMessageEl.style.color = 'green';
                                    localStorage.setItem('walletAddress', userAccount.toLowerCase());

                                    if(currentProduct) {
                                         displayProductDetails(currentProduct); // Update display based on initial connection
                                     }
                               } else {
                                   console.log("MetaMask is connected but no accounts exposed.");
                                   document.getElementById('walletDisplay').textContent = 'Wallet: —';
                                   paymentStatusMessageEl.textContent = "MetaMask connected, but no account selected. Click 'Connect Wallet'.";
                                   paymentStatusMessageEl.style.color = 'orange';
                                   if(payBtn) payBtn.disabled = true;
                               }
                           } else {
                               console.log("MetaMask not detected or not connected on load.");
                               document.getElementById('walletDisplay').textContent = 'Wallet: —';
                               paymentStatusMessageEl.textContent = "Please connect your wallet to pay with crypto.";
                               paymentStatusMessageEl.style.color = 'blue';
                               if(payBtn) payBtn.disabled = true;
                           }
                       } catch (error) {
                           console.error("Error during initial wallet check:", error);
                           document.getElementById('walletDisplay').textContent = 'Wallet: —';
                           paymentStatusMessageEl.textContent = "Error checking wallet status. Click 'Connect Wallet'.";
                           paymentStatusMessageEl.style.color = 'red';
                           if(payBtn) payBtn.disabled = true;
                       }
                   };

                   checkInitialConnection(); // Run the check on page load

               } else {
                  // MetaMask not detected at all
                  document.getElementById('walletDisplay').textContent = 'Wallet: N/A';
                  paymentStatusMessageEl.textContent = "Please install MetaMask or an Ethereum-compatible wallet.";
                  paymentStatusMessageEl.style.color = 'red';
                  if(payBtn) payBtn.disabled = true;
                  document.getElementById('connectBtn').textContent = '🔌 Install Wallet'; // Change button text
                  document.getElementById('connectBtn').onclick = () => window.open('https://metamask.io/', '_blank'); // Link to install
              }

        }; // End window.onload

    </script>
</body>
</html>