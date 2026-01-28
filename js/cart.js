
js_content = '''// ============================================
// الحطة الملكية - Cart & Checkout
// ============================================

// Default delivery settings
const defaultDeliverySettings = {
    options: [
        { id: 0, name: 'استلام من المحل', price: 0 },
        { id: 1, name: 'توصيل ذهاب', price: 1000 },
        { id: 2, name: 'توصيل ذهاب وإياب', price: 2000 }
    ],
    whatsappNumber: '213781054132',
    storeLocation: 'وهران، الجزائر'
};

// Initialize delivery settings
function initDeliverySettings() {
    if (!localStorage.getItem('deliverySettings')) {
        localStorage.setItem('deliverySettings', JSON.stringify(defaultDeliverySettings));
    }
}

// Get delivery settings
function getDeliverySettings() {
    return JSON.parse(localStorage.getItem('deliverySettings')) || defaultDeliverySettings;
}

// Get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Add to cart
function addToCart(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showToast('المنتج غير موجود', 'error');
        return;
    }

    const cart = getCart();
    
    // Check if already in cart
    if (cart.some(item => item.id === productId)) {
        showToast('المنتج موجود بالفعل في السلة');
        return;
    }

    cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category
    });

    saveCart(cart);
    showToast('تمت الإضافة للسلة بنجاح');
}

// Remove from cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    loadCart();
    showToast('تم الحذف من السلة');
}

// Load cart page
function loadCart() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const cartContent = document.getElementById('cart-content');
    const emptyCart = document.getElementById('empty-cart');
    const checkoutSection = document.getElementById('checkout-section');
    const cartLayout = document.getElementById('cart-layout');

    if (cart.length === 0) {
        if (cartLayout) cartLayout.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
        if (checkoutSection) checkoutSection.style.display = 'none';
        return;
    }

    if (cartLayout) cartLayout.style.display = 'grid';
    if (emptyCart) emptyCart.style.display = 'none';
    if (checkoutSection) checkoutSection.style.display = 'block';

    // Render cart items
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-category">${getCategoryName(item.category)}</p>
                    <p class="cart-item-price">${formatPrice(item.price)}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="btn-remove" onclick="removeFromCart(${item.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        حذف
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Load delivery options
    loadDeliveryOptions();

    // Calculate totals
    calculateTotals();
}

// Load delivery options
function loadDeliveryOptions() {
    const container = document.getElementById('delivery-options');
    if (!container) return;

    const settings = getDeliverySettings();
    const savedOption = localStorage.getItem('selectedDelivery') || '0';

    container.innerHTML = settings.options.map(option => `
        <label class="delivery-option ${savedOption == option.id ? 'selected' : ''}" onclick="selectDelivery(${option.id})">
            <input type="radio" name="delivery" value="${option.id}" ${savedOption == option.id ? 'checked' : ''}>
            <div class="delivery-info">
                <h4>${option.name}</h4>
                <p>${option.id === 0 ? 'استلام شخصي من المحل' : 'التوصيل لموقع المناسبة'}</p>
            </div>
            <span class="delivery-price">${formatPrice(option.price)}</span>
        </label>
    `).join('');
}

// Select delivery option
function selectDelivery(optionId) {
    localStorage.setItem('selectedDelivery', optionId);
    loadDeliveryOptions();
    calculateTotals();
}

// Calculate totals
function calculateTotals() {
    const cart = getCart();
    const settings = getDeliverySettings();
    const selectedDelivery = parseInt(localStorage.getItem('selectedDelivery') || '0');
    
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const deliveryOption = settings.options.find(o => o.id === selectedDelivery);
    const deliveryCost = deliveryOption ? deliveryOption.price : 0;
    const total = subtotal + deliveryCost;

    const subtotalEl = document.getElementById('subtotal');
    const deliveryCostEl = document.getElementById('delivery-cost');
    const totalEl = document.getElementById('total-price');

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (deliveryCostEl) deliveryCostEl.textContent = formatPrice(deliveryCost);
    if (totalEl) totalEl.textContent = formatPrice(total);

    return { subtotal, deliveryCost, total };
}

// Setup checkout form
function setupCheckoutForm() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', handleCheckout);
}

// Handle checkout
function handleCheckout(e) {
    e.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
        showToast('السلة فارغة', 'error');
        return;
    }

    const formData = new FormData(e.target);
    const customerData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        location: formData.get('location'),
        eventDate: formData.get('eventDate'),
        notes: formData.get('notes') || 'لا توجد ملاحظات'
    };

    const { subtotal, deliveryCost, total } = calculateTotals();
    const settings = getDeliverySettings();
    const selectedDelivery = parseInt(localStorage.getItem('selectedDelivery') || '0');
    const deliveryOption = settings.options.find(o => o.id === selectedDelivery);

    // Save order to admin
    saveOrder({
        customer: customerData,
        products: cart,
        delivery: deliveryOption,
        subtotal,
        deliveryCost,
        total,
        date: new Date().toISOString()
    });

    // Generate WhatsApp message
    const message = generateOrderMessage(customerData, cart, deliveryOption, total);
    const whatsappUrl = generateWhatsAppUrl(settings.whatsappNumber, message);

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    // Show success modal
    showSuccessModal();

    // Clear cart
    localStorage.removeItem('cart');
    updateCartCount();
}

// Generate formatted WhatsApp message
function generateOrderMessage(customer, products, delivery, total) {
    const settings = getDeliverySettings();
    
    let message = `👑 *طلب كراء جديد – الحطة الملكية*\n\n`;
    
    message += `📦 *المنتجات المطلوبة:*\n`;
    products.forEach((product, index) => {
        message += `${index + 1}. ${product.name} | ${getCategoryName(product.category)}\n`;
        message += `   السعر: ${formatPrice(product.price)}\n`;
    });
    
    message += `\n🚚 *طريقة الاستلام:*\n`;
    message += `${delivery.name}\n`;
    message += `التكلفة: ${formatPrice(delivery.price)}\n`;
    
    message += `\n📍 *مكان الإقامة:*\n`;
    message += `${customer.location}\n`;
    
    if (customer.eventDate) {
        message += `\n📅 *تاريخ المناسبة:*\n`;
        message += `${customer.eventDate}\n`;
    }
    
    message += `\n📝 *ملاحظات الزبون:*\n`;
    message += `${customer.notes}\n`;
    
    message += `\n💰 *المجموع الكلي:*\n`;
    message += `${formatPrice(total)}\n`;
    
    message += `\n👤 *معلومات الزبون:*\n`;
    message += `الاسم: ${customer.name}\n`;
    message += `الهاتف: ${customer.phone}\n`;
    
    message += `\n--------------------------------\n`;
    message += `✨ سنقوم بالتواصل معكم في أقرب وقت ✨\n`;
    message += `--------------------------------`;

    return message;
}

// Save order for admin
function saveOrder(orderData) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orderData.id = Date.now();
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Show success modal
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initDeliverySettings();
});

// Export functions
window.getCart = getCart;
window.saveCart = saveCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.loadCart = loadCart;
window.selectDelivery = selectDelivery;
window.setupCheckoutForm = setupCheckoutForm;
window.getDeliverySettings = getDeliverySettings;
window.saveOrder = saveOrder;
'''

with open('/mnt/kimi/output/js/cart.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("✅ js/cart.js created successfully")
