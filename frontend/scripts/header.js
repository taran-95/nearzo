async function loadHeader() {
    try {
        const response = await fetch('http://localhost:3000/auth/me', {method: "GET", credentials: "include"});
        const header = document.getElementById('header');
        
        if(!response.ok) {
            header.innerHTML = `
            <a href="/">NearZo</a>
            <nav>
                <a href="/">Home</a>
                <a href="/products/products">Products</a>
                <a href="/products/uploadProduct">For Business</a>

                <!-- LOGIN DROPDOWN -->
                <div class="nav-dropdown">
                    <a href="/auth/userLogin" class="nav-btn">Login ▾</a>
                    <div class="dropdown-menu">
                        <a href="/auth/userLogin">Login as User</a>
                        <a href="/auth/buisnessLogin">Login as Business</a>
                    </div>
                </div>

                <!-- REGISTER DROPDOWN -->
                <div class="nav-dropdown">
                    <a href="/auth/userRegister" class="nav-btn">Register ▾</a>
                    <div class="dropdown-menu">
                        <a href="/auth/userRegister">Register as User</a>
                        <a href="/auth/buisnessRegister">Register as Business</a>
                    </div>
                </div>
            </nav>
            `;
        } else {    
            header.innerHTML = `
            <a href="/">NearZo</a>
            <nav>
                <a href="/">Home</a>
                <a href="/products/products">Products</a>
                <a href="/products/uploadProduct">For Business</a>
                <a href="/auth/profile">Profile</a>
            </nav>
            `;
        }

    } catch (error) {
        alert(error.message);
    }
}

loadHeader();