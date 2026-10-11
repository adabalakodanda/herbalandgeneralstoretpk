// ================= ADMIN DASHBOARD =================
import { supabase } from "./admin-supabase-config.js";

// ================= ADMIN NOTIFICATION SYSTEM =================

function showNotification(message, type = "info") {

    const existing =
        document.querySelector(".admin-notification");

    if (existing) {
        existing.remove();
    }

    const notification =
        document.createElement("div");

    notification.className =
        `admin-notification ${type}`;

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

        <button type="button" class="admin-notification-close">
            &times;
        </button>
    `;

    document.body.appendChild(notification);

    setTimeout(function () {
        notification.classList.add("show");
    }, 10);

    const closeButton =
        notification.querySelector(
            ".admin-notification-close"
        );

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
// ================= CATEGORY MODAL =================

const addCategoryBtn =
    document.getElementById("addCategoryBtn");

const categoryModal =
    document.getElementById("categoryModal");

const closeCategoryModal =
    document.getElementById("closeCategoryModal");

const cancelCategoryBtn =
    document.getElementById("cancelCategoryBtn");


// Open modal

addCategoryBtn.addEventListener("click", function () {

    categoryModal.classList.add("show");

});


// Close modal

closeCategoryModal.addEventListener("click", function () {

    categoryModal.classList.remove("show");

});


// Cancel

cancelCategoryBtn.addEventListener("click", function () {

    categoryModal.classList.remove("show");

});


// ================= ADD / UPDATE CATEGORY =================

const categoryForm =
    document.getElementById("categoryForm");

categoryForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const categoryName =
        document.getElementById("categoryName").value.trim();

    const categoryIcon =
        document.getElementById("categoryIcon").value.trim();

    const categoryStatus =
        document.getElementById("categoryStatus").value;


    if (!categoryName) {

        showNotification(
            "Please enter a category name.",
            "warning"
        );
        return;
    }


    // Check whether we are editing

    const editId =
        categoryForm.dataset.editId;


    try {

        const categoryData = {

            name:
                categoryName,

            icon:
                categoryIcon || "bi-grid",

            status:
                categoryStatus

        };


        // ================= UPDATE =================

        if (editId) {

            const { error } =
                await supabase
                    .from("categories")
                    .update(categoryData)
                    .eq("id", editId);

            if (error) {
                throw error;
            }

            showNotification(
                "Category updated successfully!",
                "success"
            );
        }


        // ================= ADD =================

        else {

            const { error } =
                await supabase
                    .from("categories")
                    .insert(categoryData);

            if (error) {
                throw error;
            }

            showNotification(
                "Category added successfully!",
                "success"
            );

        }


        // Reset form

        categoryForm.reset();

        delete categoryForm.dataset.editId;


        // Change button back to Add Category

        document.getElementById("categorySubmitBtn").innerHTML = `
            <i class="bi bi-check-lg"></i>
            Add Category
        `;


        // Close modal

        categoryModal.classList.remove("show");


        // Refresh categories

        loadCategories();


    } catch (error) {

        console.error(
            "Category save error:",
            error
        );

        showNotification(
            "Failed to save category: " + error.message,
            "error"
        );

    }

});
// ================= LOAD CATEGORIES =================

async function loadCategories() {

    const categoryTableBody =
        document.getElementById("categoryTableBody");

    categoryTableBody.innerHTML = "";

    try {

        const { data: categories, error } =
            await supabase
                .from("categories")
                .select(`
                    id,
                    name,
                    icon,
                    status,
                    created_at,
                    products (
                        id
                    )
                `)
                .order("created_at", {
                    ascending: false
                });

        if (error) {
            throw error;
        }


        // Update category count

        document.getElementById("categoryCount").textContent =
            categories ? categories.length : 0;


        if (!categories || categories.length === 0) {

            categoryTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-message">
                        No categories added yet.
                    </td>
                </tr>
            `;

            return;
        }


        categories.forEach(function (category, index) {

            const productCount =
                category.products
                    ? category.products.length
                    : 0;


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    <i class="bi ${category.icon || "bi-grid"}"></i>
                    ${category.name}
                </td>

                <td>
                    ${productCount}
                </td>

                <td>
                    <span class="status-badge">
                        ${category.status}
                    </span>
                </td>

                <td>

                    <button
                        class="edit-category"
                        data-id="${category.id}">
                        <i class="bi bi-pencil"></i>
                    </button>

                    <button
                        class="delete-category"
                        data-id="${category.id}">
                        <i class="bi bi-trash"></i>
                    </button>

                </td>

            `;

            categoryTableBody.appendChild(row);

        });


    } catch (error) {

        console.error(
            "Loading categories failed:",
            error
        );

        categoryTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">
                    Failed to load categories.
                </td>
            </tr>
        `;

    }

}
// ================= EDIT CATEGORY =================

document
    .getElementById("categoryTableBody")
    .addEventListener("click", async function (event) {

        const editButton =
            event.target.closest(".edit-category");

        if (!editButton) {
            return;
        }

        const categoryId =
            editButton.dataset.id;

        try {

            const { data: category, error } =
                await supabase
                    .from("categories")
                    .select("*")
                    .eq("id", categoryId)
                    .single();

            if (error) {
                throw error;
            }


            // Store category ID for update

            categoryForm.dataset.editId =
                category.id;


            // Fill existing values

            document.getElementById("categoryName").value =
                category.name || "";

            document.getElementById("categoryIcon").value =
                category.icon || "";

            document.getElementById("categoryStatus").value =
                category.status || "active";


            // Change button text

            const categorySubmitBtn =
                document.getElementById("categorySubmitBtn");

            categorySubmitBtn.innerHTML = `
                <i class="bi bi-check-lg"></i>
                Save Changes
            `;


            // Open modal

            categoryModal.classList.add("show");

        } catch (error) {

            console.error(
                "Edit category error:",
                error
            );

            showNotification(
                "Failed to load category: " + error.message,
                "error"
            );

        }

    });

// ================= LOAD PRODUCT CATEGORIES =================

