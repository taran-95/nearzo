async function loadHeader() {
    try {
        const header = document.getElementById('header');
        if (!header) return;

        const currentPath = window.location.pathname;
        const isHome = currentPath === '/' || currentPath.endsWith('index.html');
        const isProducts = currentPath.includes('product');
        const isAbout = window.location.hash === '#about';

        let user = null;
        let isShop = false;

        try {
            const response = await fetch('http://localhost:3000/auth/me', {
                method: "GET",
                credentials: "include"
            });
            if (response.ok) {
                const data = await response.json();
                user = data.user || data;
                isShop = data.userType === 'shop' || user.store_name !== undefined;
            }
        } catch (_) {
            // Server offline or not authenticated
        }

        const navLinksHtml = `
            <div class="nav-links">
                <a href="/" class="nav-link ${isHome && !isAbout ? 'active' : ''}">Home</a>
                <a href="/products/products" class="nav-link ${isProducts ? 'active' : ''}">Products</a>
                <a href="/#about" class="nav-link ${isAbout ? 'active' : ''}">About</a>
            </div>
        `;

        let navActionsHtml = '';

        if (!user) {
            navActionsHtml = `
                <div class="nav-actions">
                    <!-- LOGIN DROPDOWN -->
                    <div class="nav-dropdown">
                        <a href="/auth/userLogin" class="nav-pill-btn">
                            <i class="fa-solid fa-arrow-right-to-bracket"></i> Login
                        </a>
                        <div class="dropdown-menu">
                            <a href="/auth/userLogin"><i class="fa-solid fa-user"></i> Login as Customer</a>
                            <a href="/auth/buisnessLogin"><i class="fa-solid fa-store"></i> Login as Business</a>
                        </div>
                    </div>

                    <!-- REGISTER DROPDOWN -->
                    <div class="nav-dropdown">
                        <a href="/auth/userRegister" class="nav-pill-btn">
                            <i class="fa-solid fa-user-plus"></i> Register
                        </a>
                        <div class="dropdown-menu">
                            <a href="/auth/userRegister"><i class="fa-solid fa-user"></i> Register as Customer</a>
                            <a href="/auth/buisnessRegister"><i class="fa-solid fa-store"></i> Register as Business</a>
                        </div>
                    </div>

                    <!-- CART BUTTON -->
                    <a href="/products/products" class="nav-pill-btn nav-pill-cart" title="View In-Stock Products">
                        <i class="fa-solid fa-cart-shopping"></i> Cart (0)
                    </a>
                </div>
            `;
        } else if (isShop) {
            navActionsHtml = `
                <div class="nav-actions">
                    <a href="/products/uploadProduct" class="nav-pill-btn nav-pill-primary">
                        <i class="fa-solid fa-barcode"></i> Add Product
                    </a>
                    <a href="/auth/profile" class="nav-pill-btn">
                        <i class="fa-solid fa-store"></i> Store Profile
                    </a>
                    <button type="button" class="nav-pill-btn nav-pill-logout" id="navLogoutBtn">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
                    </button>
                </div>
            `;
        } else {
            navActionsHtml = `
                <div class="nav-actions">
                    <a href="/auth/profile" class="nav-pill-btn">
                        <i class="fa-solid fa-user"></i> My Profile
                    </a>
                    <button type="button" class="nav-pill-btn nav-pill-logout" id="navLogoutBtn">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
                    </button>
                    <a href="/products/products" class="nav-pill-btn nav-pill-cart" title="View In-Stock Products">
                        <i class="fa-solid fa-cart-shopping"></i> Cart (0)
                    </a>
                </div>
            `;
        }

        header.innerHTML = `
            <div class="navbar-container">
                <a href="/" class="nav-brand" title="NearZo - Find Local Products Instantly">
                    <span class="brand-text">Near<span class="brand-accent">Zo</span></span>
                </a>
                ${navLinksHtml}
                ${navActionsHtml}
            </div>
        `;

        // Handle Logout Click
        const logoutBtn = document.getElementById('navLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await fetch('http://localhost:3000/auth/logout', {
                        method: 'POST',
                        credentials: 'include'
                    });
                } catch (_) {}
                window.location.href = '/';
            });
        }

    } catch (error) {
        console.warn('Navbar load error:', error.message);
    }
}

// Auto-run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
} else {
    loadHeader();
}
