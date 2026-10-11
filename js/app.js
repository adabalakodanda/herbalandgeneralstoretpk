import { supabase } from "./supabase-config.js";

// =========================================
// MODERN NOTIFICATION SYSTEM
// =========================================

function showNotification(message, type = "info") {

    const existing =
        document.querySelector(".store-notification");

    if (existing) {
        existing.remove();
    }

    const notification =
        document.createElement("div");

    notification.className =
        `store-notification ${type}`;

    let icon = "bi-info-circle-fill";

    if (type === "success") {
        icon = "bi-check-circle-fill";
    }

    if (type === "error") {
        icon = "bi-x-circle-fill";
    }

    if (type === "warning") {
        icon = "bi-exclamation-triangle-fill";
    }

    notification.innerHTML = `
        <i class="bi ${icon}"></i>
        <span>${message}</span>
        <button type="button" class="notification-close">
            &times;
        </button>
    `;

    document.body.appendChild(notification);

    setTimeout(function () {
        notification.classList.add("show");
    }, 10);

    const closeButton =
        notification.querySelector(".notification-close");

    closeButton.addEventListener("click", function () {
        notification.classList.remove("show");

        setTimeout(function () {
            notification.remove();
        }, 300);
    });

    setTimeout(function () {

        if (!notification.isConnected) {
            return;
        }

        notification.classList.remove("show");

        setTimeout(function () {
            if (notification.isConnected) {
                notification.remove();
            }
        }, 300);

    }, 4000);
}

let cart = {};

function getCartStorageKey(userId) {
    return `storeCart_${userId}`;
}

async function loadUserCart() {
    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        cart = {};
        updateCartCount();
        updateProductQuantities();
        return;
    }

    const cartKey = getCartStorageKey(user.id);

    cart = JSON.parse(localStorage.getItem(cartKey)) || {};

    updateCartCount();
    updateProductQuantities();
}

async function saveUserCart() {
    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) return;

    const cartKey = getCartStorageKey(user.id);

    localStorage.setItem(
        cartKey,
        JSON.stringify(cart)
    );
}
let productsData = {};
// =========================================
// GENERAL STORE - MAIN JAVASCRIPT
// =========================================











// =========================================
// CART NOTIFICATION
// =========================================

function showCartNotification() {

    // Remove existing notification
    const existingNotification =
        document.querySelector(".cart-notification");

    if (existingNotification) {
        existingNotification.remove();
    }


    // Create notification
    const notification = document.createElement("div");

    notification.className = "cart-notification";

    notification.innerHTML = `
        <i class="bi bi-check-circle-fill"></i>

        <span>Product added to cart</span>
    `;


    document.body.appendChild(notification);


    // Show
    setTimeout(() => {
        notification.classList.add("show");
    }, 10);


    // Remove
    setTimeout(() => {

        notification.classList.remove("show");

        setTimeout(() => {
            notification.remove();
        }, 300);

    }, 1800);

}


// =========================================
// PRODUCT SEARCH
// =========================================

const searchInputs = document.querySelectorAll(
    "#searchInput, #productSearch, .hero-search input"
);

searchInputs.forEach(function (input) {

    input.addEventListener("input", function () {

        const searchValue =
            input.value.trim().toLowerCase();

        const productSections =
            document.querySelectorAll(".product-section");

        productSections.forEach(function (section) {

            const productCards =
                section.querySelectorAll(".product-card");

            let visibleProducts = 0;

            productCards.forEach(function (card) {

                const productName =
                    card.querySelector("h3")?.textContent
                        .trim()
                        .toLowerCase() || "";

                const productDescription =
                    card.querySelector(".product-info p")?.textContent
                        .trim()
                        .toLowerCase() || "";

                const matches =
                    productName.includes(searchValue) ||
                    productDescription.includes(searchValue);

                if (matches) {
                    card.style.display = "";
                    visibleProducts++;

                    // Scroll to the first matching product
                    if (
                        visibleProducts === 1 &&
                        searchValue !== ""
                    ) {
                        setTimeout(function () {
                            card.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                            });
                        }, 100);
                    }

                } else {
                    card.style.display = "none";
                }

            });

            // Hide category section if no products match
            if (searchValue !== "" && visibleProducts === 0) {
                section.style.display = "none";
            } else {
                section.style.display = "";
            }

        });

    });

});


// =========================================
// MOBILE NAVIGATION
// =========================================

const mobileNavigation =
    document.querySelectorAll(
        ".mobile-navigation a"
    );

