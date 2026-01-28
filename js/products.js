
js_content = '''// ============================================
// الحطة الملكية - Products Management
// ============================================

// Initial sample data
const initialProducts = [
    {
        id: 1,
        name: 'طقم ديكور ذهبي فاخر',
        category: 'decorations',
        price: 5000,
        images: ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80'],
        note: 'متوفر بألوان متعددة',
        isFeatured: true,
        isHot: true,
        isDiscount: false,
        isHidden: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        name: 'كوشة عرس ملكية',
        category: 'furniture',
        price: 15000,
        images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80'],
        note: 'تتسع لـ 6 أشخاص',
        isFeatured: true,
        isHot: false,
        isDiscount: false,
        isHidden: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        name: 'إضاءة ليد ساحرة',
        category: 'lighting',
        price: 3000,
        images: ['https://images.unsplash.com/photo-1513506003013-d531632103c7?w=800&q=80'],
        note: 'ألوان متغيرة مع ريموت',
        isFeatured: false,
        isHot: true,
        isDiscount: true,
        isHidden: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 4,
        name: 'صندوق هدايا أنيق',
        category: 'gifts',
        price: 2500,
        images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80'],
        note: 'قابل للتخصيص',
        isFeatured: false,
        isHot: false,
        isDiscount: false,
        isHidden: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 5,
        name: 'مرايا قديمة الطراز',
        category: 'decorations',
        price: 4000,
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'],
        note: 'إطار ذهبي فاخر',
        isFeatured: true,
        isHot: false,
        isDiscount: false,
        isHidden: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 6,
        name: 'طاولات خشبية فاخرة',
        category: 'furniture',
        price: 8000,
        images: ['https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80'],
        note: 'طقم 4 طاولات',
        isFeatured: false,
        isHot: true,
        isDiscount: true,
        isHidden: false,
        createdAt: new Date().toISOString()
    }
];

// Initialize products in localStorage
function initProducts() {
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(initialProducts));
    }
}

// Get all products
function getProducts() {
    return JSON.parse(localStorage.getItem('products')) || [];
}

// Get featured products
function getFeaturedProducts() {
    const products = getProducts();
    return products.filter(p => p.isFeatured && !p.isHidden).slice(0, 6);
}

// Get categories
function getCategories() {
    return [
        { id: 'decorations', name: 'ديكورات', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80', count: 0 },
        { id: 'furniture', name: 'أثاث', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80', count: 0 },
        { id: 'accessories', name: 'اكسسوارات', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80', count: 0 },
        { id: 'gifts', name: 'صناديق هدايا', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80', count: 0 },
        { id: 'lighting', name: 'إضاءة', image: 'https://images.unsplash.com/photo-1513506003013-d531632103c7?w=600&q=80', count: 0 }
    ];
}

// Load categories on homepage
function loadCategories() {
    const container = document.getElementById('categories-grid');
    if (!container) return;

    const categories = getCategories();
    const products = getProducts();
    
    // Update counts
    categories.forEach(cat => {
        cat.count = products.filter(p => p.category === cat.id && !p.isHidden).length;
    });

    container.innerHTML = categories.map(cat => `
        <div class="category-card" onclick="window.location.href='products.html?category=${cat.id}'">
            <img src="${cat.image}" alt="${cat.name}" loading="lazy">
            <div class="category-overlay">
                <h3>${cat.name}</h3>
                <span>${cat.count} منتج</span>
            </div>
        </div>
    `).join('');
}

// Load featured products on homepage
function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    const products = getFeaturedProducts();
    
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-gray);">لا توجد منتجات مميزة</p>';
        return;
    }

    container.innerHTML = products.map(product => createProductCard(product)).join('');
}

// Load all products with filters
function loadAllProducts() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    const products = getProducts().filter(p => !p.isHidden);
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFilter = urlParams.get('category');

    if (categoryFilter) {
        document.getElementById('category-filter').value = categoryFilter;
    }

    displayProducts(products);
}

// Display products
function displayProducts(products) {
    const container = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (products.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    container.innerHTML = products.map(product => createProductCard(product)).join('');
}

// Create product card HTML
function createProductCard(product) {
    const badges = [];
    if (product.isFeatured) badges.push('<span class="badge badge-featured">مميز</span>');
    if (product.isHot) badges.push('<span class="badge badge-hot">الأكثر طلباً</span>');
    if (product.isDiscount) badges.push('<span class="badge badge-discount">خصم</span>');

    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                <div class="product-badges">
                    ${badges.join('')}
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="addToCart(${product.id})" title="أضف للسلة">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                    </button>
                    <button class="btn-quick-view" onclick="quickView(${product.id})" title="عرض سريع">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="4"></circle>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-name">${product.name}</h3>
                ${product.note ? `<p class="product-note">${product.note}</p>` : ''}
                <div class="product-footer">
                    <span class="product-price">${formatPrice(product.price)}</span>
                </div>
            </div>
        </div>
    `;
}

// Setup filters
function setupFilters() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterProducts, 300));
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', filterProducts);
    }
}

// Filter products
function filterProducts() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const category = document.getElementById('category-filter')?.value || 'all';
    const sort = document.getElementById('sort-filter')?.value || 'newest';

    let products = getProducts().filter(p => !p.isHidden);

    // Search filter
    if (searchTerm) {
        products = products.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            getCategoryName(p.category).toLowerCase().includes(searchTerm)
        );
    }

    // Category filter
    if (category !== 'all') {
        products = products.filter(p => p.category === category);
    }

    // Sort
    switch (sort) {
        case 'price-low':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            products.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
            products.sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0));
            break;
        default:
            products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    displayProducts(products);
    updateActiveFilters(searchTerm, category);
}

// Update active filters display
function updateActiveFilters(searchTerm, category) {
    const container = document.getElementById('active-filters');
    if (!container) return;

    const filters = [];
    
    if (searchTerm) {
        filters.push(`
            <span class="filter-tag">
                البحث: ${searchTerm}
                <button onclick="clearSearch()">×</button>
            </span>
        `);
    }

    if (category !== 'all') {
        filters.push(`
            <span class="filter-tag">
                ${getCategoryName(category)}
                <button onclick="clearCategory()">×</button>
            </span>
        `);
    }

    container.innerHTML = filters.join('');
}

// Clear search
function clearSearch() {
    document.getElementById('search-input').value = '';
    filterProducts();
}

// Clear category
function clearCategory() {
    document.getElementById('category-filter').value = 'all';
    filterProducts();
}

// Quick view modal
function quickView(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div>
                <img src="${product.images[0]}" alt="${product.name}" style="width: 100%; border-radius: 10px;">
            </div>
            <div>
                <span style="color: var(--color-gold); font-weight: 600;">${getCategoryName(product.category)}</span>
                <h2 style="margin: 1rem 0; color: var(--color-dark);">${product.name}</h2>
                <p style="font-size: 2rem; color: var(--color-dark); font-weight: 800; margin-bottom: 1rem;">
                    ${formatPrice(product.price)}
                </p>
                ${product.note ? `<p style="color: var(--color-gray); margin-bottom: 1.5rem;">${product.note}</p>` : ''}
                <button class="btn btn-primary btn-full" onclick="addToCart(${product.id}); closeModal();" style="margin-top: 1rem;">
                    أضف للسلة
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize products on load
initProducts();

// Export functions
window.loadCategories = loadCategories;
window.loadFeaturedProducts = loadFeaturedProducts;
window.loadAllProducts = loadAllProducts;
window.setupFilters = setupFilters;
window.filterProducts = filterProducts;
window.quickView = quickView;
window.closeModal = closeModal;
window.getProducts = getProducts;
window.getFeaturedProducts = getFeaturedProducts;
window.initProducts = initProducts;
'''

with open('/mnt/kimi/output/js/products.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("✅ js/products.js created successfully")