async function loadProductCategories() {

    const productCategory =
        document.getElementById("productCategory");

    productCategory.innerHTML = `
        <option value="">
            Select Category
        </option>
    `;

    try {

        const { data: categories, error } =
            await supabase
                .from("categories")
                .select("id, name")
                .eq("status", "active")
                .order("name");

        if (error) {
            throw error;
        }

        categories.forEach(function (category) {

            const option =
                document.createElement("option");

            option.value = category.id;
            option.textContent = category.name;

            productCategory.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Loading product categories failed:",
            error
        );

    }
}


// ================= DELETE CATEGORY =================

// ================= DELETE CATEGORY =================

document
    .getElementById("categoryTableBody")
    .addEventListener("click", function (event) {

        const deleteButton =
            event.target.closest(".delete-category");

        if (!deleteButton) {
            return;
        }

        const categoryId =
            deleteButton.dataset.id;

        openConfirmModal(
            "Delete Category?",
            "Are you sure you want to delete this category?",

            async function () {

                const { error } =
                    await supabase
                        .from("categories")
                        .delete()
                        .eq("id", categoryId);

                if (error) {
                    throw error;
                }

                showNotification(
                    "Category deleted successfully!",
                    "success"
                );

                await loadCategories();
            }
        );
    });
        // ================= PRODUCT IMAGE PREVIEW =================

    const productImageFile =
        document.getElementById("productImageFile");

    const productImagePreview =
        document.getElementById("productImagePreview");

    productImageFile.addEventListener("change", function () {

        const file =
            productImageFile.files[0];

        productImagePreview.innerHTML = "";

        if (!file) {
            return;
        }

        // Check image type
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {

            showNotification(
                "Please select a JPG, PNG, or WebP image.",
                "warning"
            );

            productImageFile.value = "";
            return;
        }

        // Maximum file size: 5 MB
        const maxSize =
            5 * 1024 * 1024;

        if (file.size > maxSize) {

            showNotification(
                "Image size must be less than 5 MB.",
                "warning"
            );

            productImageFile.value = "";
            return;
        }

        // Preview image
        const image =
            document.createElement("img");

        image.src =
            URL.createObjectURL(file);

        image.alt =
            "Product Preview";

        productImagePreview.appendChild(image);

    });
    // ================= PRODUCT MODAL =================

    const productModal =
        document.getElementById("productModal");
        console.log("Product Modal:", productModal);

    const addProductBtn =
        document.getElementById("addProductBtn");

    const closeProductModal =
        document.getElementById("closeProductModal");

    const cancelProductBtn =
        document.getElementById("cancelProductBtn");

// ================= UPLOAD PRODUCT IMAGE =================

async function uploadProductImage(file) {

    if (!file) {
        return null;
    }

    const fileExtension =
        file.name.split(".").pop().toLowerCase();

    const fileName =
        `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

    const filePath =
        fileName;


    const { error: uploadError } =
        await supabase
            .storage
            .from("product-images")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false
            });


    if (uploadError) {
        throw uploadError;
    }


    const { data: publicUrlData } =
        supabase
            .storage
            .from("product-images")
            .getPublicUrl(filePath);


    return publicUrlData.publicUrl;
}

        // ================= ADD / UPDATE PRODUCT =================

        const productForm =
            document.getElementById("productForm");

        productForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const productName =
                document.getElementById("productName").value.trim();

            const productCategory =
                document.getElementById("productCategory").value;

            const productDescription =
                document.getElementById("productDescription").value.trim();

            const productPrice =
                document.getElementById("productPrice").value;

            const imageFile =
                document.getElementById("productImageFile").files[0];

            const productStock =
                document.getElementById("productStock").value;

            const productStatus =
                document.getElementById("productStatus").value;


            // Check whether we are editing
            const editId =
                productForm.dataset.editId;


            try {
                let imageUrl =
                    productForm.dataset.editImageUrl || null;

                if (imageFile) {

                    imageUrl =
                        await uploadProductImage(imageFile);

                }

                const productData = {

                    name:
                        productName || null,

                    category_id:
                        productCategory
                            ? Number(productCategory)
                            : null,

                    description:
                        productDescription || null,

                    price:
                        productPrice
                            ? Number(productPrice)
                            : null,

                    image_url:
                        imageUrl,

                    stock:
                        productStock
                            ? Number(productStock)
                            : 0,

                    status:
                        productStatus

                };


                // ================= UPDATE =================

                if (editId) {

                    const { error } =
                        await supabase
                            .from("products")
                            .update(productData)
                            .eq("id", editId);

                    if (error) {
                        throw error;
                    }

                    showNotification(
                        "Product updated successfully!",
                        "success"
                    );

                }


                // ================= ADD =================

                else {

                    const { error } =
                        await supabase
                            .from("products")
                            .insert(productData);

                    if (error) {
                        throw error;
                    }

                    showNotification(
                        "Product added successfully!",
                        "success"
                    );

                }


                // Reset form

                productForm.reset();

                delete productForm.dataset.editId;
                delete productForm.dataset.editImageUrl;

                document.getElementById("productImagePreview").innerHTML = "";

                document.getElementById("productSubmitBtn").textContent =
                    "Add Product";
                document.getElementById("productModalTitle").textContent =
                    "Add Product";

                document.getElementById("productModalSubtitle").textContent =
                    "Add a new product to your store";

                productModal.classList.remove("show");


                // Reload products

                loadProducts();


            } catch (error) {

                console.error(
                    "Product save error:",
                    error
                );

                showNotification(
                    "Failed to save product: " + error.message,
                    "error"
                );

            }

        });        
    // Open Product Modal

    if (addProductBtn) {

        addProductBtn.addEventListener("click", function () {

            // Reset form
            productForm.reset();
            loadProductCategories();

            // Clear edit information
            delete productForm.dataset.editId;
            delete productForm.dataset.editImageUrl;

            // Clear image preview
            document.getElementById("productImagePreview").innerHTML = "";

            // Reset modal title
            document.getElementById("productModalTitle").textContent =
                "Add Product";

            document.getElementById("productModalSubtitle").textContent =
                "Add a new product to your store";

            // Reset button
            document.getElementById("productSubmitBtn").innerHTML =
                `
                <i class="bi bi-check-lg"></i>
                Add Product
                `;

            // Open modal
            productModal.classList.add("show");

        });

    }


    // Close Product Modal

    if (closeProductModal) {

        closeProductModal.addEventListener("click", function () {

            productModal.classList.remove("show");

        });

    }


    // Cancel Product

    if (cancelProductBtn) {

        cancelProductBtn.addEventListener("click", function () {

            productModal.classList.remove("show");

        });

    }

    // ================= CONFIRMATION MODAL =================

    const confirmModal =
        document.getElementById("confirmModal");

    const cancelConfirmModal =
        document.getElementById("cancelConfirmModal");

    const confirmActionBtn =
        document.getElementById("confirmActionBtn");

    const confirmModalTitle =
        document.getElementById("confirmModalTitle");

    const confirmModalMessage =
        document.getElementById("confirmModalMessage");

    let pendingConfirmAction = null;


    function openConfirmModal(title, message, action) {

        confirmModalTitle.textContent = title;

        confirmModalMessage.textContent = message;

        pendingConfirmAction = action;

        confirmActionBtn.disabled = false;

        confirmActionBtn.innerHTML =
            `<i class="bi bi-trash3"></i> Delete`;

        confirmModal.classList.add("show");
    }


    function closeConfirmModal() {

        confirmModal.classList.remove("show");

        pendingConfirmAction = null;
    }


    cancelConfirmModal.addEventListener(
        "click",
        closeConfirmModal
    );


    confirmModal.addEventListener(
        "click",
        function (event) {

            if (event.target === confirmModal) {
                closeConfirmModal();
            }

        }
    );


    confirmActionBtn.addEventListener(
        "click",
        async function () {

            if (!pendingConfirmAction) {
                return;
            }

            confirmActionBtn.disabled = true;

            confirmActionBtn.innerHTML =
                `<span class="spinner-border spinner-border-sm"></span> Deleting...`;

            try {

                await pendingConfirmAction();

                closeConfirmModal();

            } catch (error) {

                console.error(
                    "Confirmation action failed:",
                    error
                );

                confirmActionBtn.disabled = false;

                confirmActionBtn.innerHTML =
                    `<i class="bi bi-trash3"></i> Delete`;

                showNotification(
                    "Delete failed: " + error.message,
                    "error"
                );

            }

        }
    );

    // ================= LOAD PRODUCTS =================

        async function loadProducts() {

            const productTableBody =
                document.getElementById("productTableBody");

            productTableBody.innerHTML = "";

            try {

                const { data: products, error } =
                    await supabase
                        .from("products")
                        .select(`
                            id,
                            name,
                            price,
                            stock,
                            status,
                            categories (
                                name
                            )
                        `)
                        .order("created_at", {
                            ascending: false
                        });

                if (error) {
                    throw error;
                }
                document.getElementById("productCount").textContent =
                    products ? products.length : 0;

                if (!products || products.length === 0) {

                    productTableBody.innerHTML = `
                        <tr>
                            <td colspan="6" class="empty-message">
                                No products added yet.
                            </td>
                        </tr>
                    `;

                    return;
                }
                
                products.forEach(function (product, index) {

                    const row =
                        document.createElement("tr");

                    row.innerHTML = `
                        <td>${index + 1}</td>

                        <td>
                            ${product.name || "Unnamed Product"}
                        </td>

                        <td>
                            ${product.categories
                                ? product.categories.name
                                : "No Category"}
                        </td>

                        <td>
                            ₹${product.price ?? "—"}
                        </td>

                        <td>
                            ${product.stock ?? 0}
                        </td>

                        <td>
                            <span class="status-badge">
                                ${product.status}
                            </span>
                        </td>

                        <td>
                            <button
                                class="edit-product"
                                data-id="${product.id}">
                                <i class="bi bi-pencil"></i>
                            </button>

                            <button
                                class="delete-product"
                                data-id="${product.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    `;

                    productTableBody.appendChild(row);

                });


            } catch (error) {

                console.error(
                    "Loading products failed:",
                    error
                );

                productTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="empty-message">
                            Failed to load products.
                        </td>
                    </tr>
                `;

            }
        }

        // ================= EDIT PRODUCT =================

    // ================= PRODUCT TABLE ACTIONS =================

document
    .getElementById("productTableBody")
    .addEventListener("click", async function (event) {

        // EDIT
        const editButton =
            event.target.closest(".edit-product");

        if (editButton) {

            const productId =
                editButton.dataset.id;

            try {

                const { data: product, error } =
                    await supabase
                        .from("products")
                        .select("*")
                        .eq("id", productId)
                        .single();

                if (error) {
                    throw error;
                }

                productForm.dataset.editId = product.id;
                productForm.dataset.editImageUrl =
                    product.image_url || "";

                document.getElementById("productName").value =
                    product.name || "";

                document.getElementById("productCategory").value =
                    product.category_id || "";

                document.getElementById("productDescription").value =
                    product.description || "";

                document.getElementById("productPrice").value =
                    product.price ?? "";

                document.getElementById("productStock").value =
                    product.stock ?? "";

                document.getElementById("productStatus").value =
                    product.status || "available";

                document.getElementById("productImageFile").value = "";

                const preview =
                    document.getElementById("productImagePreview");

                preview.innerHTML = "";

                if (product.image_url) {

                    const image =
                        document.createElement("img");

                    image.src = product.image_url;
                    image.alt = product.name || "Product Image";

                    preview.appendChild(image);
                }

                document.getElementById("productModalTitle").textContent =
                    "Edit Product";

                document.getElementById("productModalSubtitle").textContent =
                    "Update product information";

                document.getElementById("productSubmitBtn").innerHTML =
                    `<i class="bi bi-check-lg"></i> Save Changes`;

                productModal.classList.add("show");

            } catch (error) {

                console.error("Edit product error:", error);

                showNotification(
                    "Failed to load product: " + error.message,
                    "error"
                );
            }

            return;
        }


        // DELETE
        const deleteButton =
            event.target.closest(".delete-product");

        if (deleteButton) {

            const productId =
                deleteButton.dataset.id;

            openConfirmModal(
                "Delete Product?",
                "Are you sure you want to delete this product?",

                async function () {

                    const { error } =
                        await supabase
                            .from("products")
                            .delete()
                            .eq("id", productId);

                    if (error) {
                        throw error;
                    }

                    showNotification(
                        "Product deleted successfully!",
                        "success"
                    );

                    await loadProducts();
                }
            );

            return;
        }

    });
        

// ================= LOGOUT =================


// ================= ADMIN ORDERS =================

async function loadAdminOrders() {

    const ordersTableBody =
        document.getElementById("ordersTableBody");

    if (!ordersTableBody) return;

    ordersTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-message">
                Loading orders...
            </td>
        </tr>
    `;

    try {

        const { data: orders, error } =
            await supabase
                .from("orders")
                .select(`
                    id,
                    user_id,
                    total_amount,
                    status,
                    created_at
                `)
                .order("created_at", {
                    ascending: false
                });
        document.getElementById("orderCount").textContent =
            orders ? orders.length : 0;

if (error) {
    console.error("ADMIN ORDERS ERROR:", error);
    throw error;
}
// Load customer profiles separately
const userIds = [
    ...new Set(
        (orders || [])
            .map(order => order.user_id)
            .filter(Boolean)
    )
];

let profilesMap = {};

if (userIds.length > 0) {

    const { data: profiles, error: profilesError } =
        await supabase
            .from("profiles")
            .select("id, full_name, phone")
            .in("id", userIds);

    if (profilesError) {
        console.error(
            "Loading customer profiles failed:",
            profilesError
        );
    } else {

        (profiles || []).forEach(function (profile) {

            profilesMap[profile.id] = profile;

        });

    }
}

        if (error) {
            throw error;
        }

        if (!orders || orders.length === 0) {

            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-message">
                        No orders yet.
                    </td>
                </tr>
            `;

            return;
        }

        ordersTableBody.innerHTML = "";

        orders.forEach(function (order, index) {

            const row = document.createElement("tr");

            const customerProfile =
                profilesMap[order.user_id];

            const customerName =
                customerProfile?.full_name || "Unknown Customer";

            const customerPhone =
                customerProfile?.phone || "—";

            const orderDate =
                new Date(order.created_at)
                    .toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    });

            row.innerHTML = `
                <td>${index + 1}</td>

                <td>
                    #${order.id}
                </td>

                <td>
                    <strong>${customerName}</strong>
                    <br>
                    <small>${customerPhone}</small>
                </td>

                <td>
                    ₹${Number(order.total_amount).toFixed(2)}
                </td>

                <!-- STATUS -->
                <td>
                    <select
                        class="order-status-select"
                        data-id="${order.id}"
                        data-previous-status="${order.status}">

                        <option value="new"
                            ${order.status === "new" ? "selected" : ""}>
                            New
                        </option>

                        <option value="accepted"
                            ${order.status === "accepted" ? "selected" : ""}>
                            Accepted
                        </option>

                        <option value="shipped"
                            ${order.status === "shipped" ? "selected" : ""}>
                            Shipped
                        </option>

                        <option value="delivered"
                            ${order.status === "delivered" ? "selected" : ""}>
                            Delivered
                        </option>

                        <option value="cancelled"
                            ${order.status === "cancelled" ? "selected" : ""}>
                            Cancelled
                        </option>

                    </select>
                </td>

                <!-- DATE -->
                <td>
                    ${orderDate}
                </td>

                <!-- ACTIONS -->
                <td>
                    <button
                        type="button"
                        class="order-view-btn"
                        data-id="${order.id}">
                        <i class="bi bi-eye"></i>
                        View
                    </button>
                </td>
            `;
            ordersTableBody.appendChild(row);
        });

    } catch (error) {

        console.error(
            "Loading admin orders failed:",
            error
        );

        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    Failed to load orders.
                </td>
            </tr>
        `;
    }
}


// ================= UPDATE ORDER STATUS =================

document.addEventListener("change", async function (event) {

    if (!event.target.classList.contains("order-status-select")) {
        return;
    }

    const select = event.target;

    const orderId = select.dataset.id;
    const newStatus = select.value;
    const previousStatus =
        select.dataset.previousStatus || "new";

    const allowedTransitions = {
        new: ["accepted", "cancelled"],
        accepted: ["shipped", "cancelled"],
        shipped: ["delivered", "cancelled"],
        delivered: [],
        cancelled: []
    };

    if (
        !allowedTransitions[previousStatus]
            .includes(newStatus)
    ) {
        showNotification(
            `Cannot change order from ${previousStatus} to ${newStatus}.`,
            "warning"
        );

        select.value = previousStatus;

        return;
    }

    try {

        const { error } =
            await supabase
                .from("orders")
                .update({
                    status: newStatus
                })
                .eq("id", orderId);

        if (error) {
            throw error;
        }
        select.dataset.previousStatus = newStatus;

        showNotification(
            `Order #${orderId} status updated to ${newStatus}.`,
            "success"
        );

await loadSalesSummary();

    } catch (error) {

        console.error(
            "Order status update failed:",
            error
        );

        showNotification(
            "Failed to update order status.",
            "error"
        );

        loadAdminOrders();
    }

});


// Load orders when admin dashboard opens
// ================================
// ORDER DETAILS MODAL
// ================================

const orderDetailsOverlay =
    document.getElementById("orderDetailsOverlay");

const closeOrderDetails =
    document.getElementById("closeOrderDetails");

document.addEventListener("click", function (event) {

    const viewButton =
        event.target.closest(".order-view-btn");

    if (!viewButton) return;

    const orderId = viewButton.dataset.id;

    document.getElementById("orderDetailsId").textContent =
        `Order #${orderId}`;

    loadOrderDetails(orderId);

    document.getElementById("orderDetailsContent").innerHTML = `
        <div class="order-details-loading">
            Loading order details...
        </div>
    `;

    orderDetailsOverlay.classList.add("show");
});


if (closeOrderDetails) {
    closeOrderDetails.addEventListener("click", function () {
        orderDetailsOverlay.classList.remove("show");
    });
}


if (orderDetailsOverlay) {
    orderDetailsOverlay.addEventListener("click", function (event) {

        if (event.target === orderDetailsOverlay) {
            orderDetailsOverlay.classList.remove("show");
        }

    });
}

async function loadOrderDetails(orderId) {

    const content =
        document.getElementById("orderDetailsContent");

    content.innerHTML = `
        <div class="order-details-loading">
            Loading order details...
        </div>
    `;

    try {

        const { data: order, error: orderError } =
            await supabase
                .from("orders")
                .select(`
                    id,
                    user_id,
                    address_id,
                    total_amount,
                    status,
                    created_at
                `)
                .eq("id", orderId)
                .single();

        if (orderError) throw orderError;

        let customer = null;

        if (order.user_id) {

            const { data, error } =
                await supabase
                    .from("profiles")
                    .select("full_name, phone")
                    .eq("id", order.user_id)
                    .single();

            if (!error) {
                customer = data;
            }
        }

        let address = null;

        if (order.address_id) {

            const { data, error } =
                await supabase
                    .from("addresses")
                    .select(`
                        address_line,
                        village,
                        mandal,
                        district,
                        state,
                        pincode
                    `)
                    .eq("id", order.address_id)
                    .single();

            if (!error) {
                address = data;
            }
        }
        let orderItems = [];

        const { data: items, error: itemsError } =
            await supabase
                .from("order_items")
                .select(`
                    id,
                    product_id,
                    product_name,
                    quantity,
                    price,
                    subtotal
                `)
                .eq("order_id", orderId)
                .order("id", {
                    ascending: true
                });

        if (itemsError) {
            console.error(
                "Loading order items failed:",
                itemsError
            );
        } else {
            orderItems = items || [];
        }

        content.innerHTML = `
            <div class="order-detail-section">

                <h4>Products Ordered</h4>

                <div class="order-products-list">

                    ${
                        orderItems.length === 0
                            ? `
                                <div class="no-order-products">
                                    No products found.
                                </div>
                            `
                            : orderItems.map(function (item) {
                                return `
                                    <div class="order-product-row">

                                        <div class="order-product-info">
                                            <strong>
                                                ${item.product_name}
                                            </strong>

                                            <span>
                                                ₹${Number(item.price).toFixed(2)}
                                                ×
                                                ${item.quantity}
                                            </span>
                                        </div>

                                        <strong class="order-product-subtotal">
                                            ₹${Number(item.subtotal).toFixed(2)}
                                        </strong>

                                    </div>
                                `;
                            }).join("")
                    }

                </div>

            </div>
            <div class="order-detail-section">

                <h4>Customer Information</h4>

                <div class="order-detail-grid">

                    <div>
                        <span>Name</span>
                        <strong>
                            ${customer?.full_name || "Unknown"}
                        </strong>
                    </div>

                    <div>
                        <span>Phone</span>
                        <strong>
                            ${customer?.phone || "—"}
                        </strong>
                    </div>

                </div>

            </div>

            <div class="order-detail-section">

                <h4>Delivery Address</h4>

                <p>
                    ${address?.address_line || "—"}<br>
                    ${address?.village || ""}<br>
                    ${address?.mandal || ""}<br>
                    ${address?.district || ""}<br>
                    ${address?.state || ""} -
                    ${address?.pincode || ""}
                </p>

            </div>

            <div class="order-detail-section">

                <h4>Order Information</h4>

                <div class="order-detail-grid">

                    <div>
                        <span>Status</span>
                        <strong>
                            <span class="order-status-badge status-${order.status}">
                                ${
                                    order.status.charAt(0).toUpperCase() +
                                    order.status.slice(1)
                                }
                            </span>
                        </strong>
                    </div>

                    <div>
                        <span>Total Amount</span>
                        <strong>
                            ₹${Number(order.total_amount).toFixed(2)}
                        </strong>
                    </div>
                    <div class="order-progress">

                        <div class="progress-step ${["new", "accepted", "shipped", "delivered"].includes(order.status) ? "completed" : ""} ${order.status === "new" ? "current" : ""}">
                            <div class="progress-dot">
                                <i class="bi bi-receipt"></i>
                            </div>
                            <span>New</span>
                        </div>

                        <div class="progress-line ${["accepted", "shipped", "delivered"].includes(order.status) ? "completed" : ""}"></div>

                        <div class="progress-step ${["accepted", "shipped", "delivered"].includes(order.status) ? "completed" : ""} ${order.status === "accepted" ? "current" : ""}">
                            <div class="progress-dot">
                                <i class="bi bi-check2"></i>
                            </div>
                            <span>Accepted</span>
                        </div>

                        <div class="progress-line ${["shipped", "delivered"].includes(order.status) ? "completed" : ""}"></div>

                        <div class="progress-step ${["shipped", "delivered"].includes(order.status) ? "completed" : ""} ${order.status === "shipped" ? "current" : ""}">
                            <div class="progress-dot">
                                <i class="bi bi-truck"></i>
                            </div>
                            <span>Shipped</span>
                        </div>

                        <div class="progress-line ${order.status === "delivered" ? "completed" : ""}"></div>

                        <div class="progress-step ${order.status === "delivered" ? "completed" : ""} ${order.status === "delivered" ? "current" : ""}">
                            <div class="progress-dot">
                                <i class="bi bi-house-check"></i>
                            </div>
                            <span>Delivered</span>
                        </div>

                    </div>
                </div>

            </div>
        `;

    } catch (error) {

        console.error(
            "ORDER DETAILS ERROR:",
            error
        );

        content.innerHTML = `
            <div class="order-details-loading">
                Failed to load order details.
            </div>
        `;
    }
}
// =========================================
// LOAD CUSTOMER COUNT
// =========================================

async function loadCustomerCount() {

    try {

        const { count, error } = await supabase
            .from("profiles")
            .select("id", {
                count: "exact",
                head: true
            });

        if (error) {
            throw error;
        }

        const customerCount =
            document.getElementById("customerCount");

        if (customerCount) {
            customerCount.textContent = count || 0;
        }

    } catch (error) {

        console.error(
            "Loading customer count failed:",
            error
        );

    }
}
// =========================================
// CUSTOMER DETAILS
// =========================================

const customerDetailsOverlay =
    document.getElementById("customerDetailsOverlay");

const closeCustomerDetails =
    document.getElementById("closeCustomerDetails");

const customerDetailsContent =
    document.getElementById("customerDetailsContent");

const customerDetailsName =
    document.getElementById("customerDetailsName");


// Open customer details
document.addEventListener("click", function (event) {

    const viewButton =
        event.target.closest(".customer-view-btn");

    if (!viewButton) return;

    const customerId =
        viewButton.dataset.id;

    customerDetailsOverlay.classList.add("show");

    customerDetailsContent.innerHTML = `
        <div class="customer-details-loading">

            <div class="spinner-border"></div>

            <p>
                Loading customer details...
            </p>

        </div>
    `;

    loadCustomerDetails(customerId);

});


// Close customer details
if (closeCustomerDetails) {

    closeCustomerDetails.addEventListener(
        "click",
        function () {

            customerDetailsOverlay.classList.remove("show");

        }
    );

}


// Close by clicking outside
if (customerDetailsOverlay) {

    customerDetailsOverlay.addEventListener(
        "click",
        function (event) {

            if (event.target === customerDetailsOverlay) {

                customerDetailsOverlay.classList.remove("show");

            }

        }
    );

}


// Load customer details
async function loadCustomerDetails(customerId) {

    try {

        // Load customer profile
        const {
            data: customer,
            error: profileError
        } = await supabase
            .from("profiles")
            .select(`
                id,
                full_name,
                phone,
                created_at
            `)
            .eq("id", customerId)
            .single();


        if (profileError) {
            throw profileError;
        }


        // Load customer orders
        const {
            data: orders,
            error: ordersError
        } = await supabase
            .from("orders")
            .select(`
                id,
                total_amount,
                status,
                created_at
            `)
            .eq("user_id", customerId)
            .order("created_at", {
                ascending: false
            });


        if (ordersError) {
            throw ordersError;
        }


        // Load customer addresses
        const {
            data: addresses,
            error: addressesError
        } = await supabase
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
            .eq("user_id", customerId)
            .order("created_at", {
                ascending: false
            });


        if (addressesError) {
            throw addressesError;
        }


        const customerName =
            customer.full_name || "Unnamed Customer";

        const customerPhone =
            customer.phone || "—";


        const joinedDate =
            customer.created_at
                ? new Date(customer.created_at)
                    .toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    })
                : "—";


        // Calculate total spent
        const totalSpent =
            (orders || []).reduce(function (total, order) {

                return total +
                    Number(order.total_amount || 0);

            }, 0);


        // Header name
        if (customerDetailsName) {

            customerDetailsName.textContent =
                customerName;

        }


        // Addresses HTML
        let addressesHTML = "";

        if (!addresses || addresses.length === 0) {

            addressesHTML = `
                <div class="customer-detail-empty">
                    No saved addresses.
                </div>
            `;

        } else {

            addresses.forEach(function (address) {

                const locationParts = [
                    address.village,
                    address.mandal,
                    address.district,
                    address.state
                ].filter(Boolean);

                const fullAddress = [
                    address.address_line,
                    ...locationParts,
                    address.pincode
                ].filter(Boolean).join(", ");

                addressesHTML += `
                    <div class="customer-address-card">

                        <i class="bi bi-geo-alt-fill"></i>

                        <strong>
                            Delivery Address
                        </strong>

                        <p>
                            ${fullAddress}
                        </p>

                    </div>
                `;

            });

        }


        // Orders HTML
        let ordersHTML = "";

        if (!orders || orders.length === 0) {

            ordersHTML = `
                <div class="customer-detail-empty">
                    No orders yet.
                </div>
            `;

        } else {

            orders.forEach(function (order) {

                const orderDate =
                    new Date(order.created_at)
                        .toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        });

                ordersHTML += `
                    <div class="customer-order-item">

                        <div class="customer-order-info">

                            <strong>
                                Order #${order.id}
                            </strong>

                            <span>
                                ${orderDate}
                                •
                                ${order.status}
                            </span>

                        </div>

                        <div class="customer-order-total">
                            ₹${Number(
                                order.total_amount || 0
                            ).toFixed(2)}
                        </div>

                    </div>
                `;

            });

        }


        // Render popup
        customerDetailsContent.innerHTML = `

            <!-- CUSTOMER INFORMATION -->

            <div class="customer-detail-section">

                <h4>
                    <i class="bi bi-person"></i>
                    Customer Information
                </h4>

                <div class="customer-info-grid">

                    <div class="customer-info-item">

                        <span>Name</span>

                        <strong>
                            ${customerName}
                        </strong>

                    </div>


                    <div class="customer-info-item">

                        <span>Phone</span>

                        <strong>
                            ${customerPhone}
                        </strong>

                    </div>


                    <div class="customer-info-item">

                        <span>Joined</span>

                        <strong>
                            ${joinedDate}
                        </strong>

                    </div>


                    <div class="customer-info-item">

                        <span>Total Orders</span>

                        <strong>
                            ${(orders || []).length}
                        </strong>

                    </div>


                    <div class="customer-info-item">

                        <span>Total Spent</span>

                        <strong>
                            ₹${totalSpent.toFixed(2)}
                        </strong>

                    </div>

                </div>

            </div>


            <!-- ADDRESSES -->

            <div class="customer-detail-section">

                <h4>
                    <i class="bi bi-geo-alt"></i>
                    Saved Addresses
                </h4>

                ${addressesHTML}

            </div>


            <!-- ORDERS -->

            <div class="customer-detail-section">

                <h4>
                    <i class="bi bi-bag-check"></i>
                    Order History
                </h4>

                ${ordersHTML}

            </div>

        `;


    } catch (error) {

        console.error(
            "Loading customer details failed:",
            error
        );

        customerDetailsContent.innerHTML = `
            <div class="customer-detail-empty">

                <i class="bi bi-exclamation-circle"></i>

                <p>
                    Failed to load customer details.
                </p>

            </div>
        `;

    }

}
// =========================================
// LOAD CUSTOMERS
// =========================================

