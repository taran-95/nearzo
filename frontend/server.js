const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5173;

// EJS templates
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// SSR route
app.get('/product', async (req, res) => {
    const response = await fetch("http://localhost:3000/products", {method: "GET"});

    if(!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
    }

    const products = await response.json();

    res.render('products/products', {
        products
    });
});

app.get('/product/:id', async (req, res) => {
    const productId = req.params.id;

    const productRes = await fetch(`http://localhost:3000/products/${productId}`, {method: "GET"});
    if(!productRes.ok) {
        const error = await productRes.json();
        throw new Error(error.message);
    }

    const product = await productRes.json();

    const offerRes = await fetch(`http://localhost:3000/offers/product/${product.id}`)
    if(!offerRes.ok) {
        const error = await productRes.json();
        throw new Error(error.message);
    }

    const offers = await offerRes.json();

    res.render('products/productView', {product, offers});
});


//Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Static files middleware
app.get('/{*splat}', (req, res, next) => {
  const filePath = path.join(
    __dirname,
    'public',
    `${req.path}.html`
  );

  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Frontend running at http://localhost:${PORT}`);
  console.log(path.join(__dirname, 'public'));
});