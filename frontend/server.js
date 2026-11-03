const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5173;

// EJS templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Redirect legacy /productList to /products/products
app.get('/productList', (req, res) => {
    res.redirect(301, '/products/products');
});

app.get('/productListing/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const productRes = await fetch(`http://localhost:3000/products/${productId}`, {method: "GET"});
        if(!productRes.ok) {
            const error = await productRes.json();
            throw new Error(error.message);
        }
        const product = await productRes.json();
        const authRes = await fetch("http://localhost:3000/auth/me", {
            method: "GET",
            headers: { Cookie: req.headers.cookie || "" }
        });
        
        if(authRes.ok) {
            const authData = await authRes.json();
            res.render('products/productView', {product, isShop: authData.userType === 'shop'});
        } else {
            res.render('products/productView', {product, isShop: false});
        }
    } catch (err) {
        res.redirect('/products/products');
    }
});

// Upload Aliases and Direct Routing
app.get(['/upload', '/upload/select', '/upload/type', '/products/upload', '/products/uploadType', '/uploadProductTypeSelectMenu', '/products/uploadProductTypeSelectMenu'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'products', 'uploadProductTypeSelectMenu.html'));
});

app.get(['/upload/manual-upload', '/upload/manual', '/upload/custom', '/products/uploadCustom', '/uploadProduct', '/products/uploadProduct'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'products', 'uploadProduct.html'));
});

app.get(['/upload/barcode', '/upload/identified', '/products/uploadBarcode', '/uploadIdentifiedProduct', '/products/uploadIdentifiedProduct'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'products', 'uploadIdentifiedProduct.html'));
});

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Static files middleware for clean html URLs
app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    const cleanPath = req.path.endsWith('/') ? req.path.slice(0, -1) : req.path;
    const filePath = path.join(__dirname, 'public', `${cleanPath}.html`);
    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    }
    next();
});

// Static files (CSS, JS, images, icons, etc.)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Frontend running at http://localhost:${PORT}`);
});
