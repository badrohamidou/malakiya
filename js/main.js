
import os
os.makedirs('/mnt/kimi/output/js', exist_ok=True)

js_content = '''// ============================================
// الحطة الملكية - Main JavaScript
// ============================================

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const header = document.getElementById('header');
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 1500);

    // Update cart count
    updateCartCount();

    // Header scroll effect
    window.addEventListener('scroll', handleScroll);

    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Initialize date display
    updateDateDisplay();
});

// Handle scroll
function handleScroll() {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElements = document.querySelectorAll('.cart-count');
    
    cartCountElements.forEach(el => {
        el.textContent = cart.length;
        if (cart.length > 0) {
            el.style.display = 'flex';
        } else {
            el.style.display = 'none';
        }
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const icon = type === 'success' ? '✓' : '!';
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;

    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Update date display in admin
function updateDateDisplay() {
    const dateEl = document.getElementById('admin-date');
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('ar-DZ', options);
    }
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('ar-DZ').format(price) + ' دج';
}

// Get category name in Arabic
function getCategoryName(category) {
    const categories = {
        'decorations': 'ديكورات',
        'furniture': 'أثاث',
        'accessories': 'اكسسوارات',
        'gifts': 'صناديق هدايا',
        'lighting': 'إضاءة',
        'other': 'أخرى'
    };
    return categories[category] || category;
}

// Generate WhatsApp message URL
function generateWhatsAppUrl(phone, message) {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
}

// Image optimization helper
function optimizeImage(url, width = 800) {
    // If using Unsplash or similar, add resize parameters
    if (url.includes('unsplash.com')) {
        return url.replace('w=', `w=${width}&`);
    }
    return url;
}

// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Export functions for use in other scripts
window.showToast = showToast;
window.updateCartCount = updateCartCount;
window.formatPrice = formatPrice;
window.getCategoryName = getCategoryName;
window.generateWhatsAppUrl = generateWhatsAppUrl;
window.optimizeImage = optimizeImage;
'''

with open('/mnt/kimi/output/js/main.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("✅ js/main.js created successfully")
