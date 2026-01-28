
js_content = '''// ============================================
// الحطة الملكية - Admin Dashboard
// ============================================

const ADMIN_PASSWORD = 'pipopi31';

// DOM Elements
const loginScreen = document.getElementById('admin-login');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');

// Initialize admin
document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showAdminPanel();
    }

    // Login form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Tab navigation
    setupTabs();

    // Product form
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }

    // Settings forms
    const deliveryForm = document.getElementById('delivery-settings-form');
    if (deliveryForm) {
        deliveryForm.addEventListener('submit', handleDeliverySettings);
    }

    const storeForm = document.getElementById('store-settings-form');
    if (storeForm) {
        storeForm.addEventListener('submit', handleStoreSettings);
    }

    // Load initial data
    loadDashboardStats();
    loadProductsTable();
    loadOrdersTable();
    loadSettings();
});

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;

    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        showToast('تم تسجيل الدخول بنجاح');
        showAdminPanel();
    } else {
        showToast('كلمة المرور غير صحيحة', 'error');
    }
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('adminLoggedIn');
    showToast('تم تسجيل الخروج');
    location.reload();
}

// Show admin panel
function showAdminPanel() {
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'block';
}

// Setup tabs
function setupTabs() {
    const tabLinks = document.querySelectorAll('.admin-nav a[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');

            // Update active states
            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId + '-tab') {
                    content.classList.add('active');
                }
            });

            // Update page title
            const titles = {
                'dashboard': 'لوحة التحكم',
                'products': 'إدارة المنتجات',
                'orders': 'الطلبات',
                'settings': 'الإعدادات'
            };
            document.getElementById('page-title').textContent = titles[tabId];
        });
    });
}

// Load dashboard stats
function loadDashboardStats() {
    const products = getProducts();
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    document.getElementById('total-products').textContent = products.length;
    document.getElementById('featured-products').textContent = products.filter(p => p.isFeatured).length;
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('hot-products').textContent = products.filter(p => p.isHot).length;

    // Load recent orders
    const recentOrdersBody = document.getElementById('recent-orders-body');
    if (recentOrdersBody && orders.length > 0) {
        const recentOrders = orders.slice(-5).reverse();
        recentOrdersBody.innerHTML = recentOrders.map(order => `
            <tr>
                <td>${new Date(order.date).toLocaleDateString('ar-DZ')}</td>
                <td>${order.customer.name}</td>
                <td>${order.products.length} منتج</td>
                <td>${formatPrice(order.total)}</td>
                <td><span class="badge badge-featured">جديد</span></td>
            </tr>
        `).join('');
    }
}

// Load products table
function loadProductsTable() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    const products = getProducts();
    
    tbody.innerHTML = products.map(product => {
        const badges = [];
        if (product.isFeatured) badges.push('<span class="badge badge-featured">مميز</span>');
        if (product.isHot) badges.push('<span class="badge badge-hot">طلب عالي</span>');
        if (product.isDiscount) badges.push('<span class="badge badge-discount">خصم</span>');
        if (product.isHidden) badges.push('<span class="badge badge-hidden">مخفي</span>');

        return `
            <tr>
                <td><img src="${product.images[0]}" alt="" class="product-thumb"></td>
                <td>${product.name}</td>
                <td>${getCategoryName(product.category)}</td>
                <td>${formatPrice(product.price)}</td>
                <td>${badges.join(' ')}</td>
                <td>
                    <button class="btn btn-icon" onclick="editProduct(${product.id})" title="تعديل">✏️</button>
                    <button class="btn btn-icon" onclick="deleteProduct(${product.id})" title="حذف">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Load orders table
function loadOrdersTable() {
    const tbody = document.getElementById('all-orders-body');
    if (!tbody) return;

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">لا توجد طلبات</td></tr>';
        return;
    }

    tbody.innerHTML = orders.slice().reverse().map(order => `
        <tr>
            <td>${new Date(order.date).toLocaleDateString('ar-DZ')}</td>
            <td>${order.customer.name}</td>
            <td>${order.customer.phone}</td>
            <td>${order.products.map(p => p.name).join('، ')}</td>
            <td>${order.delivery.name}</td>
            <td>${formatPrice(order.total)}</td>
            <td>
                <button class="btn btn-sm" onclick="viewOrderDetails(${order.id})">عرض</button>
            </td>
        </tr>
    `).join('');
}

// Open product modal
function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('product-form');

    // Reset form
    form.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('image-preview-grid').innerHTML = '';
    document.getElementById('product-image-urls').value = '';

    if (productId) {
        const products = getProducts();
        const product = products.find(p => p.id === productId);
        if (product) {
            modalTitle.textContent = 'تعديل منتج';
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-note').value = product.note || '';
            document.getElementById('is-featured').checked = product.isFeatured;
            document.getElementById('is-hot').checked = product.isHot;
            document.getElementById('is-discount').checked = product.isDiscount;
            document.getElementById('is-hidden').checked = product.isHidden;

            // Load images
            if (product.images && product.images.length > 0) {
                document.getElementById('product-image-urls').value = JSON.stringify(product.images);
                updateImagePreview(product.images);
            }
        }
    } else {
        modalTitle.textContent = 'إضافة منتج جديد';
    }

    modal.classList.add('active');
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('active');
}

// Handle image upload
function handleImageUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentUrls = document.getElementById('product-image-urls').value;
    let urls = currentUrls ? JSON.parse(currentUrls) : [];

    Array.from(files).forEach(file => {
        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file);
        urls.push(objectUrl);
    });

    document.getElementById('product-image-urls').value = JSON.stringify(urls);
    updateImagePreview(urls);
}

// Update image preview
function updateImagePreview(urls) {
    const grid = document.getElementById('image-preview-grid');
    grid.innerHTML = urls.map((url, index) => `
        <div class="image-preview-item">
            <img src="${url}" alt="">
            <button type="button" class="remove-image" onclick="removeImage(${index})">×</button>
        </div>
    `).join('');
}

// Remove image
function removeImage(index) {
    const urlsInput = document.getElementById('product-image-urls');
    let urls = JSON.parse(urlsInput.value || '[]');
    urls.splice(index, 1);
    urlsInput.value = JSON.stringify(urls);
    updateImagePreview(urls);
}

// Handle product submit
function handleProductSubmit(e) {
    e.preventDefault();

    const productId = document.getElementById('product-id').value;
    const images = JSON.parse(document.getElementById('product-image-urls').value || '[]');

    if (images.length === 0) {
        showToast('يرجى إضافة صورة واحدة على الأقل', 'error');
        return;
    }

    const productData = {
        id: productId ? parseInt(productId) : Date.now(),
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseInt(document.getElementById('product-price').value),
        images: images,
        note: document.getElementById('product-note').value,
        isFeatured: document.getElementById('is-featured').checked,
        isHot: document.getElementById('is-hot').checked,
        isDiscount: document.getElementById('is-discount').checked,
        isHidden: document.getElementById('is-hidden').checked,
        createdAt: new Date().toISOString()
    };

    let products = getProducts();

    if (productId) {
        // Update existing
        const index = products.findIndex(p => p.id === parseInt(productId));
        if (index !== -1) {
            productData.createdAt = products[index].createdAt;
            products[index] = productData;
        }
    } else {
        // Add new
        products.push(productData);
    }

    localStorage.setItem('products', JSON.stringify(products));
    showToast(productId ? 'تم تحديث المنتج' : 'تم إضافة المنتج');
    closeProductModal();
    loadProductsTable();
    loadDashboardStats();
}

// Edit product
function editProduct(id) {
    openProductModal(id);
}

// Delete product
function deleteProduct(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    let products = getProducts();
    products = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(products));

    showToast('تم حذف المنتج');
    loadProductsTable();
    loadDashboardStats();
}

// Load settings
function loadSettings() {
    const settings = getDeliverySettings();
    
    // Delivery prices
    document.getElementById('delivery-1').value = settings.options[1].price;
    document.getElementById('delivery-2').value = settings.options[2].price;

    // Store info
    document.getElementById('whatsapp-number').value = settings.whatsappNumber;
    document.getElementById('store-location').value = settings.storeLocation;
}

// Handle delivery settings
function handleDeliverySettings(e) {
    e.preventDefault();

    const settings = getDeliverySettings();
    settings.options[1].price = parseInt(document.getElementById('delivery-1').value);
    settings.options[2].price = parseInt(document.getElementById('delivery-2').value);

    localStorage.setItem('deliverySettings', JSON.stringify(settings));
    showToast('تم حفظ إعدادات التوصيل');
}

// Handle store settings
function handleStoreSettings(e) {
    e.preventDefault();

    const settings = getDeliverySettings();
    settings.whatsappNumber = document.getElementById('whatsapp-number').value;
    settings.storeLocation = document.getElementById('store-location').value;

    localStorage.setItem('deliverySettings', JSON.stringify(settings));
    showToast('تم حفظ إعدادات المتجر');
}

// Export data
function exportData() {
    const data = {
        products: getProducts(),
        orders: JSON.parse(localStorage.getItem('orders')) || [],
        settings: getDeliverySettings(),
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alhutah-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('تم تصدير البيانات');
}

// Import data
function importData(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.products) {
                localStorage.setItem('products', JSON.stringify(data.products));
            }
            if (data.orders) {
                localStorage.setItem('orders', JSON.stringify(data.orders));
            }
            if (data.settings) {
                localStorage.setItem('deliverySettings', JSON.stringify(data.settings));
            }

            showToast('تم استيراد البيانات بنجاح');
            location.reload();
        } catch (error) {
            showToast('خطأ في قراءة الملف', 'error');
        }
    };
    reader.readAsText(file);
}

// Clear all data
function clearAllData() {
    if (!confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء!')) return;
    if (!confirm('تأكيد نهائي: سيتم حذف جميع المنتجات والطلبات والإعدادات')) return;

    localStorage.removeItem('products');
    localStorage.removeItem('orders');
    localStorage.removeItem('deliverySettings');
    localStorage.removeItem('cart');

    showToast('تم مسح جميع البيانات');
    location.reload();
}

// View order details
function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    alert(`
طلب #${order.id}
العميل: ${order.customer.name}
الهاتف: ${order.customer.phone}
الموقع: ${order.customer.location}
المنتجات: ${order.products.map(p => p.name).join('، ')}
المجموع: ${formatPrice(order.total)}
التاريخ: ${new Date(order.date).toLocaleString('ar-DZ')}
    `);
}

// Make functions global
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.handleImageUpload = handleImageUpload;
window.removeImage = removeImage;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.exportData = exportData;
window.importData = importData;
window.clearAllData = clearAllData;
window.viewOrderDetails = viewOrderDetails;
'''

with open('/mnt/kimi/output/js/admin.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("✅ js/admin.js created successfully")
