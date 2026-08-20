document.addEventListener("DOMContentLoaded", async () => {
    const gridContainer = document.getElementById("productsGrid");
    if (!gridContainer) {console.log("erorr loading page!"); return;};

    const response = await fetch("http://localhost:3000/products", {method: "GET"});

    if (!response.ok) {
        console.log("error fetching products from server!");
    }

    const products = await response.json();

    // no product, no error value throw till now just error return 
    if (products.length === 0) {
        gridContainer.style.display = "none";
        return;
    }

    gridContainer.style.display = "grid";

    gridContainer.innerHTML = products.map(product => {
        let badgeClass = "badge-in-stock";
        if (product.availability === "Low Stock") {
            badgeClass = "badge-low-stock";
        } else if (product.availability === "Out of Stock") {
            badgeClass = "badge-out-of-stock";
        }

        const formattedPrice = Number(product.price).toLocaleString('en-IN');
        console.log(product);

        return `
            <article class="product-card">
                <div class="product-img-wrapper">
                    <img src="http://localhost:3000/${product.images[0].path}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <span class="stock-badge ${badgeClass}">${product.availability}</span>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                    
                    <div class="product-price-row">
                        <span class="product-price">₹${formattedPrice}</span>
                    </div>
                    
                    <hr class="card-divider" />
                    
                    <div class="product-footer">
                        <span class="store-name">${product.store_name}</span>
                        <span class="store-location"><span class="pin">Location:</span> ${product.store_location}</span>
                    </div>
                </div>
            </article>
        `;
    }).join('');
});