async function loadAdminCustomers() {

    const customerTableBody =
        document.getElementById("customerTableBody");

    if (!customerTableBody) return;

    customerTableBody.innerHTML = `
        <tr>
            <td colspan="5" class="empty-message">
                Loading customers...
            </td>
        </tr>
    `;

    try {

        const { data: customers, error } =
            await supabase
                .from("profiles")
                .select(`
                    id,
                    full_name,
                    phone,
                    created_at
                `)
                .order("created_at", {
                    ascending: false
                });

        if (error) {
            throw error;
        }

        // No customers
        if (!customers || customers.length === 0) {

            customerTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-message">
                        No customers registered yet.
                    </td>
                </tr>
            `;

            return;
        }

        customerTableBody.innerHTML = "";

        customers.forEach(function (customer, index) {

            const row = document.createElement("tr");

            const customerName =
                customer.full_name || "Unnamed Customer";

            const customerPhone =
                customer.phone || "—";

            const joinedDate =
                customer.created_at
                    ? new Date(customer.created_at)
                        .toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        })
                    : "—";

            row.innerHTML = `
                <td>${index + 1}</td>

                <td>
                    <strong>${customerName}</strong>
                </td>

                <td>
                    ${customerPhone}
                </td>

                <td>
                    ${joinedDate}
                </td>

                <td>
                    <button
                        type="button"
                        class="customer-view-btn"
                        data-id="${customer.id}">
                        <i class="bi bi-eye"></i>
                        View
                    </button>
                </td>
            `;

            customerTableBody.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Loading customers failed:",
            error
        );

        customerTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">
                    Failed to load customers.
                </td>
            </tr>
        `;
    }
}

async function loadSalesSummary() {
    try {
        const { data: orders, error } = await supabase
            .from("orders")
            .select("total_amount, status");

        if (error) throw error;

        let totalSales = 0;
        let totalOrders = 0;
        let deliveredOrders = 0;
        let pendingOrders = 0;
        let cancelledOrders = 0;

        (orders || []).forEach(function (order) {

            totalOrders++;

            if (order.status === "delivered") {
                totalSales += Number(order.total_amount || 0);
                deliveredOrders++;
            }

            if (
                order.status === "new" ||
                order.status === "accepted" ||
                order.status === "shipped"
            ) {
                pendingOrders++;
            }

            if (order.status === "cancelled") {
                cancelledOrders++;
            }
        });

        const totalSalesElement =
            document.getElementById("totalSales");

        const totalOrdersElement =
            document.getElementById("totalOrders");

        const deliveredOrdersElement =
            document.getElementById("deliveredOrders");

        const pendingOrdersElement =
            document.getElementById("pendingOrders");

        const cancelledOrdersElement =
            document.getElementById("cancelledOrders");

        if (totalSalesElement) {
            totalSalesElement.textContent =
                "₹" + totalSales.toLocaleString("en-IN");
        }

        if (totalOrdersElement) {
            totalOrdersElement.textContent =
                totalOrders;
        }

        if (deliveredOrdersElement) {
            deliveredOrdersElement.textContent =
                deliveredOrders;
        }

        if (pendingOrdersElement) {
            pendingOrdersElement.textContent =
                pendingOrders;
        }

        if (cancelledOrdersElement) {
            cancelledOrdersElement.textContent =
                cancelledOrders;
        }

    } catch (error) {
        console.error(
            "Loading sales summary failed:",
            error
        );
    }
}
async function loadAdminProfile() {
    try {
        const {
            data: { user },
            error
        } = await supabase.auth.getUser();

        if (error) throw error;

        const emailElement =
            document.getElementById("adminProfileEmail");

        if (emailElement) {
            emailElement.textContent =
                user?.email || "Admin";
        }

    } catch (error) {
        console.error(
            "Loading admin profile failed:",
            error
        );
    }
}



// ================= LOGOUT MODAL =================

const logoutModal =
    document.getElementById("logoutModal");

const cancelLogout =
    document.getElementById("cancelLogout");

const confirmLogout =
    document.getElementById("confirmLogout");


// Open logout modal
document.addEventListener("click", function (event) {

    const logoutButton =
        event.target.closest("#adminLogout, #adminProfileLogout");

    if (!logoutButton) return;

    if (logoutModal) {
        logoutModal.classList.add("show");
    }

});


// Cancel logout
if (cancelLogout) {

    cancelLogout.addEventListener("click", function () {

        logoutModal.classList.remove("show");

    });

}


// Close when clicking outside modal
if (logoutModal) {

    logoutModal.addEventListener("click", function (event) {

        if (event.target === logoutModal) {

            logoutModal.classList.remove("show");

        }

    });

}


// Confirm logout
if (confirmLogout) {

    confirmLogout.onclick = async function () {

        confirmLogout.disabled = true;

        confirmLogout.innerHTML = `
            <span class="spinner-border spinner-border-sm"></span>
            Logging out...
        `;

        try {

            const { error } =
                await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            logoutModal.classList.remove("show");

            showNotification(
                "Logged out successfully.",
                "success"
            );

            setTimeout(function () {
                window.location.href = "../index.html?login=true";
            }, 800);

        } catch (error) {

            console.error("Logout failed:", error);

            confirmLogout.disabled = false;

            confirmLogout.innerHTML = `
                <i class="bi bi-box-arrow-right"></i>
                Logout
            `;

            showNotification(
                "Logout failed. Please try again.",
                "error"
            );
        }
    };

}


loadSalesSummary();
loadAdminOrders();
loadAdminCustomers();
loadCustomerCount();
loadCategories();
loadProductCategories();
loadProducts();
loadAdminProfile();
// =========================================
// STORE SETTINGS
// =========================================
async function uploadUpiQrCode(file) {

    if (!file) {
        return null;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        throw new Error(
            "UPI QR must be JPG, PNG, or WebP."
        );
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
        throw new Error(
            "UPI QR image must be less than 2 MB."
        );
    }

    const fileExtension =
        file.name.split(".").pop().toLowerCase();

    const fileName =
        `upi-qr-${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

    const { error: uploadError } =
        await supabase
            .storage
            .from("store-assets")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false
            });

    if (uploadError) {
        throw uploadError;
    }

    const { data: publicUrlData } =
        supabase
            .storage
            .from("store-assets")
            .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
}
async function loadStoreSettings() {

    try {

        const { data, error } = await supabase
            .from("store_settings")
            .select("*")
            .limit(1)
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            return;
        }

        document.getElementById("storeName").value =
            data.store_name || "";

        document.getElementById("storePhone").value =
            data.phone || "";

        document.getElementById("storeEmail").value =
            data.email || "";

        document.getElementById("storeHours").value =
            data.opening_hours || "";

        document.getElementById("storeAddress").value =
            data.address || "";
        document.getElementById("storeUpiId").value =
            data.upi_id || "";

        const upiQrPreview =
            document.getElementById("upiQrPreview");

        if (upiQrPreview && data.upi_qr_url) {
            upiQrPreview.innerHTML = `
                <img
                    src="${data.upi_qr_url}"
                    alt="UPI QR Code"
                    style="
                        width: 160px;
                        height: 160px;
                        object-fit: contain;
                        border: 1px solid #ddd;
                        border-radius: 12px;
                        padding: 8px;
                    "
                >
            `;
        }

    } catch (error) {

        console.error(
            "Loading store settings failed:",
            error
        );

    }

}


// Load settings when admin dashboard opens
loadStoreSettings();
// =========================================
// SAVE STORE SETTINGS
// =========================================

const storeSettingsForm =
    document.getElementById("storeSettingsForm");

if (storeSettingsForm) {

    storeSettingsForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const saveButton =
                document.getElementById(
                    "saveStoreSettingsBtn"
                );

            const storeName =
                document.getElementById("storeName")
                    .value.trim();

            const storePhone =
                document.getElementById("storePhone")
                    .value.trim();

            const storeEmail =
                document.getElementById("storeEmail")
                    .value.trim();

            const storeHours =
                document.getElementById("storeHours")
                    .value.trim();

            const storeAddress =
                document.getElementById("storeAddress")
                    .value.trim();
            const storeUpiId =
                document.getElementById("storeUpiId")
                    .value.trim();

            const qrFile =
                document.getElementById("storeUpiQr").files[0];


            if (!storeName) {

                showNotification(
                    "Please enter the store name.",
                    "warning"
                );

                return;
            }


            saveButton.disabled = true;

            saveButton.innerHTML =
                `<span class="spinner-border spinner-border-sm"></span>
                 Saving...`;


            try {

                const { data, error } =
                    await supabase
                        .from("store_settings")
                        .select("id")
                        .limit(1)
                        .single();

                if (error) {
                    throw error;
                }


                const { error: updateError } =
                    await supabase
                        .from("store_settings")
                        .update({
                            store_name: storeName,
                            phone: storePhone,
                            email: storeEmail,
                            opening_hours: storeHours,
                            address: storeAddress,
                            upi_id: storeUpiId,
                            upi_qr_url: qrFile
                                ? await uploadUpiQrCode(qrFile)
                                : undefined,
                            updated_at: new Date().toISOString()
                        })
                        .eq("id", data.id);

                if (updateError) {
                    throw updateError;
                }


                showNotification(
                    "Store settings updated successfully!",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Saving store settings failed:",
                    error
                );

                showNotification(
                    "Failed to save store settings: " +
                    error.message,
                    "error"
                );

            } finally {

                saveButton.disabled = false;

                saveButton.innerHTML =
                    `<i class="bi bi-check2-circle"></i>
                     Save Changes`;

            }

        }
    );

}
// =========================================
// STORE SETTINGS
// =========================================


async function testStoreSettings() {

    const { data, error } = await supabase
        .from("store_settings")
        .select("*");

    console.log("STORE SETTINGS DATA:", data);
    console.log("STORE SETTINGS ERROR:", error);

}

testStoreSettings();


// =========================================
// ADD NEW ADMIN
// =========================================

const addAdminForm = document.getElementById("addAdminForm");

if (addAdminForm) {

    addAdminForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const nameInput =
            document.getElementById("newAdminName");

        const emailInput =
            document.getElementById("newAdminEmail");

        const passwordInput =
            document.getElementById("newAdminPassword");

        const addAdminBtn =
            document.getElementById("addAdminBtn");


        const fullName =
            nameInput.value.trim();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!fullName || !email || !password) {

            showNotification(
                "Please fill in all fields.",
                "warning"
            );

            return;
        }


        if (password.length < 8) {

            showNotification(
                "Password must contain at least 8 characters.",
                "warning"
            );

            return;
        }


        // Disable button while creating admin
        addAdminBtn.disabled = true;

        addAdminBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm"></span>
            Creating Admin...
        `;


        try {

            const { data, error } = await supabase.functions.invoke(
                "clever-function",
                    {
                        body: {
                            full_name: fullName,
                            email: email,
                            password: password
                        }
                    }
                );


            if (error) {
                throw error;
            }


            if (!data?.success) {

                throw new Error(
                    data?.error ||
                    "Unable to create admin."
                );
            }


            showNotification(
                "New admin created successfully.",
                "success"
            );


            // Clear form
            addAdminForm.reset();


        } catch (error) {

            console.error(
                "Create admin failed:",
                error
            );


            showNotification(
                error.message ||
                "Failed to create admin.",
                "error"
            );


        } finally {

            addAdminBtn.disabled = false;

            addAdminBtn.innerHTML = `
                <i class="bi bi-person-plus"></i>
                Add Admin
            `;

        }

    });

}