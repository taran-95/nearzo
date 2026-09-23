const API_BASE = 'http://localhost:3000';

// Global catalog combining dummy master products and user-uploaded products
let allProductsCatalog = [];
let currentFilteredProducts = [];

// Drawer state
let activeProduct = null;

// Built-in Dummy Master Products with exactly 2 nearby stores each
const DUMMY_PRODUCTS = [
    {
        id: 'master-iphone-16',
        name: 'Apple iPhone 16 (128 GB, Purple)',
        category: 'Smartphones & Tech',
        description: 'Features Camera Control, 48MP Fusion camera with 2x optical Telephoto, next-generation photographic styles, and the ultra-efficient A18 chip designed for Apple Intelligence.',
        price: 79900,
        imageUrl: '/assets/products/iphone-16-purple.webp',
        store_name: 'iPlanet Apple Reseller',
        store_location: 'Phoenix Marketcity, Ground Floor',
        stores: [
            {
                name: 'iPlanet Apple Premium Reseller',
                location: 'Phoenix Marketcity, G-04',
                distanceMeters: 280,
                distanceText: '280m away',
                rating: 4.9,
                reviewsCount: 512,
                stock: 'In Stock',
                stockStatus: 'in',
                price: 79900,
                lastUpdated: 'Updated 10 mins ago'
            },
            {
                name: 'Croma Electronics Hub',
                location: '100ft Road, Indiranagar',
                distanceMeters: 450,
                distanceText: '450m away',
                rating: 4.7,
                reviewsCount: 890,
                stock: 'Low Stock',
                stockStatus: 'low',
                price: 78499,
                lastUpdated: 'Updated 1 hour ago'
            }
        ]
    },
    {
        id: 'master-rtx-4090',
        name: 'NVIDIA GeForce RTX 4090 24GB GDDR6X',
        category: 'Computers & Graphics',
        description: 'The ultimate GeForce GPU delivering an enormous leap in raw performance, efficiency, and DLSS 3 AI-powered graphics. Experience ultra-high performance gaming and incredible creative power.',
        price: 174999,
        imageUrl: '/assets/products/rtx-4090.webp',
        store_name: 'Ankit Infotech PCStudio',
        store_location: 'SP Road Electronics Market',
        stores: [
            {
                name: 'Ankit Infotech (PCStudio)',
                location: 'SP Road Main Electronic Lane',
                distanceMeters: 380,
                distanceText: '380m away',
                rating: 4.9,
                reviewsCount: 740,
                stock: 'In Stock',
                stockStatus: 'in',
                price: 174999,
                lastUpdated: 'Updated 20 mins ago'
            },
            {
                name: 'Golchha Computer Systems',
                location: 'SP Road Commercial Complex',
                distanceMeters: 620,
                distanceText: '620m away',
                rating: 4.6,
                reviewsCount: 290,
                stock: 'Low Stock',
                stockStatus: 'low',
                price: 172900,
                lastUpdated: 'Updated 4 hours ago'
            }
        ]
    },
    {
        id: 'master-dolo-650',
        name: 'Dolo 650 Paracetamol (15 Tablets Strip)',
        category: 'Healthcare & Medicine',
        description: 'Fast-acting fever and mild-to-moderate pain relief formulation. Trusted fever reducer and painkiller containing 650mg Paracetamol for fast symptomatic recovery.',
        price: 34,
        imageUrl: '/assets/products/dolo-650.webp',
        store_name: 'Apollo Pharmacy 24/7',
        store_location: 'Corner Main Road, Near Metro',
        stores: [
            {
                name: 'Apollo Pharmacy 24/7',
                location: 'Corner 12th Cross, Near Metro Gate 2',
                distanceMeters: 95,
                distanceText: '95m away',
                rating: 4.9,
                reviewsCount: 620,
                stock: 'In Stock',
                stockStatus: 'in',
                price: 34,
                lastUpdated: 'Updated 5 mins ago'
            },
            {
                name: 'MedPlus Chemist & Druggist',
                location: 'Cross Street 4th Block Market',
                distanceMeters: 420,
                distanceText: '420m away',
                rating: 4.7,
                reviewsCount: 380,
                stock: 'In Stock',
                stockStatus: 'in',
                price: 32,
                lastUpdated: 'Updated 40 mins ago'
            }
        ]
    }
];

