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
            <nav class="nav-links" aria-label="Main Navigation">
                <a href="/" class="nav-link ${isHome && !isAbout ? 'active' : ''}">Home</a>
                <a href="/products/products" class="nav-link ${isProducts ? 'active' : ''}">Products</a>
                <a href="/#how-it-works" class="nav-link ${isAbout ? 'active' : ''}" id="navHowItWorks">How It Works</a>
            </nav>
        `;

        let navActionsHtml = '';

        if (!user) {
            navActionsHtml = `
                <div class="nav-actions">
                    <!-- LOGIN DROPDOWN -->
                    <div class="nav-dropdown">
                        <button type="button" class="nav-pill-btn nav-pill-ghost" id="navLoginBtn">
                            <span>Log in</span> <i class="fa-solid fa-chevron-down nav-dropdown-arrow"></i>
                        </button>
                        <div class="nav-dropdown-menu">
                            <a href="/auth/userLogin" class="nav-dropdown-item"><i class="fa-solid fa-user"></i> Customer Login</a>
                            <a href="/auth/buisnessLogin" class="nav-dropdown-item"><i class="fa-solid fa-store"></i> Merchant Login</a>
                        </div>
                    </div>

                    <!-- REGISTER DROPDOWN -->
                    <div class="nav-dropdown">
                        <button type="button" class="nav-pill-btn nav-pill-primary" id="navRegisterBtn">
                            <span>Register</span> <i class="fa-solid fa-chevron-down nav-dropdown-arrow"></i>
                        </button>
                        <div class="nav-dropdown-menu">
                            <a href="/auth/userRegister" class="nav-dropdown-item"><i class="fa-solid fa-user-plus"></i> Customer Register</a>
                            <a href="/auth/buisnessRegister" class="nav-dropdown-item"><i class="fa-solid fa-shop"></i> Merchant Register</a>
                        </div>
                    </div>
                </div>
            `;
        } else if (isShop) {
            navActionsHtml = `
                <div class="nav-actions">
                    <a href="/products/uploadProductTypeSelectMenu" class="nav-pill-btn nav-pill-primary">
                        <i class="fa-solid fa-plus"></i> Add Product
                    </a>
                    <a href="/auth/profile" class="nav-pill-btn nav-pill-ghost">
                        Store Profile
                    </a>
                    <button type="button" class="nav-pill-btn nav-pill-logout" id="navLogoutBtn">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
                    </button>
                </div>
            `;
        } else {
            navActionsHtml = `
                <div class="nav-actions">
                    <a href="/auth/profile" class="nav-pill-btn nav-pill-ghost">
                        My Account
                    </a>
                    <button type="button" class="nav-pill-btn nav-pill-logout" id="navLogoutBtn">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
                    </button>
                </div>
            `;
        }

        header.innerHTML = `
            <div class="navbar-container">
                <a href="/" class="nav-brand" title="NearZo — Hyperlocal In-Stock Shopping">
                    <span class="brand-text">Near<span class="brand-accent">Zo</span></span>
                </a>
                ${navLinksHtml}
                ${navActionsHtml}
            </div>
        `;

        // Smooth scroll for "How It Works"
        const howItWorksLink = document.getElementById('navHowItWorks');
        if (howItWorksLink && (currentPath === '/' || currentPath.endsWith('index.html'))) {
            howItWorksLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById('how-it-works') || document.getElementById('about');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    history.pushState(null, null, '#how-it-works');
                }
            });
        }

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

        // Handle Dropdown Click Toggles (Login & Register)
        const dropdownToggles = header.querySelectorAll('.nav-dropdown > .nav-pill-btn');
        dropdownToggles.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const parent = btn.closest('.nav-dropdown');
                const wasOpen = parent.classList.contains('open');
                header.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
                if (!wasOpen) {
                    parent.classList.add('open');
                }
            });
        });

        document.addEventListener('click', () => {
            header.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
        });

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
