// State
let cart = [];
const WHATSAPP_NUMBER = "918072198717"; // REPLACE WITH ACTUAL BUSINESS NUMBER (Include country code, e.g., 91 for India)

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartToggle = document.getElementById('cart-toggle');
const closeCartBtn = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const emptyCartMsg = document.getElementById('empty-cart-msg');
const cartTotalElement = document.getElementById('cart-total');
const cartBadge = document.getElementById('cart-badge');
const checkoutBtn = document.getElementById('checkout-btn');

// Customer Details Inputs
const customerNameInput = document.getElementById('customer-name');
const customerMobileInput = document.getElementById('customer-mobile');
const customerAddressInput = document.getElementById('customer-address');
const customerPincodeInput = document.getElementById('customer-pincode');

// Initialize Icons
lucide.createIcons();

// --- Functions ---

function init() {
    renderProducts();
    updateCartUI();
    
    // Event Listeners
    cartToggle.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    checkoutBtn.addEventListener('click', handleCheckout);

    // Input Validations
    customerNameInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, ''); // Removes anything that is not a letter or space
    });
    
    customerMobileInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, ''); // Removes anything that is not a digit
    });
    
    customerPincodeInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, ''); // Removes anything that is not a digit
    });
}

function renderProducts() {
    productGrid.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-stone-100 flex flex-col';
        
        productCard.innerHTML = `
            <div class="h-48 overflow-hidden relative p-4">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain hover:scale-105 transition-transform duration-500">
            </div>
            <div class="p-5 flex-grow flex flex-col">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="text-lg font-bold text-stone-800 leading-tight">${product.name}</h4>
                </div>
                <p class="text-sm text-stone-500 mb-4 flex-grow">${product.description}</p>
                
                <div class="mt-auto pt-4 border-t border-stone-100 flex flex-col gap-3">
                    <div class="flex justify-between items-center">
                        <select id="variant-${product.id}" onchange="updatePriceDisplay('${product.id}')" class="bg-stone-50 border border-stone-200 text-stone-700 text-sm font-medium rounded-lg focus:ring-brand-500 focus:border-brand-500 block px-2 py-1 outline-none cursor-pointer">
                            ${product.variants.map((v, i) => `<option value="${i}">${v.unit}</option>`).join('')}
                        </select>
                        <span id="price-${product.id}" class="text-xl font-extrabold text-brand-600">₹${product.variants[0].price}</span>
                    </div>
                    <button onclick="addToCart('${product.id}')" class="w-full bg-brand-50 hover:bg-brand-100 text-brand-700 py-2 rounded-xl transition-colors font-bold flex justify-center items-center gap-2">
                        <i data-lucide="plus" class="h-5 w-5"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
    lucide.createIcons(); // Re-initialize icons for newly added elements
}

function updatePriceDisplay(productId) {
    const product = products.find(p => p.id === productId);
    const select = document.getElementById(`variant-${productId}`);
    const priceDisplay = document.getElementById(`price-${productId}`);
    const selectedVariant = product.variants[select.value];
    priceDisplay.textContent = `₹${selectedVariant.price}`;
}

function showToast(message) {
    // Remove any existing toasts to prevent stacking
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    // The 'toast' class is for the animation defined in CSS
    // We use Tailwind classes for the rest of the styling
    toast.className = 'toast bg-stone-800 text-white font-medium py-3 px-6 rounded-full flex items-center gap-3 shadow-lg';
    
    toast.innerHTML = `
        <i data-lucide="check-circle" class="h-5 w-5 text-green-400"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    lucide.createIcons();

    // The toast will be removed by the CSS animation, but this is a fallback
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 3000); // Duration should match the CSS animation
}

function toggleCart() {
    cartSidebar.classList.toggle('open');
    cartOverlay.classList.toggle('open');
    if(cartSidebar.classList.contains('open')) {
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
        document.body.style.overflow = '';
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const select = document.getElementById(`variant-${productId}`);
    const variantIndex = select.value;
    const variant = product.variants[variantIndex];
    
    // Create a unique cart item ID based on product and variant
    const cartItemId = `${productId}-${variantIndex}`;
    const existingItem = cart.find(item => item.cartItemId === cartItemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ 
            cartItemId: cartItemId,
            name: product.name,
            image: product.image,
            unit: variant.unit,
            price: variant.price,
            quantity: 1 
        });
    }

    updateCartUI();
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    // Show toast notification
    showToast(`${product.name} (${variant.unit}) added! (Total items in cart: ${totalItems})`);

    // Simple visual feedback on cart icon
    cartToggle.classList.add('text-brand-600', 'scale-110');
    setTimeout(() => {
        cartToggle.classList.remove('text-brand-600', 'scale-110');
    }, 300);
}