mobileNavigation.forEach(function (item) {

    item.addEventListener("click", function (event) {

        event.preventDefault();

        // Active button
        mobileNavigation.forEach(function (nav) {
            nav.classList.remove("active");
        });

        item.classList.add("active");

        const action =
            item.dataset.mobileAction;

        // HOME
        if (action === "home") {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

        // SEARCH
        else if (action === "search") {

            const searchInput =
                document.querySelector(
                    "#searchInput, .hero-search input"
                );

            if (searchInput) {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

                setTimeout(function () {
                    searchInput.focus();
                }, 400);

            }

        }

        // CART
        else if (action === "cart") {

            openCart();

        }

        // ORDERS
        else if (action === "orders") {

            const ordersMenuBtn =
                document.getElementById(
                    "ordersMenuBtn"
                );

            if (ordersMenuBtn) {
                ordersMenuBtn.click();
            }

        }

        // ACCOUNT
        else if (action === "account") {

            if (loginBtn) {
                loginBtn.click();
            }

        }

    });

});


// =========================================
// CART PANEL
// =========================================

const headerCartButton =
    document.querySelector(".cart-button");

const cartPanel =
    document.getElementById("cartPanel");

const cartOverlay =
    document.getElementById("cartOverlay");

const closeCart =
    document.getElementById("closeCart");


function openCart() {

    renderCart();

    cartPanel.classList.add("show");
    cartOverlay.classList.add("show");
}


function closeCartPanel() {

    cartPanel.classList.remove("show");
    cartOverlay.classList.remove("show");
}


if (headerCartButton) {

    headerCartButton.addEventListener(
        "click",
        openCart
    );

}


if (closeCart) {

    closeCart.addEventListener(
        "click",
        closeCartPanel
    );

}


if (cartOverlay) {

    cartOverlay.addEventListener(
        "click",
        closeCartPanel
    );

}

function renderCart() {

    const cartItems =
        document.getElementById("cartItems");

    const cartTotal =
        document.getElementById("cartTotal");

    const cartItemSummary =
        document.getElementById("cartItemSummary");

    cartItems.innerHTML = "";

    let total = 0;
    let totalQuantity = 0;

    const cartProductIds =
        Object.keys(cart);

    if (cartProductIds.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">

                <i class="bi bi-cart3"></i>

                <h3>Your cart is empty</h3>

                <p>
                    Add some products to your cart.
                </p>

            </div>
        `;

        cartTotal.textContent =
            "₹0.00";

        cartItemSummary.textContent =
            "0 items";

        return;
    }


    cartProductIds.forEach(function (productId) {

        const item =
            cart[productId];

        const product =
            productsData[productId];

        if (!product) return;


        const subtotal =
            Number(product.price || 0) *
            item.quantity;

        total += subtotal;
        totalQuantity += item.quantity;


        const cartItem =
            document.createElement("div");

        cartItem.className =
            "cart-item";


        cartItem.innerHTML = `

            <div class="cart-item-image">

                ${
                    product.image_url
                    ? `
                        <img
                            src="${product.image_url}"
                            alt="${product.name || "Product"}"
                        >
                    `
                    : `
                        <i class="bi bi-image"></i>
                    `
                }

            </div>


            <div class="cart-item-details">

                <h3>
                    ${product.name || "Unnamed Product"}
                </h3>

                <p>
                    ₹${product.price ?? "0.00"}
                </p>


                <div class="cart-item-bottom">

                    <div class="cart-quantity">

                        <button
                            class="cart-minus"
                            data-id="${product.id}">
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            class="cart-plus"
                            data-id="${product.id}">
                            +
                        </button>

                    </div>


                    <strong>
                        ₹${subtotal.toFixed(2)}
                    </strong>

                </div>

            </div>

        `;

        cartItems.appendChild(cartItem);

    });


    cartTotal.textContent =
        `₹${total.toFixed(2)}`;

    cartItemSummary.textContent =
        `${totalQuantity} item${totalQuantity === 1 ? "" : "s"}`;

}

document
    .getElementById("cartItems")
    .addEventListener("click", function (event) {

        const plusButton =
            event.target.closest(".cart-plus");

        const minusButton =
            event.target.closest(".cart-minus");


        if (!plusButton && !minusButton) {
            return;
        }


        const button =
            plusButton || minusButton;

        const productId =
            button.dataset.id;


        if (plusButton) {

            cart[productId].quantity++;

        }


        if (minusButton) {

            cart[productId].quantity--;

            if (cart[productId].quantity <= 0) {

                delete cart[productId];

            }

        }


        updateCartCount();
        updateProductQuantities();

        saveUserCart();

        renderCart();

    });



async function loadCustomerCategories() {

    const container =
        document.getElementById("categories-container");

    if (!container) return;

    container.innerHTML = "";

    try {

        const { data: categories, error } =
            await supabase
                .from("categories")
                .select("id, name, icon")
                .eq("status", "active")
                .order("name");

        if (error) {
            throw error;
        }

        if (!categories || categories.length === 0) {

            container.innerHTML = `
                <p class="empty-message">
                    No categories available.
                </p>
            `;

            return;
        }

        categories.forEach(function (category) {

            const categoryCard =
                document.createElement("button");

            categoryCard.className =
                "category-card";
            categoryCard.dataset.categoryId =
                category.id;

            categoryCard.innerHTML = `
                <div class="category-icon">
                    <i class="bi ${category.icon || "bi-grid"}"></i>
                </div>

                <span>${category.name}</span>
            `;

            container.appendChild(categoryCard);

        });
        document
            .getElementById("categories-container")
            .addEventListener("click", function (event) {

                const categoryButton =
                    event.target.closest(".category-card");

                if (!categoryButton) {
                    return;
                }

                const categoryId =
                    categoryButton.dataset.categoryId;

                const targetSection =
                    document.querySelector(
                        `.product-section[data-category-id="${categoryId}"]`
                    );
                document
                    .querySelectorAll(".category-card")
                    .forEach(function (card) {
                        card.classList.remove("active");
                    });

                categoryButton.classList.add("active");

                if (targetSection) {

                    targetSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            });

    } catch (error) {

        console.error(
            "Loading customer categories failed:",
            error
        );

        container.innerHTML = `
            <p class="empty-message">
                Failed to load categories.
            </p>
        `;
    }
}

async function loadCustomerProducts() {

    const container =
        document.getElementById("products-container");

    if (!container) return;

    container.innerHTML = "";

    try {

        const { data: categories, error: categoryError } =
            await supabase
                .from("categories")
                .select("id, name, icon")
                .eq("status", "active")
                .order("name");

        if (categoryError) {
            throw categoryError;
        }


        const { data: products, error: productError } =
            await supabase
                .from("products")
                .select(`
                    id,
                    name,
                    description,
                    price,
                    image_url,
                    category_id
                `)
                .eq("status", "available")
                .order("created_at", {
                    ascending: false
                });

        if (productError) {
            throw productError;
        }


        if (!categories || categories.length === 0) {

            container.innerHTML = `
                <p class="empty-message">
                    No categories available.
                </p>
            `;

            return;
        }


        categories.forEach(function (category) {

            const categoryProducts =
                products.filter(function (product) {

                    return Number(product.category_id) ===
                           Number(category.id);

                });


            // Don't show empty categories
            if (categoryProducts.length === 0) {
                return;
            }


            // Store product information
            categoryProducts.forEach(function (product) {

                productsData[product.id] =
                    product;

            });


            // Create category section
            const section =
                document.createElement("section");

            section.className =
                "product-section";

            section.dataset.categoryId =
                category.id;


            // Category heading
            section.innerHTML = `

                <div class="container">

                    <div class="section-heading">

                    <div>

                        <h2>
                            <i class="bi ${category.icon || "bi-grid"}"></i>
                            ${category.name}
                        </h2>

                    </div>

                    <div class="category-heading-actions">

                        <button
                            type="button"
                            class="view-all-category"
                            data-category-id="${category.id}">
                            View All
                            <i class="bi bi-arrow-right"></i>
                        </button>

                        <div class="product-slider-buttons">

                            <button
                                class="slider-prev"
                                type="button">
                                <i class="bi bi-chevron-left"></i>
                            </button>

                            <button
                                class="slider-next"
                                type="button">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                        
                        </div>
                    </div>

                </div>

                <div class="product-slider">
                </div>
                </div>
            `;


            const slider =
                section.querySelector(".product-slider");


            // Create products
            categoryProducts.forEach(function (product) {

                const productCard =
                    document.createElement("div");

                productCard.className =
                    "product-card";


                productCard.innerHTML = `
                    <div class="product-image">

                        ${
                            product.image_url
                            ? `
                                <img
                                    src="${product.image_url}"
                                    alt="${product.name || "Product"}"
                                >
                            `
                            : `
                                <div class="no-product-image">
                                    <i class="bi bi-image"></i>
                                </div>
                            `
                        }

                    </div>

                    <div class="product-info">

                        <span class="product-category">
                            ${category.name}
                        </span>

                        <h3>
                            ${product.name || "Unnamed Product"}
                        </h3>

                        <p>
                            ${product.description || ""}
                        </p>

                        <div class="product-bottom">

                            <strong>
                                ₹${product.price ?? "—"}
                            </strong>

                            <div class="quantity-control">

                                <button
                                    type="button"
                                    class="quantity-minus"
                                    data-id="${product.id}">
                                    −
                                </button>

                                <span
                                    class="quantity-value"
                                    data-id="${product.id}">
                                    0
                                </span>

                                <button
                                    type="button"
                                    class="quantity-plus"
                                    data-id="${product.id}">
                                    +
                                </button>

                            </div>

                        </div>

                    </div>
                `;


                slider.appendChild(productCard);

            });


            container.appendChild(section);
            const viewAllButton =
                section.querySelector(".view-all-category");

            viewAllButton.addEventListener("click", function () {

                // Create modal
                const modal =
                    document.createElement("div");

                modal.className =
                    "category-products-modal";

                modal.innerHTML = `

                    <div class="category-products-modal-content">

                        <div class="category-products-modal-header">

                            <div>
                                <h2>
                                    ${category.name}
                                </h2>

                                <p>
                                    ${categoryProducts.length} products
                                </p>
                            </div>

                            <button
                                type="button"
                                class="category-products-modal-close"
                                aria-label="Close">
                                <i class="bi bi-x-lg"></i>
                            </button>

                        </div>


                        <div class="category-products-modal-body">

                            <div class="category-products-grid">
                            </div>

                        </div>

                    </div>

                `;

                document.body.appendChild(modal);


                const grid =
                    modal.querySelector(
                        ".category-products-grid"
                    );


                // Create all product cards
                categoryProducts.forEach(function (product) {

                    const productCard =
                        document.createElement("div");

                    productCard.className =
                        "product-card";

                    productCard.innerHTML = `

                        <div class="product-image">

                            ${
                                product.image_url
                                ? `
                                    <img
                                        src="${product.image_url}"
                                        alt="${product.name || "Product"}"
                                    >
                                `
                                : `
                                    <div class="no-product-image">
                                        <i class="bi bi-image"></i>
                                    </div>
                                `
                            }

                        </div>


                        <div class="product-info">

                            <span class="product-category">
                                ${category.name}
                            </span>

                            <h3>
                                ${product.name || "Unnamed Product"}
                            </h3>

                            <p>
                                ${product.description || ""}
                            </p>


                            <div class="product-bottom">

                                <strong>
                                    ₹${product.price ?? "—"}
                                </strong>


                                <div class="quantity-control">

                                    <button
                                        type="button"
                                        class="quantity-minus"
                                        data-id="${product.id}">
                                        −
                                    </button>

                                    <span
                                        class="quantity-value"
                                        data-id="${product.id}">
                                        ${
                                            cart[product.id]
                                            ? cart[product.id].quantity
                                            : 0
                                        }
                                    </span>

                                    <button
                                        type="button"
                                        class="quantity-plus"
                                        data-id="${product.id}">
                                        +
                                    </button>

                                </div>

                            </div>

                        </div>

                    `;

                    grid.appendChild(productCard);

                });


                // Show modal
                requestAnimationFrame(function () {
                    modal.classList.add("show");
                });


                // Close button
                const closeButton =
                    modal.querySelector(
                        ".category-products-modal-close"
                    );

                closeButton.addEventListener(
                    "click",
                    function () {

                        modal.classList.remove("show");

                        setTimeout(function () {
                            modal.remove();
                        }, 250);

                    }
                );


                // Quantity buttons inside modal
                grid.addEventListener(
                    "click",
                    function (event) {

                        const plusButton =
                            event.target.closest(
                                ".quantity-plus"
                            );

                        const minusButton =
                            event.target.closest(
                                ".quantity-minus"
                            );

                        if (!plusButton && !minusButton) {
                            return;
                        }

                        const button =
                            plusButton || minusButton;

                        const productId =
                            button.dataset.id;

                        const quantityElement =
                            grid.querySelector(
                                `.quantity-value[data-id="${productId}"]`
                            );

                        let quantity =
                            cart[productId]
                            ? cart[productId].quantity
                            : 0;


                        if (plusButton) {
                            quantity++;
                        }


                        if (minusButton && quantity > 0) {
                            quantity--;
                        }


                        if (quantity === 0) {

                            delete cart[productId];

                        } else {

                            cart[productId] = {
                                quantity: quantity
                            };

                        }


                        quantityElement.textContent =
                            quantity;

                        updateCartCount();

                        saveUserCart();

                    }
                );

            });


            // Slider buttons
            const previousButton =
                section.querySelector(".slider-prev");

            const nextButton =
                section.querySelector(".slider-next");


            previousButton.addEventListener(
                "click",
                function () {

                    slider.scrollBy({
                        left: -450,
                        behavior: "smooth"
                    });

                }
            );


            nextButton.addEventListener(
                "click",
                function () {

                    slider.scrollBy({
                        left: 450,
                        behavior: "smooth"
                    });

                }
            );

        });


    } catch (error) {

        console.error(
            "Loading customer products failed:",
            error
        );

        container.innerHTML = `
            <p class="empty-message">
                Failed to load products.
            </p>
        `;

    }
}

loadCustomerCategories();
loadCustomerProducts().then(function () {
    updateCartCount();
    updateProductQuantities();
});

document
    .getElementById("products-container")
    .addEventListener("click", function (event) {

        const plusButton =
            event.target.closest(".quantity-plus");

        const minusButton =
            event.target.closest(".quantity-minus");

        if (!plusButton && !minusButton) {
            return;
        }

        const button =
            plusButton || minusButton;

        const productId =
            button.dataset.id;

        const quantityElement =
            document.querySelector(
                `.quantity-value[data-id="${productId}"]`
            );

        let quantity =
            cart[productId]
                ? cart[productId].quantity
                : 0;

        if (plusButton) {
            quantity++;
        }

        if (minusButton && quantity > 0) {
            quantity--;
        }

        if (quantity === 0) {

            delete cart[productId];

        } else {

            cart[productId] = {
                quantity: quantity
            };

        }

        quantityElement.textContent =
            quantity;

        updateCartCount();
        saveUserCart();
    });

    function updateCartCount() {

    let totalQuantity = 0;

    Object.values(cart).forEach(function (item) {

        totalQuantity += item.quantity;

    });

    const cartCount =
        document.querySelector(".cart-count");

    if (cartCount) {
        cartCount.textContent =
            totalQuantity;
    }
}

function updateProductQuantities() {

    document
        .querySelectorAll(".quantity-value")
        .forEach(function (element) {

            const productId = element.dataset.id;

            const quantity =
                cart[productId]
                    ? cart[productId].quantity
                    : 0;

            element.textContent = quantity;
        });
}
// =========================================
// CHECKOUT PANEL
// =========================================

const checkoutBtn =
    document.getElementById("checkoutBtn");

const checkoutPanel =
    document.getElementById("checkoutPanel");

const checkoutOverlay =
    document.getElementById("checkoutOverlay");

const closeCheckout =
    document.getElementById("closeCheckout");


async function openCheckout() {

    if (Object.keys(cart).length === 0) {

        showNotification(
            "Your cart is empty.",
            "warning"
        );

        return;
    }

    renderCheckout();

    checkoutPanel.classList.add("show");
    checkoutOverlay.classList.add("show");
    await loadCheckoutAddresses();

}


function closeCheckoutPanel() {

    checkoutPanel.classList.remove("show");
    checkoutOverlay.classList.remove("show");

}


if (checkoutBtn) {

    checkoutBtn.addEventListener(
        "click",
        openCheckout
    );

}


if (closeCheckout) {

    closeCheckout.addEventListener(
        "click",
        closeCheckoutPanel
    );

}


if (checkoutOverlay) {

    checkoutOverlay.addEventListener(
        "click",
        closeCheckoutPanel
    );

}

function renderCheckout() {

    const checkoutItems =
        document.getElementById("checkoutItems");

    const checkoutTotal =
        document.getElementById("checkoutTotal");

    checkoutItems.innerHTML = "";

    let total = 0;

    Object.keys(cart).forEach(function (productId) {

        const item =
            cart[productId];

        const product =
            productsData[productId];

        if (!product) return;

        const subtotal =
            Number(product.price || 0) *
            item.quantity;

        total += subtotal;

        const itemElement =
            document.createElement("div");

        itemElement.className =
            "checkout-item";

        itemElement.innerHTML = `
            <div>
                <strong>
                    ${product.name || "Unnamed Product"}
                </strong>

                <span>
                    ${item.quantity} × ₹${product.price ?? "0.00"}
                </span>
            </div>

            <strong>
                ₹${subtotal.toFixed(2)}
            </strong>
        `;

        checkoutItems.appendChild(
            itemElement
        );

    });

    const deliveryCharge =
        total < 1000 ? 100 : 0;

    const finalTotal =
        total + deliveryCharge;

    const checkoutSubtotal =
        document.getElementById("checkoutSubtotal");

    const checkoutDeliveryCharge =
        document.getElementById("checkoutDeliveryCharge");

    if (checkoutSubtotal) {
        checkoutSubtotal.textContent =
            `₹${total.toFixed(2)}`;
    }

    if (checkoutDeliveryCharge) {
        checkoutDeliveryCharge.textContent =
            deliveryCharge > 0
                ? `₹${deliveryCharge.toFixed(2)}`
                : "Free";
    }

    checkoutTotal.textContent =
        `₹${finalTotal.toFixed(2)}`;

    const upiPaymentAmount =
        document.getElementById("upiPaymentAmount");

    if (upiPaymentAmount) {
        upiPaymentAmount.textContent =
            `₹${finalTotal.toFixed(2)}`;
    }
}
async function placeOrder() {

    const placeOrderButton =
        document.getElementById("placeOrderBtn");

    // Payment must be marked as paid first
    if (!placeOrderButton || placeOrderButton.disabled) {
        showNotification(
            "Please complete the UPI payment and click I've Paid.",
            "warning"
        );
        return;
    }

    const addressId = selectedCheckoutAddressId;

    if (!addressId) {
        showNotification(
            "Please select a delivery address.",
            "warning"
        );
        return;
    }

    placeOrderButton.disabled = true;

    placeOrderButton.innerHTML = `
        <i class="bi bi-hourglass-split"></i>
        Placing Order...
    `;

    try {

        // --------------------------------
        // Calculate items total
        // --------------------------------

        let total = 0;

        Object.keys(cart).forEach(function (productId) {

            const item = cart[productId];
            const product = productsData[productId];

            if (product) {

                total +=
                    Number(product.price || 0) *
                    item.quantity;

            }

        });


        // --------------------------------
        // Calculate delivery charge
        // --------------------------------

        const deliveryCharge =
            total < 1000 ? 100 : 0;

        const finalTotal =
            total + deliveryCharge;


        // --------------------------------
        // Get logged-in user
        // --------------------------------

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("User is not logged in.");
        }


        // --------------------------------
        // Create order
        // --------------------------------

        const {
            data: order,
            error: orderError
        } = await supabase
            .from("orders")
            .insert({

                user_id: user.id,

                address_id: addressId,

                total_amount: finalTotal,

                delivery_charge: deliveryCharge,

                status: "new"

            })
            .select()
            .single();


        if (orderError) {
            throw orderError;
        }


        // --------------------------------
        // Create order items
        // --------------------------------

        const orderItems =
            Object.keys(cart).map(function (productId) {

                const item =
                    cart[productId];

                const product =
                    productsData[productId];

                const price =
                    Number(product.price || 0);

                return {

                    order_id: order.id,

                    product_id: product.id,

                    product_name:
                        product.name ||
                        "Unnamed Product",

                    quantity:
                        item.quantity,

                    price: price,

                    subtotal:
                        price *
                        item.quantity

                };

            });


        const {
            error: itemsError
        } = await supabase
            .from("order_items")
            .insert(orderItems);


        if (itemsError) {
            throw itemsError;
        }


        // --------------------------------
        // Success
        // --------------------------------

        showNotification(
            `Order placed successfully! Order ID: ${order.id}`,
            "success"
        );


        // Clear cart

        cart = {};

        localStorage.removeItem(
            getCartStorageKey(user.id)
        );

        updateCartCount();

        renderCart();

        closeCheckoutPanel();


    } catch (error) {

        console.error(
            "Order placement failed:",
            error
        );

        showNotification(
            "Failed to place order. Please try again.",
            "error"
        );

        // Allow retry
        placeOrderButton.disabled = false;

        placeOrderButton.innerHTML = `
            <i class="bi bi-check2-circle"></i>
            Pay & Place Order
        `;

    }

}
const placeOrderBtn = document.getElementById("placeOrderBtn");

if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", placeOrder);
}

// ===============================
// CUSTOMER AUTHENTICATION
// ===============================



const loginBtn = document.getElementById("loginBtn");
const authModal = document.getElementById("authModal");
const authOverlay = document.getElementById("authOverlay");
const closeAuth = document.getElementById("closeAuth");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

function openAuthModal() {
    authModal.classList.add("show");
    authOverlay.classList.add("show");
}
if (
    new URLSearchParams(window.location.search)
        .get("login") === "true"
) {
    openAuthModal();

    // Remove ?login=true from the URL
    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );
}

function closeAuthModal() {
    authModal.classList.remove("show");
    authOverlay.classList.remove("show");
}


if (closeAuth) {
    closeAuth.addEventListener("click", closeAuthModal);
}

if (authOverlay) {
    authOverlay.addEventListener("click", closeAuthModal);
}


// Show Register
// Show Register
if (showRegister) {

    showRegister.addEventListener("click", function () {

        loginForm.style.display = "none";
        registerForm.style.display = "block";
        forgotPasswordForm.style.display = "none";
        resetPasswordOtpForm.style.display = "none";
        resetPasswordForm.style.display = "none";

        document.getElementById("authTitle").textContent =
            "Create Account";

        document.getElementById("authSubtitle").textContent =
            "Register to start shopping";

    });

}


// Show Login
// Show Login
if (showLogin) {

    showLogin.addEventListener("click", function () {

        registerForm.style.display = "none";
        forgotPasswordForm.style.display = "none";
        resetPasswordOtpForm.style.display = "none";
        resetPasswordForm.style.display = "none";

        loginForm.style.display = "block";

        document.getElementById("authTitle").textContent =
            "Welcome Back";

        document.getElementById("authSubtitle").textContent =
            "Login to continue shopping";

    });

}

// ===============================
// LOGIN
// ===============================

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;


            // Check whether the logged-in user is an admin
            const { data: isAdmin, error: adminError } =
                await supabase.rpc("is_admin");

            if (adminError) {
                console.error("Admin check failed:", adminError);
                throw adminError;
            }


            // Admin → Admin Dashboard
            if (isAdmin === true) {

                showNotification(
                    "Admin login successful. Redirecting...",
                    "success"
                );

                setTimeout(function () {
                    window.location.href = "admin/index.html";
                }, 500);

                return;
            }


            // Normal customer → Store
            showNotification(
                "Login successful!",
                "success"
            );

            closeAuthModal();

            await loadUserCart();

            updateCustomerLoginUI();

        } catch (error) {
            console.error("Login failed:", error);

            showNotification(
                error.message,
                "error"
            );
        }
    });
}

// ===============================
// FORGOT PASSWORD - SEND OTP
// ===============================

const forgotPasswordBtn =
    document.getElementById("forgotPasswordBtn");

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const resetPasswordOtpForm =
    document.getElementById("resetPasswordOtpForm");
const resetPasswordForm =
    document.getElementById("resetPasswordForm");

const backToLogin =
    document.getElementById("backToLogin");
if (forgotPasswordBtn) {

    forgotPasswordBtn.addEventListener("click", function () {

        loginForm.style.display = "none";
        registerForm.style.display = "none";

        forgotPasswordForm.style.display = "block";

        document.getElementById("authTitle").textContent =
            "Forgot Password";

        document.getElementById("authSubtitle").textContent =
            "Enter your email to receive an OTP";

    });

}


// Send OTP
if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("forgotPasswordEmail")
                .value.trim();

        if (!email) {
            showNotification(
                "Please enter your email address.",
                "warning"
            );
            return;
        }

        try {

            const { error } =
                await supabase.auth.resetPasswordForEmail(email);

            if (error) {
                throw error;
            }

            showNotification(
                "OTP sent successfully! Please check your email.",
                "success"
            );

            forgotPasswordForm.style.display = "none";
            resetPasswordOtpForm.style.display = "block";

            document.getElementById("authTitle").textContent =
                "Verify OTP";

            document.getElementById("authSubtitle").textContent =
                "Enter the OTP sent to your email";

        } catch (error) {

            console.error(
                "Forgot password error:",
                error
            );

            showNotification(
                error.message,
                "error"
            );
        }

    });

}


// Back to Login
if (backToLogin) {

    backToLogin.addEventListener("click", function () {

        forgotPasswordForm.style.display = "none";
        resetPasswordOtpForm.style.display = "none";
        resetPasswordForm.style.display = "none";

        loginForm.style.display = "block";

        document.getElementById("authTitle").textContent =
            "Welcome Back";

        document.getElementById("authSubtitle").textContent =
            "Login to continue shopping";

    });

}
// ===============================
// FORGOT PASSWORD - VERIFY OTP
// ===============================

if (resetPasswordOtpForm) {

    resetPasswordOtpForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("forgotPasswordEmail")
                .value.trim();

        const token =
            document.getElementById("resetOtpCode")
                .value.trim();

        if (!/^\d{6}$/.test(token)) {
            showNotification(
                "Please enter a valid 6-digit OTP.",
                "warning"
            );
            return;
        }

        try {

            const { data, error } =
                await supabase.auth.verifyOtp({
                    email: email,
                    token: token,
                    type: "recovery"
                });

            if (error) {
                throw error;
            }

            if (!data.session) {
                throw new Error(
                    "Could not start password reset session."
                );
            }

            resetPasswordOtpForm.style.display = "none";
            resetPasswordForm.style.display = "block";

            document.getElementById("authTitle").textContent =
                "Create New Password";

            document.getElementById("authSubtitle").textContent =
                "Enter your new password";

        } catch (error) {

            console.error(
                "Recovery OTP verification failed:",
                error
            );

            showNotification(
                error.message,
                "error"
            );
        }

    });

}

// ===============================
// RESET PASSWORD
// ===============================

if (resetPasswordForm) {

    resetPasswordForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (newPassword.length < 6) {
            showNotification(
                "Password must be at least 6 characters.",
                "warning"
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification(
                "Passwords do not match.",
                "warning"
            );
            return;
        }

        try {

            const { error } =
                await supabase.auth.updateUser({
                    password: newPassword
                });

            if (error) {
                throw error;
            }

            showNotification(
                "Password updated successfully! You can now login with your new password.",
                "success"
            );

            await supabase.auth.signOut();

            resetPasswordForm.reset();

            resetPasswordForm.style.display = "none";

            loginForm.style.display = "block";

            document.getElementById("authTitle").textContent =
                "Welcome Back";

            document.getElementById("authSubtitle").textContent =
                "Login to continue shopping";

        } catch (error) {

            console.error(
                "Password update error:",
                error
            );

            showNotification(
                error.message,
                "error"
            );
        }

    });

}

// ===============================
// REGISTER
// ===============================

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const phone = document.getElementById("registerPhone").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;

        if (!name || !phone || !email || !password) {
            showNotification(
                "Please fill all fields.",
                "warning"
            );
            return;
        }

        if (password.length < 6) {
            showNotification(
                "Password must contain at least 6 characters.",
                "warning"
            );
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name,
                        phone: phone
                    }
                }
            });

            if (error) throw error;

            if (!data.user) {
                throw new Error("Account creation failed.");
            }

            showNotification(
                "Account created successfully! A verification code has been sent to your email.",
                "success"
            );

            // Hide registration form
            registerForm.style.display = "none";

            const otpForm = document.getElementById("otpForm");

            if (!otpForm) {
                showNotification(
                    "OTP form not found in index.html",
                    "error"
                );
                return;
            }

            otpForm.style.display = "block";

            document.getElementById("authTitle").textContent =
                "Verify Your Email";

            document.getElementById("authSubtitle").textContent =
                "Enter the 6-digit code sent to your email";

        } catch (error) {
            console.error("Registration failed:", error);

            showNotification(
                error.message,
                "error"
            );
        }
    });
}

const otpForm = document.getElementById("otpForm");

if (otpForm) {
    otpForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const otp = document.getElementById("otpCode").value.trim();

        if (!/^\d{6}$/.test(otp)) {
            showNotification(
                "Please enter a valid 6-digit OTP.",
                "warning"
            );
            return;
        }

        try {
            const email = document.getElementById("registerEmail").value.trim();

            const { data, error } = await supabase.auth.verifyOtp({
                email: email,
                token: otp,
                type: "signup"
            });

            if (error) throw error;

            if (!data.user) {
                throw new Error("Email verification failed.");
            }

            showNotification(
                "Email verified successfully! You can now login.",
                "success"
            );

            otpForm.reset();
            otpForm.style.display = "none";

            registerForm.style.display = "none";
            registerForm.reset();

            loginForm.style.display = "block";

            document.getElementById("authTitle").textContent =
                "Welcome Back";

            document.getElementById("authSubtitle").textContent =
                "Login to continue shopping";

        } catch (error) {
            console.error("OTP verification failed:", error);

            showNotification(
                error.message,
                "error"
            );
        }
    });
}
// ===============================
// CUSTOMER LOGIN UI
// ===============================

async function updateCustomerLoginUI() {

    if (!loginBtn) return;

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        loginBtn.innerHTML = `
            <i class="bi bi-person"></i>
            <span>Login</span>
        `;

        loginBtn.onclick = openAuthModal;

        return;
    }

    // Get customer profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

    const customerName =
        profile?.full_name || user.email.split("@")[0];

    loginBtn.innerHTML = `
        <i class="bi bi-person-check"></i>
        <span>${customerName}</span>
    `;

    loginBtn.onclick = function () {
        showAccountMenu(
            customerName,
            user.email
        );
    };
}

// =========================================
// CUSTOMER ACCOUNT MENU
// =========================================

function showAccountMenu(customerName, email) {

    const accountMenu =
        document.getElementById("accountMenu");

    const accountOverlay =
        document.getElementById("accountOverlay");

    const accountUserName =
        document.getElementById("accountUserName");

    const accountUserEmail =
        document.getElementById("accountUserEmail");

    if (!accountMenu || !accountOverlay) {
        return;
    }

    accountUserName.textContent =
        customerName;

    accountUserEmail.textContent =
        email;

    accountMenu.classList.add("show");
    accountOverlay.classList.add("show");
}

// Close Account Menu

const accountMenu =
    document.getElementById("accountMenu");

const accountOverlay =
    document.getElementById("accountOverlay");

const closeAccountMenu =
    document.getElementById("closeAccountMenu");


function closeAccountPanel() {

    if (accountMenu) {
        accountMenu.classList.remove("show");
    }

    if (accountOverlay) {
        accountOverlay.classList.remove("show");
    }
}



// Close button
if (closeAccountMenu) {

    closeAccountMenu.addEventListener(
        "click",
        closeAccountPanel
    );

}


// Close when clicking outside
if (accountOverlay) {

    accountOverlay.addEventListener(
        "click",
        closeAccountPanel
    );

}

// =========================================
// LOGOUT CONFIRMATION
// =========================================

function showCustomerMenu(customerName) {

    const logoutOverlay =
        document.getElementById("logoutOverlay");

    const logoutMessage =
        document.getElementById("logoutMessage");

    const cancelLogout =
        document.getElementById("cancelLogout");

    const confirmLogout =
        document.getElementById("confirmLogout");

    if (!logoutOverlay) {
        return;
    }

    logoutMessage.textContent =
        `Hello ${customerName}! Do you want to logout?`;

    logoutOverlay.classList.add("show");

    // Cancel
    cancelLogout.onclick = function (event) {

        event.preventDefault();
        event.stopPropagation();

        logoutOverlay.classList.remove("show");
    };

    // Confirm Logout
    confirmLogout.onclick = async function () {

        try {

            const { error } =
                await supabase.auth.signOut();

            if (error) {
                throw error;
            }
            cart = {};
            updateCartCount();
            updateProductQuantities();
            renderCart();

            logoutOverlay.classList.remove("show");

            closeAccountPanel();

            await updateCustomerLoginUI();

            showNotification(
                "Logged out successfully.",
                "success"
            );

            setTimeout(function () {
                openAuthModal();
            }, 500);

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            showNotification(
                error.message,
                "error"
            );
        }
    };
}

// =========================================
// ACCOUNT MENU LOGOUT BUTTON
// =========================================

const accountLogoutBtn =
    document.getElementById("accountLogoutBtn");

if (accountLogoutBtn) {

    accountLogoutBtn.addEventListener(
        "click",
        async function () {

            // Close account menu first
            closeAccountPanel();

            // Get current user
            const {
                data: { user }
            } = await supabase.auth.getUser();

            if (!user) {
                return;
            }

            // Get customer name
            const { data: profile } =
                await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", user.id)
                    .maybeSingle();

            const customerName =
                profile?.full_name ||
                user.email.split("@")[0];

            // Open logout confirmation
            showCustomerMenu(customerName);
        }
    );

}

// =========================================
// CUSTOMER PROFILE
// =========================================

const profileOverlay =
    document.getElementById("profileOverlay");

const closeProfile =
    document.getElementById("closeProfile");

const profileMenuBtn =
    document.getElementById("profileMenuBtn");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");


// Open Profile
if (profileMenuBtn) {

    profileMenuBtn.addEventListener(
        "click",
        async function () {

            closeAccountPanel();

            const {
                data: { user }
            } = await supabase.auth.getUser();

            if (!user) {
                showNotification(
                    "Please login first.",
                    "warning"
                );
                return;
            }

            // Get profile
            const { data: profile, error } =
                await supabase
                    .from("profiles")
                    .select("full_name, phone")
                    .eq("id", user.id)
                    .maybeSingle();

            if (error) {
                console.error(
                    "Profile loading failed:",
                    error
                );

                showNotification(
                    "Failed to load profile.",
                    "error"
                );

                return;
            }

            document.getElementById("profileName").value =
                profile?.full_name || "";

            document.getElementById("profileEmail").value =
                user.email || "";

            document.getElementById("profilePhone").value =
                profile?.phone || "";

            profileOverlay.classList.add("show");
        }
    );

}


// Close Profile
if (closeProfile) {

    closeProfile.addEventListener(
        "click",
        function () {

            profileOverlay.classList.remove("show");

        }
    );

}


// Close when clicking outside
if (profileOverlay) {

    profileOverlay.addEventListener(
        "click",
        function (event) {

            if (event.target === profileOverlay) {

                profileOverlay.classList.remove("show");

            }

        }
    );

}

// =========================================
// SAVE CUSTOMER PROFILE
// =========================================

if (saveProfileBtn) {

    saveProfileBtn.addEventListener(
        "click",
        async function () {

            const name =
                document.getElementById("profileName")
                    .value.trim();

            const phone =
                document.getElementById("profilePhone")
                    .value.trim();

            if (!name || !phone) {

                showNotification(
                    "Please fill all profile fields.",
                    "warning"
                );

                return;
            }

            try {

                const {
                    data: { user }
                } = await supabase.auth.getUser();

                if (!user) {

                    showNotification(
                        "Please login first.",
                        "warning"
                    );

                    return;
                }

                saveProfileBtn.disabled = true;

                saveProfileBtn.innerHTML = `
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                `;

                const { error } =
                    await supabase
                        .from("profiles")
                        .upsert({
                            id: user.id,
                            full_name: name,
                            phone: phone
                        });

                if (error) {
                    throw error;
                }

                showNotification(
                    "Profile updated successfully!",
                    "success"
                );

                profileOverlay.classList.remove("show");

                // Refresh customer name in header
                updateCustomerLoginUI();

            } catch (error) {

                console.error(
                    "Profile update failed:",
                    error
                );

                showNotification(
                    "Failed to update profile. Please try again.",
                    "error"
                );

            } finally {

                saveProfileBtn.disabled = false;

                saveProfileBtn.innerHTML = `
                    <i class="bi bi-check2"></i>
                    Save Changes
                `;
            }
        }
    );

}
// =========================================
// CUSTOMER ORDERS
// =========================================

const ordersOverlay =
    document.getElementById("ordersOverlay");

const closeOrders =
    document.getElementById("closeOrders");

const ordersMenuBtn =
    document.getElementById("ordersMenuBtn");

const ordersContent =
    document.getElementById("ordersContent");


// Open My Orders
if (ordersMenuBtn) {

    ordersMenuBtn.addEventListener(
        "click",
        async function () {

            closeAccountPanel();

            ordersOverlay.classList.add("show");

            await loadCustomerOrders();
        }
    );

}


// Close Orders
if (closeOrders) {

    closeOrders.addEventListener(
        "click",
        function () {

            ordersOverlay.classList.remove("show");

        }
    );

}


// Close when clicking outside
if (ordersOverlay) {

    ordersOverlay.addEventListener(
        "click",
        function (event) {

            if (event.target === ordersOverlay) {

                ordersOverlay.classList.remove("show");

            }

        }
    );

}


// Load Customer Orders
async function loadCustomerOrders() {

    ordersContent.innerHTML = `
        <div class="orders-loading">
            <div class="spinner-border"></div>
            <p>Loading your orders...</p>
        </div>
    `;

    try {

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) {

            ordersContent.innerHTML = `
                <div class="orders-empty">
                    <i class="bi bi-person-lock"></i>
                    <h4>Please login</h4>
                    <p>
                        Login to view your orders.
                    </p>
                </div>
            `;

            return;
        }


        // Get customer's orders
        const { data: orders, error } =
            await supabase
                .from("orders")
                .select(`
                    id,
                    total_amount,
                    status,
                    created_at,
                    order_items (
                        product_name,
                        quantity,
                        price,
                        subtotal
                    )
                `)
                .eq("user_id", user.id)
                .order("created_at", {
                    ascending: false
                });


        if (error) {
            throw error;
        }


        // No orders
        if (!orders || orders.length === 0) {

            ordersContent.innerHTML = `
                <div class="orders-empty">

                    <i class="bi bi-bag-x"></i>

                    <h4>No orders yet</h4>

                    <p>
                        Your completed orders will appear here.
                    </p>

                </div>
            `;

            return;
        }


        // Create order cards
        ordersContent.innerHTML = "";

        orders.forEach(function (order) {

            const orderCard =
                document.createElement("div");

            orderCard.className =
                "order-card";


            const orderDate =
                new Date(order.created_at)
                    .toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    });


            const orderItems =
                order.order_items || [];


            let itemsHTML = "";

            orderItems.forEach(function (item) {

                itemsHTML += `
                    <div class="order-item">

                        <div>
                            <span class="order-item-name">
                                ${item.product_name}
                            </span>

                            <span class="order-item-quantity">
                                × ${item.quantity}
                            </span>
                        </div>

                        <span class="order-item-price">
                            ₹${Number(item.subtotal).toFixed(2)}
                        </span>

                    </div>
                `;

            });


            orderCard.innerHTML = `

                <div class="order-card-header">

                    <div>

                        <div class="order-id">
                            Order #${order.id}
                        </div>

                        <div class="order-date">
                            ${orderDate}
                        </div>

                    </div>

                    <span class="order-status ${order.status}">
                        ${
                            order.status === "new"
                                ? '<i class="bi bi-receipt"></i>'
                                : order.status === "accepted"
                                ? '<i class="bi bi-check-circle"></i>'
                                : order.status === "shipped"
                                ? '<i class="bi bi-truck"></i>'
                                : order.status === "delivered"
                                ? '<i class="bi bi-house-check"></i>'
                                : '<i class="bi bi-x-circle"></i>'
                        }
                        ${order.status}
                    </span>

                </div>
                <div class="customer-order-timeline">

                    <div class="timeline-step" data-status="new">
                        <div class="timeline-dot">
                            <i class="bi bi-receipt"></i>
                        </div>
                        <span>New</span>
                    </div>

                    <div class="timeline-line"></div>

                    <div class="timeline-step" data-status="accepted">
                        <div class="timeline-dot">
                            <i class="bi bi-check2-circle"></i>
                        </div>
                        <span>Accepted</span>
                    </div>

                    <div class="timeline-line"></div>

                    <div class="timeline-step" data-status="shipped">
                        <div class="timeline-dot">
                            <i class="bi bi-truck"></i>
                        </div>
                        <span>Shipped</span>
                    </div>

                    <div class="timeline-line"></div>

                    <div class="timeline-step" data-status="delivered">
                        <div class="timeline-dot">
                            <i class="bi bi-house-check"></i>
                        </div>
                        <span>Delivered</span>
                    </div>

                </div>


                <div class="order-items">

                    ${itemsHTML}

                </div>


                <div class="order-total">

                    <span>Total Amount</span>

                    <strong>
                        ₹${Number(order.total_amount).toFixed(2)}
                    </strong>

                </div>

            `;
            const statusOrder = [
                "new",
                "accepted",
                "shipped",
                "delivered"
            ];

            const currentStatus = order.status;

            if (currentStatus !== "cancelled") {
                const currentIndex = statusOrder.indexOf(currentStatus);

                const timelineSteps = orderCard.querySelectorAll(".timeline-step");
                const timelineLines = orderCard.querySelectorAll(".timeline-line");

                timelineSteps.forEach(function (step, index) {

                    if (index < currentIndex) {
                        step.classList.add("completed");
                    }

                    if (index === currentIndex) {
                        step.classList.add("current");
                    }

                });

                timelineLines.forEach(function (line, index) {

                    if (index < currentIndex) {
                        line.classList.add("completed");
                    }

                });
            }


            ordersContent.appendChild(orderCard);

        });


    } catch (error) {

        console.error(
            "Loading customer orders failed:",
            error
        );

        ordersContent.innerHTML = `
            <div class="orders-empty">

                <i class="bi bi-exclamation-circle"></i>

                <h4>Unable to load orders</h4>

                <p>
                    Please try again later.
                </p>

            </div>
        `;

    }

}
// =========================================
// CUSTOMER ADDRESSES
// =========================================

const addressesOverlay =
    document.getElementById("addressesOverlay");

const closeAddresses =
    document.getElementById("closeAddresses");

const addressesMenuBtn =
    document.getElementById("addressesMenuBtn");

const addAddressBtn =
    document.getElementById("addAddressBtn");

const addressList =
    document.getElementById("addressList");


// Open My Addresses
if (addressesMenuBtn) {

    addressesMenuBtn.addEventListener(
        "click",
        async function () {

            closeAccountPanel();

            addressesOverlay.classList.add("show");

            await loadCustomerAddresses();
        }
    );

}


// Close Addresses
if (closeAddresses) {

    closeAddresses.addEventListener(
        "click",
        function () {

            addressesOverlay.classList.remove("show");

        }
    );

}


// Close when clicking outside
if (addressesOverlay) {

    addressesOverlay.addEventListener(
        "click",
        function (event) {

            if (event.target === addressesOverlay) {

                addressesOverlay.classList.remove("show");

            }

        }
    );

}


// Load Addresses
async function loadCustomerAddresses() {

    addressList.innerHTML = `
        <div class="addresses-loading">

            <div class="spinner-border"></div>

            <p>
                Loading your addresses...
            </p>

        </div>
    `;

    try {

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) {

            addressList.innerHTML = `
                <div class="addresses-empty">

                    <i class="bi bi-person-lock"></i>

                    <h4>Please login</h4>

                    <p>
                        Login to manage your addresses.
                    </p>

                </div>
            `;

            return;
        }


        const { data: addresses, error } =
            await supabase
                .from("addresses")
                .select(`
                    id,
                    address_line,
                    village,
                    mandal,
                    district,
                    state,
                    pincode,
                    created_at
                `)
                .eq("user_id", user.id)
                .order("created_at", {
                    ascending: false
                });


        if (error) {
            throw error;
        }


        if (!addresses || addresses.length === 0) {

            addressList.innerHTML = `
                <div class="addresses-empty">

                    <i class="bi bi-geo-alt"></i>

                    <h4>No saved addresses</h4>

                    <p>
                        Add an address for faster checkout.
                    </p>

                </div>
            `;

            return;
        }


        addressList.innerHTML = "";


        addresses.forEach(function (address) {

            const addressCard =
                document.createElement("div");

            addressCard.className =
                "address-card";


            const locationParts = [
                address.village,
                address.mandal,
                address.district,
                address.state
            ].filter(Boolean);


            const locationText =
                locationParts.join(", ");


            addressCard.innerHTML = `

                <div class="address-card-title">

                    <i class="bi bi-geo-alt-fill"></i>

                    <strong>
                        Delivery Address
                    </strong>

                </div>


                <p>
                    ${address.address_line}
                    ${locationText
                        ? `<br>${locationText}`
                        : ""
                    }
                    ${address.pincode
                        ? `<br>PIN: ${address.pincode}`
                        : ""
                    }
                </p>


                <div class="address-actions">

                    <button
                        type="button"
                        class="address-edit-btn"
                        data-id="${address.id}">

                        <i class="bi bi-pencil"></i>
                        Edit

                    </button>


                    <button
                        type="button"
                        class="address-delete-btn"
                        data-id="${address.id}">

                        <i class="bi bi-trash"></i>
                        Delete

                    </button>

                </div>

            `;


            addressList.appendChild(addressCard);

        });
        document.querySelectorAll(".address-edit-btn").forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const addressId =
                            this.dataset.id;

                        editCustomerAddress(addressId);
                    }
                );
            }
        );
        document.querySelectorAll(".address-delete-btn").forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const addressId =
                            this.dataset.id;

                        deleteCustomerAddress(addressId);
                    }
                );
            }
        );


    } catch (error) {

        console.error(
            "Loading customer addresses failed:",
            error
        );

        addressList.innerHTML = `
            <div class="addresses-empty">

                <i class="bi bi-exclamation-circle"></i>

                <h4>Unable to load addresses</h4>

                <p>
                    Please try again later.
                </p>

            </div>
        `;

    }

}
// =========================
// ADD NEW ADDRESS
// =========================

const addressFormOverlay =
    document.getElementById("addressFormOverlay");

const closeAddressForm =
    document.getElementById("closeAddressForm");

const cancelAddressForm =
    document.getElementById("cancelAddressForm");

const saveAddressBtn =
    document.getElementById("saveAddressBtn");

function openAddressForm() {
    if (!addressFormOverlay) return;

    document.getElementById("addressLine").value = "";
    document.getElementById("addressVillage").value = "";
    document.getElementById("addressMandal").value = "";
    document.getElementById("addressDistrict").value = "";
    document.getElementById("addressState").value = "Andhra Pradesh";
    document.getElementById("addressPincode").value = "";

    addressFormOverlay.classList.add("show");
}

function closeAddressFormPanel() {
    if (addressFormOverlay) {
        addressFormOverlay.classList.remove("show");
    }
}

if (addAddressBtn) {
    addAddressBtn.addEventListener(
        "click",
        openAddressForm
    );
}

if (closeAddressForm) {
    closeAddressForm.addEventListener(
        "click",
        closeAddressFormPanel
    );
}

if (cancelAddressForm) {
    cancelAddressForm.addEventListener(
        "click",
        closeAddressFormPanel
    );
}

if (addressFormOverlay) {
    addressFormOverlay.addEventListener(
        "click",
        function (event) {
            if (event.target === addressFormOverlay) {
                closeAddressFormPanel();
            }
        }
    );
}
if (saveAddressBtn) {

    saveAddressBtn.addEventListener(
        "click",
        async function () {

            const addressLine =
                document.getElementById("addressLine")
                    .value.trim();

            const village =
                document.getElementById("addressVillage")
                    .value.trim();

            const mandal =
                document.getElementById("addressMandal")
                    .value.trim();

            const district =
                document.getElementById("addressDistrict")
                    .value.trim();

            const state =
                document.getElementById("addressState")
                    .value.trim();

            const pincode =
                document.getElementById("addressPincode")
                    .value.trim();

            if (!addressLine) {
                showNotification(
                    "Please enter your address.",
                    "warning"
                );
                return;
            }

            if (pincode && !/^\d{6}$/.test(pincode)) {
                showNotification(
                    "Please enter a valid 6-digit pincode.",
                    "warning"
                );
                return;
            }

            try {

                const {
                    data: { user }
                } = await supabase.auth.getUser();

                if (!user) {
                    showNotification(
                        "Please login first.",
                        "warning"
                    );
                    return;
                }

                saveAddressBtn.disabled = true;

                const editId =
                    saveAddressBtn.dataset.editId;

                if (editId) {

                    // =========================
                    // UPDATE ADDRESS
                    // =========================

                    saveAddressBtn.innerHTML = `
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Updating...
                    `;

                    const { error } =
                        await supabase
                            .from("addresses")
                            .update({
                                address_line: addressLine,
                                village: village,
                                mandal: mandal,
                                district: district,
                                state: state,
                                pincode: pincode
                            })
                            .eq("id", editId)
                            .eq("user_id", user.id);

                    if (error) {
                        throw error;
                    }

                    showNotification(
                        "Address updated successfully!",
                        "success"
                    );

                } else {

                    // =========================
                    // SAVE NEW ADDRESS
                    // =========================

                    saveAddressBtn.innerHTML = `
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                    `;

                    const { error } =
                        await supabase
                            .from("addresses")
                            .insert({
                                user_id: user.id,
                                address_line: addressLine,
                                village: village,
                                mandal: mandal,
                                district: district,
                                state: state,
                                pincode: pincode
                            });

                    if (error) {
                        throw error;
                    }

                    showNotification(
                        "Address saved successfully!",
                        "success"
                    );
                }

                // =========================
                // REFRESH ADDRESS DATA
                // =========================

                delete saveAddressBtn.dataset.editId;

                closeAddressFormPanel();

                await loadCustomerAddresses();

                await loadCheckoutAddresses();

                // Return to checkout if it was opened
                if (checkoutOverlay) {
                    checkoutOverlay.classList.add("show");
                }

                if (checkoutPanel) {
                    checkoutPanel.classList.add("show");
                }

            } catch (error) {

                console.error(
                    "Address save/update failed:",
                    error
                );

                showNotification(
                    "Failed to save address. Please try again.",
                    "error"
                );

            } finally {

                saveAddressBtn.disabled = false;

                saveAddressBtn.innerHTML = `
                    <i class="bi bi-check2"></i>
                    Save Address
                `;
            }
        }
    );
}
async function editCustomerAddress(addressId) {

    try {

        const { data: address, error } =
            await supabase
                .from("addresses")
                .select(`
                    id,
                    address_line,
                    village,
                    mandal,
                    district,
                    state,
                    pincode
                `)
                .eq("id", addressId)
                .single();

        if (error) {
            throw error;
        }

        document.getElementById("addressLine").value =
            address.address_line || "";

        document.getElementById("addressVillage").value =
            address.village || "";

        document.getElementById("addressMandal").value =
            address.mandal || "";

        document.getElementById("addressDistrict").value =
            address.district || "";

        document.getElementById("addressState").value =
            address.state || "Andhra Pradesh";

        document.getElementById("addressPincode").value =
            address.pincode || "";

        addressFormOverlay.classList.add("show");

        saveAddressBtn.dataset.editId = addressId;

        saveAddressBtn.innerHTML = `
            <i class="bi bi-check2"></i>
            Update Address
        `;

    } catch (error) {

        console.error(
            "Loading address for edit failed:",
            error
        );

        showNotification(
            "Unable to load this address.",
            "error"
        );
    }
}
// =========================
// DELETE ADDRESS
// =========================

async function deleteCustomerAddress(addressId) {

    const deleteOverlay =
        document.createElement("div");

    deleteOverlay.className =
        "address-delete-overlay";

    deleteOverlay.innerHTML = `
        <div class="address-delete-modal">

            <div class="address-delete-icon">
                <i class="bi bi-trash3"></i>
            </div>

            <h3>Delete Address?</h3>

            <p>
                Are you sure you want to delete this
                saved address?
            </p>

            <div class="address-delete-actions">

                <button
                    type="button"
                    class="address-delete-cancel"
                    id="cancelDeleteAddress"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    class="address-delete-confirm"
                    id="confirmDeleteAddress"
                >
                    <i class="bi bi-trash3"></i>
                    Delete
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(deleteOverlay);

    setTimeout(function () {
        deleteOverlay.classList.add("show");
    }, 10);

    const cancelButton =
        deleteOverlay.querySelector(
            "#cancelDeleteAddress"
        );

    const confirmButton =
        deleteOverlay.querySelector(
            "#confirmDeleteAddress"
        );

    function closeDeletePopup() {

        deleteOverlay.classList.remove("show");

        setTimeout(function () {
            deleteOverlay.remove();
        }, 300);
    }

    cancelButton.addEventListener(
        "click",
        closeDeletePopup
    );

    deleteOverlay.addEventListener(
        "click",
        function (event) {

            if (event.target === deleteOverlay) {
                closeDeletePopup();
            }

        }
    );

    confirmButton.addEventListener(
        "click",
        async function () {

            try {

                const {
                    data: { user }
                } = await supabase.auth.getUser();

                if (!user) {

                    closeDeletePopup();

                    showNotification(
                        "Please login first.",
                        "warning"
                    );

                    return;
                }

                confirmButton.disabled = true;

                confirmButton.innerHTML = `
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Deleting...
                `;

                const { error } =
                    await supabase
                        .from("addresses")
                        .delete()
                        .eq("id", addressId)
                        .eq("user_id", user.id);

                if (error) {
                    throw error;
                }

                closeDeletePopup();

                showNotification(
                    "Address deleted successfully!",
                    "success"
                );

                await loadCustomerAddresses();

            } catch (error) {

                console.error(
                    "Deleting address failed:",
                    error
                );

                confirmButton.disabled = false;

                confirmButton.innerHTML = `
                    <i class="bi bi-trash3"></i>
                    Delete
                `;

                showNotification(
                    "Failed to delete address. Please try again.",
                    "error"
                );
            }
        }
    );
}
// =========================
// CHECKOUT SAVED ADDRESSES
// =========================

const checkoutSavedAddresses =
    document.getElementById("checkoutSavedAddresses");

const checkoutAddAddressBtn =
    document.getElementById("checkoutAddAddressBtn");
    let selectedCheckoutAddressId = null;

async function loadCheckoutAddresses() {

    if (!checkoutSavedAddresses) return;

    checkoutSavedAddresses.innerHTML = `
        <div class="checkout-address-loading">
            <div class="spinner-border spinner-border-sm"></div>
            <span>Loading saved addresses...</span>
        </div>
    `;

    try {

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) {

            checkoutSavedAddresses.innerHTML = `
                <div class="checkout-address-loading">
                    <i class="bi bi-person-lock"></i>
                    <span>Please login to use saved addresses.</span>
                </div>
            `;

            return;
        }

        const { data: addresses, error } =
            await supabase
                .from("addresses")
                .select(`
                    id,
                    address_line,
                    village,
                    mandal,
                    district,
                    state,
                    pincode
                `)
                .eq("user_id", user.id)
                .order("created_at", {
                    ascending: false
                });

        if (error) {
            throw error;
        }

        if (!addresses || addresses.length === 0) {

            checkoutSavedAddresses.innerHTML = `
                <div class="checkout-address-loading">
                    <i class="bi bi-geo-alt"></i>
                    <span>No saved addresses yet.</span>
                </div>
            `;

            return;
        }

        checkoutSavedAddresses.innerHTML = "";

        addresses.forEach(function (address, index) {

            const addressCard =
                document.createElement("div");

            addressCard.className =
                "checkout-saved-address";

            addressCard.dataset.id =
                address.id;

            const locationParts = [
                address.village,
                address.mandal,
                address.district,
                address.state
            ].filter(Boolean);

            const locationText =
                locationParts.join(", ");

            addressCard.innerHTML = `
                <div class="checkout-address-title">
                    <i class="bi bi-geo-alt-fill"></i>
                    <span>Delivery Address</span>
                </div>

                <div class="checkout-address-text">
                    ${address.address_line || ""}
                    ${locationText
                        ? `<br>${locationText}`
                        : ""}
                    ${address.pincode
                        ? `<br>PIN: ${address.pincode}`
                        : ""}
                </div>

                <div class="checkout-address-radio"></div>
            `;

            addressCard.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".checkout-saved-address"
                        )
                        .forEach(function (card) {
                            card.classList.remove(
                                "selected"
                            );
                        });

                    addressCard.classList.add(
                        "selected"
                    );
                    selectedCheckoutAddressId =
                        address.id;

                    document.getElementById(
                        "customerAddress"
                    ).value =
                        address.address_line || "";

                    document.getElementById(
                        "customerVillage"
                    ).value =
                        address.village || "";

                    document.getElementById(
                        "customerMandal"
                    ).value =
                        address.mandal || "";

                    document.getElementById(
                        "customerDistrict"
                    ).value =
                        address.district || "";

                    document.getElementById(
                        "customerPincode"
                    ).value =
                        address.pincode || "";
                }
            );

            checkoutSavedAddresses.appendChild(
                addressCard
            );

            // Select the newest address automatically
            if (index === 0) {
                addressCard.click();
            }
        });

    } catch (error) {

        console.error(
            "Loading checkout addresses failed:",
            error
        );

        checkoutSavedAddresses.innerHTML = `
            <div class="checkout-address-loading">
                <i class="bi bi-exclamation-circle"></i>
                <span>Unable to load saved addresses.</span>
            </div>
        `;
    }
}
if (checkoutAddAddressBtn) {

    checkoutAddAddressBtn.addEventListener(
        "click",
        function () {

            // Close checkout temporarily
            if (checkoutOverlay) {
                checkoutOverlay.classList.remove("show");
            }

            if (checkoutPanel) {
                checkoutPanel.classList.remove("show");
            }

            // Clear edit mode
            if (saveAddressBtn) {
                delete saveAddressBtn.dataset.editId;

                saveAddressBtn.innerHTML = `
                    <i class="bi bi-check2"></i>
                    Save Address
                `;
            }

            // Open address form
            openAddressForm();
        }
    );
}
updateCustomerLoginUI();

