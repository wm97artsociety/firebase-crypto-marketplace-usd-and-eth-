import { getEthPriceInUSD, getPolPriceInUSD } from "@/lib/getTokenPrices"; // Assuming this utility fetches prices
import Head from 'next/head'; // Assuming Next.js for Head component
import { useState, useEffect } from 'react'; // Assuming React hooks might be used later

// Define the structure of a product object based on what the admin panel stores
type Product = {
  id: string; // Unique identifier for the product
  name: string;
  description?: string; // Optional description
  keywords?: string | string[]; // Keywords (can be comma-separated string or array)
  ethPrice?: number; // ETH price
  polPrice?: number; // POL price (if applicable and stored)
  image?: string | null; // Base64 image string or URL, or null
  contractAddress?: string; // Optional NFT contract address
  tokenId?: string; // Optional NFT token ID
  nftMarketplaceLink?: string; // Optional NFT marketplace link
  listingLink?: string; // Optional general listing link
  // Add other fields as needed (e.g., category)
};

// getServerSideProps runs on the server for each request to fetch data
export async function getServerSideProps() {
  let ethPrice = 0;
  let polPrice = 0;
  let products: Product[] = [];
  let error = null;

  try {
    // --- Fetch cryptocurrency prices ---
    // Using Promise.all to fetch both prices concurrently
    const [ethRes, polRes] = await Promise.all([
      getEthPriceInUSD().catch(err => { console.error("Failed to fetch ETH price:", err); return null; }), // Catch errors for individual fetches
      getPolPriceInUSD().catch(err => { console.error("Failed to fetch POL price:", err); return null; })
    ]);

    if (ethRes !== null) ethPrice = ethRes;
    if (polRes !== null) polPrice = polRes;

    // --- Fetch products from a backend API or database ---
    // ** IMPORTANT: Replace this placeholder fetch with your actual data fetching logic **
    // This assumes you have a backend endpoint that serves the product data stored by your admin panel.
    // If you are using Firebase Firestore, uncomment the Firebase Admin SDK code below and configure it.
    try {
         const productsResponse = await fetch(`${process.env.NEXT_PUBLIC_YOUR_BACKEND_API_URL}/api/products`); // Example: using Next.js public env var
         if (!productsResponse.ok) {
             console.error("Failed to fetch products:", productsResponse.status, productsResponse.statusText);
             // Set an error message to display on the frontend
             error = `Failed to load products: ${productsResponse.status} ${productsResponse.statusText}`;
             products = []; // Ensure products array is empty on failure
         } else {
            products = await productsResponse.json();
             // Ensure products have an ID if coming from a source that doesn't explicitly provide one
             products = products.map(p => ({ ...p, id: p.id || Math.random().toString(36).substring(2) })); // Simple fallback ID if missing
         }

    } catch (fetchError) {
         console.error("Error fetching products from backend:", fetchError);
         error = `Failed to connect to product backend.`;
         products = [];
    }


    // If using Firebase Firestore directly in getServerSideProps (requires Firebase Admin SDK setup)
    /*
     try {
        const admin = require('firebase-admin');
        // Initialize Firebase Admin SDK only once
         if (!admin.apps.length) {
             // Ensure your Firebase Admin SDK credentials are set up securely
             admin.initializeApp({
                 credential: admin.credential.cert({
                     projectId: process.env.FIREBASE_PROJECT_ID,
                     clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                     // Use environment variables for private key and replace escape characters
                     privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                 })
                 // databaseURL: process.env.FIREBASE_DATABASE_URL, // If using Realtime Database
             });
         }
         const db = admin.firestore(); // Get Firestore instance
         const productsSnapshot = await db.collection('products').get(); // Fetch documents from 'products' collection

         // Map Firestore documents to Product type
         products = productsSnapshot.docs.map(doc => ({
             id: doc.id, // Use Firestore document ID as product ID
             ...doc.data() as Omit<Product, 'id'> // Spread document data, casting it and omitting 'id' since we use doc.id
         }));

         console.log(`Workspaceed ${products.length} products from Firestore.`); // Log success

     } catch (firebaseError) {
         console.error("Error fetching products from Firebase:", firebaseError);
         error = `Failed to load products from database.`; // Set frontend error message
         products = []; // Ensure products array is empty on failure
     }
    */


  } catch (overallError) {
    console.error("Overall error in getServerSideProps:", overallError);
    // Catch any other unexpected errors during the process
    error = error || "An unexpected error occurred."; // Use existing error or a general one
    products = products || []; // Ensure products array is defined
  }

  // Return the fetched data (and error if any) as props
  return {
    props: {
      ethPrice,
      polPrice,
      products,
      error, // Pass error message to the component
    },
    // optional: revalidate every X seconds if using Next.js Incremental Static Regeneration (ISR)
    // revalidate: 60, // Example: revalidate every 60 seconds
  };
}