function getProductImageUrl(product) {
    if (product.imageUrl) {
        return product.imageUrl;
    }
    if (!product.images || product.images.length === 0 || !product.images[0] || !product.images[0].path) {
        return '';
    }
    const cleanPath = product.images[0].path.replace(/\\/g, '/');
    const pathWithSlash = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
    return API_BASE + pathWithSlash;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Convert uploaded backend products to unified catalog items with exactly 2 nearby stores
function adaptBackendProduct(bp) {
    const rawPrice = Number(bp.price) || 0;
    const storeName = bp.store_name || 'Verified Local Partner';
    const storeLocation = bp.store_location || 'Neighborhood Market';
    const imgUrl = getProductImageUrl(bp);

    return {
        id: String(bp.id),
        name: bp.name,
        category: bp.category || 'General Store',
        description: bp.description || 'Verified product listing offered by local retail stores.',
        price: rawPrice,
        imageUrl: imgUrl,
        store_name: storeName,
        store_location: storeLocation,
        stores: [
            {
                name: storeName,
                location: storeLocation,
                distanceMeters: 250,
                distanceText: '250m away',
                rating: 4.8,
                reviewsCount: 84,
                stock: 'In Stock',
                stockStatus: 'in',
                price: rawPrice,
                lastUpdated: 'Updated today'
            },
            {
                name: 'Neighborhood Express Mart',
                location: 'Main Commercial Avenue',
                distanceMeters: 800,
                distanceText: '800m away',
                rating: 4.6,
                reviewsCount: 42,
                stock: 'Low Stock',
                stockStatus: 'low',
                price: rawPrice + 20,
                lastUpdated: 'Updated 2 hrs ago'
            }
        ]
    };
}

// Render product cards on the products page
function renderProducts(products) {
    const gridContainer = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');

    if (!gridContainer) return;

    if (!products || products.length === 0) {
        gridContainer.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    gridContainer.innerHTML = products.map(product => {
        const imageUrl = product.imageUrl || getProductImageUrl(product);
        const formattedPrice = Number(product.price).toLocaleString('en-IN');
        const storeName = product.store_name || 'Local Store';
        const storeLocation = product.store_location || 'Nearby';

        const imageHtml = imageUrl
            ? `<img src="${imageUrl}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.style.display='none';" />`
            : '';

        return `
            <article class="product-card" onclick="openProductDrawer('${escapeHtml(String(product.id))}')" title="Click to view local stores and details">
                <div class="product-img-wrapper">
                    ${imageHtml}
                    <span class="stock-badge badge-in-stock">In Stock</span>
                </div>

                <div class="product-info">
                    <h3 class="product-title" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</h3>
                    <p class="product-desc" title="${escapeHtml(product.description || '')}">
                        ${escapeHtml(product.description || 'No description provided.')}
                    </p>

                    <div class="product-price-row">
                        <span class="product-currency">₹</span>
                        <span class="product-price">${formattedPrice}</span>
                    </div>

                    <hr class="card-divider" />

                    <div class="product-footer">
                        <div class="store-row" title="${escapeHtml(storeName)}">
                            <i class="fa-solid fa-store icon-store"></i>
                            <span class="store-name">${escapeHtml(storeName)}</span>
                        </div>
                        <div class="location-row" title="${escapeHtml(storeLocation)}">
                            <i class="fa-solid fa-location-dot icon-location"></i>
                            <span class="store-location">${escapeHtml(storeLocation)}</span>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

// Filter product cards based on search query
function filterProducts(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
        currentFilteredProducts = [...allProductsCatalog];
        renderProducts(currentFilteredProducts);
        return;
    }

    currentFilteredProducts = allProductsCatalog.filter(p => {
        const name = (p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const store = (p.store_name || '').toLowerCase();
        const loc = (p.store_location || '').toLowerCase();
        return name.includes(q) || desc.includes(q) || cat.includes(q) || store.includes(q) || loc.includes(q);
    });

    renderProducts(currentFilteredProducts);
}

// SLIDE-IN DRAWER LOGIC
function openProductDrawer(productId) {
    const product = allProductsCatalog.find(p => String(p.id) === String(productId));
    if (!product) return;

    activeProduct = product;

    // Populate Top Section (Expanded Details)
    const drawerProductImg = document.getElementById('drawerProductImg');
    const drawerProductCategory = document.getElementById('drawerProductCategory');
    const drawerProductTitle = document.getElementById('drawerProductTitle');
    const drawerProductDesc = document.getElementById('drawerProductDesc');
    const drawerProductPrice = document.getElementById('drawerProductPrice');
    const drawerStoresCountBadge = document.getElementById('drawerStoresCountBadge');

    const imageUrl = product.imageUrl || getProductImageUrl(product);
    if (drawerProductImg) {
        if (imageUrl) {
            drawerProductImg.src = imageUrl;
            drawerProductImg.alt = product.name;
            drawerProductImg.style.display = 'block';
        } else {
            drawerProductImg.style.display = 'none';
        }
    }

    if (drawerProductCategory) {
        drawerProductCategory.textContent = product.category || 'General';
    }

    if (drawerProductTitle) {
        drawerProductTitle.textContent = product.name;
    }

    if (drawerProductDesc) {
        drawerProductDesc.textContent = product.description || 'Full product description provided by authorized local vendors.';
    }

    // Determine best local price among stores
    const stores = product.stores || [];
    let minPrice = product.price;
    if (stores.length > 0) {
        minPrice = Math.min(...stores.map(s => s.price));
    }

    if (drawerProductPrice) {
        drawerProductPrice.textContent = `₹${Number(minPrice).toLocaleString('en-IN')}`;
    }

    if (drawerStoresCountBadge) {
        drawerStoresCountBadge.textContent = `${stores.length} Stores Available`;
    }

    // Render the 2 available stores directly
    renderDrawerStores();

    // Trigger smooth 40% slide animation and adjust products page layout to 60%
    const productsPage = document.getElementById('productsPageContainer');
    const productDrawer = document.getElementById('productDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');

    if (productsPage) productsPage.classList.add('drawer-open');
    if (productDrawer) productDrawer.classList.add('active');
    if (drawerBackdrop) drawerBackdrop.classList.add('active');
}

function closeProductDrawer() {
    const productsPage = document.getElementById('productsPageContainer');
    const productDrawer = document.getElementById('productDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');

    if (productsPage) productsPage.classList.remove('drawer-open');
    if (productDrawer) productDrawer.classList.remove('active');
    if (drawerBackdrop) drawerBackdrop.classList.remove('active');

    activeProduct = null;
}

// Render Available Stores inside the Bottom Section of the Drawer (2 stores shown directly)
function renderDrawerStores() {
    if (!activeProduct || !activeProduct.stores) return;

    const listContainer = document.getElementById('drawerStoresList');
    const summaryElem = document.getElementById('drawerOffersSummary');
    if (!listContainer) return;

    const stores = activeProduct.stores.slice(0, 2);

    if (summaryElem) {
        summaryElem.textContent = `Showing ${stores.length} nearby store${stores.length === 1 ? '' : 's'}`;
    }

    if (stores.length === 0) {
        listContainer.innerHTML = `
            <div class="stores-empty-filter">
                <i class="fa-solid fa-store-slash"></i>
                <p><strong>No stores found for this product.</strong></p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = stores.map(store => {
        const stockTagClass = store.stockStatus || (store.stock === 'In Stock' ? 'in' : (store.stock === 'Low Stock' ? 'low' : 'out'));
        const formattedStorePrice = Number(store.price).toLocaleString('en-IN');

        return `
            <article class="store-card">
                <div class="store-card-header">
                    <div class="store-card-title-group">
                        <div class="store-card-name">
                            <i class="fa-solid fa-store" style="color: #2563eb;"></i>
                            <span>${escapeHtml(store.name)}</span>
                        </div>
                        <div class="store-card-location">
                            <i class="fa-solid fa-location-dot" style="color: #ef4444;"></i>
                            <span>${escapeHtml(store.location)}</span>
                        </div>
                    </div>

                    <div class="store-card-badges">
                        <span class="store-rating-badge">
                            <i class="fa-solid fa-star"></i> ${store.rating} (${store.reviewsCount})
                        </span>
                        <span class="store-stock-tag ${stockTagClass}">
                            ${escapeHtml(store.stock)}
                        </span>
                    </div>
                </div>

                <div class="store-card-info-row">
                    <div class="store-distance-info">
                        <i class="fa-solid fa-person-walking"></i>
                        <span>${escapeHtml(store.distanceText || (store.distanceMeters + 'm away'))}</span>
                    </div>
                    <div class="store-price-info">
                        <span class="store-price-currency">₹</span>
                        <span class="store-price-amount">${formattedStorePrice}</span>
                    </div>
                    <div class="store-updated-info">
                        <i class="fa-regular fa-clock"></i>
                        <span>${escapeHtml(store.lastUpdated || 'Recently updated')}</span>
                    </div>
                </div>

                <div class="store-card-actions">
                    <button type="button" class="btn-reserve" onclick="handleReserveClick(event)">
                        <i class="fa-solid fa-bookmark"></i> Reserve Here
                    </button>
                    <button type="button" class="btn-direction" onclick="handleDirectionClick(event)">
                        <i class="fa-solid fa-diamond-turn-right"></i> Directions
                    </button>
                </div>
            </article>
        `;
    }).join('');
}

// Action button handlers: clickable buttons with NO popup message
function handleReserveClick(event) {
    if (event) event.stopPropagation();
    // Clickable button with no popup message
}

function handleDirectionClick(event) {
    if (event) event.stopPropagation();
    // Clickable button with no popup message
}

// Set up UI Event Listeners
function setupDrawerControls() {
    const closeDrawerBtn = document.getElementById('closeDrawerBtn');
    const viewFullProductBtn = document.getElementById('viewFullProductBtn');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const radiusPillsRow = document.getElementById('radiusPillsRow');

    if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener('click', closeProductDrawer);
    }

    if (viewFullProductBtn) {
        viewFullProductBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = (activeProduct && activeProduct.id) ? activeProduct.id : 'master-iphone-16';
            window.location.href = `/products/productView?id=${encodeURIComponent(targetId)}`;
        });
    }

    if (drawerBackdrop) {
        drawerBackdrop.addEventListener('click', closeProductDrawer);
    }

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeProduct) {
            closeProductDrawer();
        }
    });

    // Visual selection for radius pills without filtering (per requirement)
    if (radiusPillsRow) {
        radiusPillsRow.addEventListener('click', (e) => {
            const pill = e.target.closest('.radius-pill');
            if (!pill) return;
            radiusPillsRow.querySelectorAll('.radius-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    }
}

// Initialize Catalog & Fetch Backend Data
async function initProducts() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');

    // Read URL query parameter "?search=..." if navigated from hero search
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('search') || '';
    if (searchInput && initialQuery) {
        searchInput.value = initialQuery;
    }

    setupDrawerControls();

    // Start with default dummy products
    allProductsCatalog = [...DUMMY_PRODUCTS];

    try {
        const response = await fetch(`${API_BASE}/products`, { method: 'GET' });

        if (response.ok) {
            const backendProducts = await response.json();
            if (Array.isArray(backendProducts) && backendProducts.length > 0) {
                const adapted = backendProducts.map(adaptBackendProduct);
                // Prepend uploaded backend products before dummy products
                allProductsCatalog = [...adapted, ...DUMMY_PRODUCTS];
            }
        } else {
            console.warn('Backend products endpoint responded with error, displaying standard catalog.');
        }
    } catch (error) {
        console.warn('Backend server currently unavailable, displaying standard catalog with dummy products.', error);
    }

    // Initial render
    if (initialQuery) {
        filterProducts(initialQuery);
    } else {
        currentFilteredProducts = [...allProductsCatalog];
        renderProducts(currentFilteredProducts);
    }

    // Search bar listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterProducts(e.target.value);
        });
    }

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (searchInput) {
                filterProducts(searchInput.value);
            }
        });
    }
}

// Make functions globally available for inline onclick handlers
window.openProductDrawer = openProductDrawer;
window.closeProductDrawer = closeProductDrawer;
window.handleReserveClick = handleReserveClick;
window.handleDirectionClick = handleDirectionClick;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProducts);
} else {
    initProducts();
}