supabase.auth.onAuthStateChange(function (event) {

    updateCustomerLoginUI();
});
// =========================================
// FOOTER LINKS
// =========================================

const footerAccountLink =
    document.getElementById("footerAccountLink");

const footerOrdersLink =
    document.getElementById("footerOrdersLink");

const footerAddressLink =
    document.getElementById("footerAddressLink");

const footerCartLink =
    document.getElementById("footerCartLink");


// My Account
if (footerAccountLink) {

    footerAccountLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            if (loginBtn) {
                loginBtn.click();
            }

        }
    );

}


// My Orders
if (footerOrdersLink) {

    footerOrdersLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            const ordersMenuBtn =
                document.getElementById("ordersMenuBtn");

            if (ordersMenuBtn) {
                ordersMenuBtn.click();
            }

        }
    );

}


// My Addresses
if (footerAddressLink) {

    footerAddressLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            const addressesMenuBtn =
                document.getElementById("addressesMenuBtn");

            if (addressesMenuBtn) {
                addressesMenuBtn.click();
            }

        }
    );

}


// My Cart
if (footerCartLink) {

    footerCartLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            openCart();

        }
    );

}
// =========================================
// STORE SETTINGS
// =========================================

async function loadStoreSettings() {

    try {

        const { data, error } = await supabase
            .from("store_settings")
            .select("*")
            .limit(1)
            .single();

        if (error) throw error;

        if (!data) return;
        const checkoutUpiId =
            document.getElementById("checkoutUpiId");

        const checkoutUpiQr =
            document.getElementById("checkoutUpiQr");

        if (checkoutUpiId) {
            checkoutUpiId.textContent =
                data.upi_id || "UPI ID unavailable";
        }

        if (checkoutUpiQr) {

            if (data.upi_qr_url) {
                checkoutUpiQr.src =
                    data.upi_qr_url;

                checkoutUpiQr.style.display =
                    "block";
            } else {
                checkoutUpiQr.style.display =
                    "none";
            }

        }

        const storeName =
            document.getElementById("footerStoreName");

        const storeAddress =
            document.getElementById("footerStoreAddress");

        const storePhone =
            document.getElementById("footerStorePhone");

        const storeEmail =
            document.getElementById("footerStoreEmail");

        const storeHours =
            document.getElementById("footerStoreHours");


        if (storeName) {
            storeName.textContent =
                data.store_name || "Our Store";
        }

        if (storeAddress) {
            storeAddress.textContent =
                data.address || "";
        }

        if (storePhone) {
            storePhone.textContent =
                data.phone || "";
        }

        if (storeEmail) {
            storeEmail.textContent =
                data.email || "";
        }

        if (storeHours) {
            storeHours.textContent =
                data.opening_hours || "";
        }

    } catch (error) {

        console.error(
            "Loading store settings failed:",
            error
        );

    }

}