// The Home component receives the fetched data as props
export default function Home({
  ethPrice, // ETH price in USD
  polPrice, // POL price in USD
  products, // Array of products fetched from the backend
  error // Optional error message
}: {
  ethPrice: number;
  polPrice: number;
  products: Product[];
  error?: string;
}) {
  // State for potential client-side filtering/searching if not done server-side
  // const [displayedProducts, setDisplayedProducts] = useState(products);

  // Effect to update displayed products if initial products prop changes (e.g., due to revalidation in Next.js ISR)
  // useEffect(() => {
  //   setDisplayedProducts(products);
  // }, [products]);

  // --- Basic Wallet Connection Logic (Client-side) ---
  // This logic is client-side and doesn't need getServerSideProps access to wallet
  // It's similar to the logic in index.html
   const [userAccount, setUserAccount] = useState<string | null>(null);
   const [walletDisplay, setWalletDisplay] = useState('Wallet: —');
   const [isAdmin, setIsAdmin] = useState(false);

   // ⚡ ADMIN WALLET ADDRESS - !! MAKE THIS THE SAME AS IN admin.html AND YOUR BACKEND CONFIG !!
   // Using a public environment variable in Next.js
   const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET?.toLowerCase() || "0x"; // Use your admin wallet here

   // State for ETH/USD price if needed client-side (already fetched server-side and passed as prop)
   // You might refetch client-side for real-time updates if needed

   useEffect(() => {
       const connectWallet = async () => {
           if (window.ethereum) {
               try {
                   // Check if already connected and get accounts without prompting user again immediately
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        const account = accounts[0];
                        handleWalletConnection(account);
                    } else {
                       // No accounts connected, user needs to click button
                       setWalletDisplay('Wallet: —');
                       setUserAccount(null);
                       setIsAdmin(false);
                       console.log("No accessible accounts, waiting for user to connect.");
                    }

                   // Listen for account changes
                    window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
                        if (newAccounts.length > 0) {
                            handleWalletConnection(newAccounts[0]);
                        } else {
                            handleWalletDisconnect();
                        }
                    });

                   // Listen for chain changes
                   window.ethereum.on('chainChanged', (chainId: string) => {
                       console.log("Chain changed to:", chainId);
                       // Depending on your app, you might prompt the user to switch or disconnect
                       // alert("Network changed. Please reconnect or switch to the correct network.");
                       // handleWalletDisconnect(); // Example: auto disconnect on chain change
                   });

               } catch (error) {
                   console.error("Error checking initial wallet connection:", error);
                   setWalletDisplay('Wallet: Error');
                   setUserAccount(null);
                   setIsAdmin(false);
               }
           } else {
               // MetaMask not installed
               setWalletDisplay('Wallet: N/A');
               setUserAccount(null);
               setIsAdmin(false);
               console.log("Ethereum wallet not detected.");
           }
       };

       // Handle user clicking the connect button
       const connectButton = document.getElementById('connectBtn');
       if (connectButton) {
           const handleClick = async () => {
               if (userAccount) {
                   // If already connected, disconnect
                   handleWalletDisconnect();
               } else {
                   // If not connected, request accounts
                   if (window.ethereum) {
                       try {
                            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                            if (accounts.length > 0) {
                                handleWalletConnection(accounts[0]);
                                localStorage.setItem('walletAddress', accounts[0].toLowerCase()); // Save for remembering
                            } else {
                                alert("No accounts found or connected after request.");
                            }
                       } catch (error: any) {
                            console.error("User rejected wallet connection:", error);
                             if (error.code === 4001) { // User rejected request
                                 alert("Wallet connection rejected by user.");
                             } else {
                                 alert("Wallet connection failed. See console.");
                             }
                       }
                   } else {
                       alert('Please install MetaMask or an Ethereum-compatible browser extension!');
                   }
               }
           };
           connectButton.addEventListener('click', handleClick);

           // Clean up event listener on component unmount
           return () => {
               connectButton.removeEventListener('click', handleClick);
               // Optional: Remove other listeners if attached globally
               // window.ethereum.removeListener('accountsChanged', ...);
               // window.ethereum.removeListener('chainChanged', ...);
           };
       }

       connectWallet(); // Attempt connection on mount

   }, [userAccount]); // Re-run effect if userAccount changes

   const handleWalletConnection = (account: string) => {
       setUserAccount(account);
       const short = `${account.slice(0, 6)}...${account.slice(-4)}`;
       setWalletDisplay(`Wallet: ${short}`);
       const connectBtn = document.getElementById('connectBtn');
       if(connectBtn) connectBtn.textContent = '✅ Connected (Disconnect)';

       // Check if admin
       if (account.toLowerCase() === ADMIN_WALLET) {
           setIsAdmin(true);
       } else {
           setIsAdmin(false);
       }
   };

   const handleWalletDisconnect = () => {
       setUserAccount(null);
       setWalletDisplay('Wallet: —');
       const connectBtn = document.getElementById('connectBtn');
        if(connectBtn) connectBtn.textContent = '🔌 Connect Wallet';
       setIsAdmin(false);
       localStorage.removeItem('walletAddress'); // Remove remembered wallet
   };


  // Placeholder functions for filtering and searching (client-side example)
  const filterCategory = (category: string) => {
      console.log("Filtering by category:", category);
      // Implement actual filtering logic here, maybe using state
      // e.g., setDisplayedProducts(products.filter(...));
  };

  const searchProducts = () => {
      const input = document.getElementById('searchInput') as HTMLInputElement;
      const filter = input?.value.toLowerCase() || '';
      console.log("Searching for:", filter);
      // Implement actual search logic here, maybe using state
      // e.g., setDisplayedProducts(products.filter(...));
  };

    // Ensure global functions used by inline event handlers (like category buttons) are accessible
    // In Next.js/React, avoid inline handlers like onclick="filterCategory('all')"
    // Instead, attach event listeners using React refs or getElementById in a useEffect.
    // For simplicity matching the original HTML structure, I'll leave the inline handlers for now,
    // but they would typically require the functions to be attached to the window object or refactored.
     if (typeof window !== 'undefined') {
         // @ts-ignore // Ignore TypeScript error for attaching to window
         window.filterCategory = filterCategory;
          // @ts-ignore // Ignore TypeScript error for attaching to window
         window.searchProducts = searchProducts;
     }


  return (
    <>
      <Head>
        <title>Universal Crypto Marketplace</title>
        {/* Add other head elements like meta tags */}
      </Head>

      {/* Top Bar */}
      <div style={{ background: '#222', color: 'white', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>🌎 Universal Crypto Marketplace</h1>
          <p>Buy items using ETH!</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <span id="walletDisplay">{walletDisplay}</span>
          {/* Button will be controlled by JS/React state */}
          <button id="connectBtn" style={{ background: '#0073e6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
            🔌 {userAccount ? 'Connected (Disconnect)' : 'Connect Wallet'}
          </button>
          {/* Admin button shown based on isAdmin state */}
          {isAdmin && (
            <button onClick={() => window.location.href = 'admin.html'} style={{ background: '#0073e6', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
              Admin Panel
            </button>
          )}
          <button onClick={() => window.location.href = 'support.html'} style={{ background: '#f39c12', color: 'white', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
            Support & Contact
          </button>
        </div>
      </div>

      {/* Header Menu */}
      <div style={{ background: '#fff', padding: '10px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => filterCategory('all')} style={{ background: '#eee', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>All Items</button>
          <button onClick={() => filterCategory('clothing')} style={{ background: '#eee', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Clothing</button>
          <button onClick={() => filterCategory('accessories')} style={{ background: '#eee', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Accessories</button>
          {/* Add more category buttons */}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" id="searchInput" placeholder="Search for products..." onChange={searchProducts} /> {/* Use onChange for React */}
        </div>
      </div>

      {/* Products Grid */}
      <div className="products" id="productList">
        {error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : products.length === 0 ? (
          <p>No products available at this time.</p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              style={{
                border: "1px solid #ddd",
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: "6px",
                width: "250px",
                textAlign: "center",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                backgroundColor: "white",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              {/* Display Image if available */}
              <img
                  src={product.image || 'placeholder-image.png'} // Use placeholder if no image
                  alt={product.name || 'Product Image'}
                  style={{
                       maxWidth: "100%",
                       height: "150px", // Fixed height
                       borderRadius: "6px",
                       objectFit: "cover",
                       marginBottom: "10px"
                  }}
               />

              {/* Product Name and Indicators */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '5px' }}>
                  <h3 style={{ margin: 0, flexGrow: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name || 'Unnamed Product'}
                  </h3>
                  <div style={{ flexShrink: 0, marginLeft: '5px', fontSize: '1.1em' }}>
                      {/* NFT Indicator */}
                      {(product.contractAddress || product.tokenId || (product.nftMarketplaceLink && product.nftMarketplaceLink.startsWith('http'))) && (
                          <span title="NFT Item" style={{ cursor: 'help' }}>💎</span>
                      )}
                      {/* Listing Link Indicator */}
                      {(product.listingLink && product.listingLink.startsWith('http')) && (
                           <span title="Has Listing Link" style={{ cursor: 'help', marginLeft: '5px' }}>🔗</span>
                      )}
                      {/* Add other indicators if needed (e.g., has description, etc.) */}
                  </div>
              </div>


              {/* Display description snippet if available */}
              {product.description && (
                   <p style={{textAlign: 'left', fontSize: '0.9em', color: '#555', marginBottom: '8px'}}>
                       {product.description.substring(0, 70)}{product.description.length > 70 ? '...' : ''} {/* Shorter snippet */}
                   </p>
              )}


              {/* Display prices if available */}
              {product.ethPrice !== undefined && product.ethPrice !== null && ethPrice > 0 && (
                <p className="price" style={{textAlign: 'left'}}>
                  💰 {product.ethPrice} ETH {ethPrice > 0 ? `(~$${(product.ethPrice * ethPrice).toFixed(2)} USD)` : ''}
                </p>
              )}
              {/* Assuming POL price is also fetched and available if present in product */}
              {product.polPrice !== undefined && product.polPrice !== null && polPrice > 0 && (
                 <p className="price" style={{textAlign: 'left'}}>
                   🟣 {product.polPrice} POL {polPrice > 0 ? `(~$${(product.polPrice * polPrice).toFixed(2)} USD)` : ''}
                 </p>
              )}


              {/* Add a "View Product" button or link */}
              {product.id && ( // Only show button if product has an ID
                  // Use Next.js Link component for client-side navigation if possible
                  // <Link href={`/product/${product.id}`} passHref>
                      <button onClick={() => window.location.href=`product.html?id=${product.id}`} style={{padding: '10px 15px', background: '#0073e6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%', marginTop: 'auto'}}> {/* Use auto margin-top to push button down */}
                          View Product
                      </button>
                  // </Link>
              )}

              {/* Optional: Directly link to NFT Marketplace or Listing Link on the card if preferred */}
              {/* These would replace or supplement the "View Product" button */}
              {/* {product.nftMarketplaceLink && (
                  <a href={product.nftMarketplaceLink} target="_blank" rel="noopener noreferrer" style={{fontSize: '0.9em', marginTop: '5px', display: 'block'}}>View NFT</a>
              )}
               {product.listingLink && (
                   <a href={product.listingLink} target="_blank" rel="noopener noreferrer" style={{fontSize: '0.9em', marginTop: '5px', display: 'block'}}>View Listing</a>
               )} */}

            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{marginTop: '50px', textAlign: 'center', padding: '20px', background: '#222', color: 'white'}}>
           &copy; 2025 Universal Crypto Marketplace. All Rights Reserved.
      </div>
    </>
  );
}