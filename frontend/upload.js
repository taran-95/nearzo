document.addEventListener("DOMContentLoaded", async () => {
    const uploadForm = document.querySelector(".uploadForm");

    if (!uploadForm) {
        console.error("Upload form not found."); //throw an error
        return;
    };

    uploadForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const imageInput = document.getElementById("productImage");
        const files = imageInput ? imageInput.files : null;

        const saveAndRedirect = async() => {
            //restriction price and number
            const rawPrice = document.getElementById("productPrice")?.value || "0";
            const cleanedPrice = rawPrice.replace(/[^0-9.]/g, '') || "0";

            const formData = new FormData();
            formData.append('name', document.getElementById("productName")?.value.trim() || "");
            formData.append('price', cleanedPrice);
            formData.append('description', document.getElementById("productDescription")?.value.trim() || "");
            formData.append('store_name', document.getElementById("storeName")?.value.trim() || "");
            formData.append('store_location', document.getElementById("storeLocation")?.value.trim() || "");
            if(files?.length) {
                for(const file of files) {
                    formData.append('images', file);
                }
            }

            const response = await fetch("http://localhost:3000/products", {
                method: "POST",
                body: formData
            });

            if(!response.ok) {
                const error = await response.json();
                //TODO
                console.log(error);
                document.getElementById("error-div").textContent = error.message;
                return;
            }

            // prodcut goes to location product.html
            window.location.href = "products.html";
        };
        saveAndRedirect();
    });
});