function removeFromCart(cartItemId) {
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    updateCartUI();
}

function updateQuantity(cartItemId, delta) {
    const item = cart.find(i => i.cartItemId === cartItemId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(cartItemId);
        } else {
            updateCartUI();
        }
    }
}

function updateCartUI() {
    // Update Badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    if (totalItems > 0) {
        cartBadge.classList.remove('scale-0');
        cartBadge.classList.add('scale-100');
    } else {
        cartBadge.classList.remove('scale-100');
        cartBadge.classList.add('scale-0');
    }

    // Update Items List
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.appendChild(emptyCartMsg);
        checkoutBtn.disabled = true;
    } else {
        checkoutBtn.disabled = false;
        cart.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'flex gap-4 p-3 bg-stone-50 rounded-xl border border-stone-100';
            itemEl.innerHTML = `
                <img src="${item.image}" class="w-16 h-16 rounded-lg object-cover" alt="${item.name}">
                <div class="flex-grow flex flex-col justify-between">
                    <div class="flex justify-between items-start">
                        <div class="flex flex-col">
                            <h5 class="text-sm font-bold text-stone-800 line-clamp-2">${item.name}</h5>
                            <span class="text-xs text-stone-500 font-medium">${item.unit}</span>
                        </div>
                        <button onclick="removeFromCart('${item.cartItemId}')" class="text-stone-400 hover:text-red-500 p-1">
                            <i data-lucide="trash-2" class="h-4 w-4"></i>
                        </button>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <div class="flex items-center gap-2 bg-white rounded-lg border border-stone-200 px-2 py-1">
                            <button onclick="updateQuantity('${item.cartItemId}', -1)" class="text-stone-500 hover:text-brand-600"><i data-lucide="minus" class="h-3 w-3"></i></button>
                            <span class="text-xs font-bold w-4 text-center">${item.quantity}</span>
                            <button onclick="updateQuantity('${item.cartItemId}', 1)" class="text-stone-500 hover:text-brand-600"><i data-lucide="plus" class="h-3 w-3"></i></button>
                        </div>
                        <span class="font-bold text-brand-600 text-sm">₹${item.price * item.quantity}</span>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
    }

    // Update Total
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = `₹${totalAmount}`;
    
    lucide.createIcons();
}

function handleCheckout() {
    if (cart.length === 0) return;

    const name = customerNameInput.value.trim();
    const mobile = customerMobileInput.value.trim();
    const address = customerAddressInput.value.trim();
    const pincode = customerPincodeInput.value.trim();

    if (!name || !mobile || !address || !pincode) {
        alert("Please fill in all delivery details (Name, Mobile, Address, Pincode) before checking out.");
        return;
    }

    if (mobile.length !== 10) {
        alert("Please enter a valid 10-digit Mobile Number.");
        return;
    }

    if (pincode.length !== 6) {
        alert("Please enter a valid 6-digit Pincode.");
        return;
    }

    let message = "*New Order - Naati Ruchulu*\n\n";
    message += "*Delivery Details:*\n";
    message += `Name: ${name}\n`;
    message += `Mobile: ${mobile}\n`;
    message += `Address: ${address}\n`;
    message += `Pincode: ${pincode}\n\n`;
    
    message += "*Order Details:*\n";
    cart.forEach((item, index) => {
        message += `${index + 1}. *${item.name}* (${item.unit})\n`;
        message += `   ${item.quantity} x ₹${item.price} = ₹${item.quantity * item.price}\n`;
    });
    
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\n*Total Amount: ₹${totalAmount}*\n\n`;
    message += "Please confirm my order.";

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');

    // Clear cart and form data
    cart = [];
    updateCartUI();
    customerNameInput.value = '';
    customerMobileInput.value = '';
    customerAddressInput.value = '';
    customerPincodeInput.value = '';
    
    // Close the cart sidebar
    toggleCart();
}

// Start app
init();