// Load store settings
loadStoreSettings();


const copyUpiBtn =
    document.getElementById("copyUpiBtn");

if (copyUpiBtn) {

    copyUpiBtn.addEventListener(
        "click",
        async function () {

            const upiId =
                document.getElementById(
                    "checkoutUpiId"
                ).textContent.trim();

            if (
                !upiId ||
                upiId === "UPI ID unavailable"
            ) {
                showNotification(
                    "UPI ID is unavailable.",
                    "warning"
                );
                return;
            }

            try {

                await navigator.clipboard.writeText(
                    upiId
                );

                showNotification(
                    "UPI ID copied!",
                    "success"
                );

            } catch (error) {

                showNotification(
                    "Unable to copy UPI ID.",
                    "error"
                );

            }

        }
    );

}
const upiPaidBtn = document.getElementById("upiPaidBtn");


if (upiPaidBtn && placeOrderBtn) {

    upiPaidBtn.addEventListener("click", function () {

        upiPaidBtn.classList.add("paid");

        upiPaidBtn.innerHTML = `
            <i class="bi bi-check-circle-fill"></i>
            Payment Marked
        `;

        placeOrderBtn.disabled = false;

        placeOrderBtn.innerHTML = `
            <i class="bi bi-check2-circle"></i>
            Pay & Place Order
        `;

        showNotification(
            "Payment marked successfully. You can now place your order.",
            "success"
        );
    });

}
