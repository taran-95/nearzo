const API_BASE = 'http://localhost:3000';

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





// Action button handlers: clickable buttons with NO popup message
function handleReserveClick(event) {
    if (event) event.stopPropagation();
    // Clickable button with no popup message
}

function handleDirectionClick(event) {
    if (event) event.stopPropagation();
    // Clickable button with no popup message
}


window.handleReserveClick = handleReserveClick;
window.handleDirectionClick = handleDirectionClick;

