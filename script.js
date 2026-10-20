/**
 * ShopEase - Main Application Client Controller
 * ES Module coordinating UI rendering, event handling, cart state, and checkout validation.
 */

import { getProducts, findProductById } from "./src/products.js";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  calculateCartSummary,
  getTotalItemCount,
  clearCart
} from "./src/cart.js";
import {
  validateCustomerName,
  validateEmail,
  validateAddress,
  validateCheckoutForm
} from "./src/validator.js";

// Application State
let cartState = [];
let activeCategory = "All";

// DOM Elements Cache
const elements = {
  // Navigation & Badges
  cartCountBadge: document.getElementById("cart-count"),
  openCartBtn: document.getElementById("open-cart-btn"),

  // Products
  productsGrid: document.getElementById("products-grid"),
  categoryFilters: document.getElementById("category-filters"),

  // Cart Drawer
  cartDrawer: document.getElementById("cart-drawer"),
  cartDrawerOverlay: document.getElementById("cart-drawer-overlay"),
  closeCartBtn: document.getElementById("close-cart-btn"),
  cartItemsContainer: document.getElementById("cart-items-container"),
  drawerItemCount: document.getElementById("drawer-item-count"),
  cartSubtotal: document.getElementById("cart-subtotal"),
  cartTax: document.getElementById("cart-tax"),
  cartTotal: document.getElementById("cart-total"),
  cartFooter: document.getElementById("cart-footer"),
  clearCartBtn: document.getElementById("clear-cart-btn"),
  openCheckoutBtn: document.getElementById("open-checkout-btn"),

  // Checkout Modal
  checkoutModalOverlay: document.getElementById("checkout-modal-overlay"),
  closeCheckoutBtn: document.getElementById("close-checkout-btn"),
  cancelCheckoutBtn: document.getElementById("cancel-checkout-btn"),
  checkoutForm: document.getElementById("checkout-form"),
  checkoutSummaryTotal: document.getElementById("checkout-summary-total"),
  fullNameInput: document.getElementById("fullName"),
  emailInput: document.getElementById("email"),
  addressInput: document.getElementById("address"),
  fullNameError: document.getElementById("fullName-error"),
  emailError: document.getElementById("email-error"),
  addressError: document.getElementById("address-error"),

  // Confirmation Modal
  confirmationModalOverlay: document.getElementById("confirmation-modal-overlay"),
  confirmationDetails: document.getElementById("confirmation-details"),
  closeConfirmationBtn: document.getElementById("close-confirmation-btn"),

  // Toasts
  toastContainer: document.getElementById("toast-container")
};

// ==========================================
// Initialization & Storage
// ==========================================

function initApp() {
  loadCartFromStorage();
  renderProducts();
  setupEventListeners();
  updateCartUI();
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem("shopease_cart");
    if (saved) {
      cartState = JSON.parse(saved);
    }
  } catch {
    cartState = [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem("shopease_cart", JSON.stringify(cartState));
  } catch (err) {
    console.warn("Could not persist cart to localStorage:", err);
  }
}

// ==========================================
// Products Rendering & Filtering
// ==========================================

function renderProducts() {
  const allProducts = getProducts();
  const filtered = activeCategory === "All"
    ? allProducts
    : allProducts.filter((p) => p.category === activeCategory);

  elements.productsGrid.innerHTML = "";

  if (filtered.length === 0) {
    elements.productsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
        <p>No products found in this category.</p>
      </div>
    `;
    return;
  }

  filtered.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.setAttribute("data-id", product.id);

    card.innerHTML = `
      <div class="product-image-container">
        <span class="product-category-tag">${escapeHTML(product.category)}</span>
        <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" class="product-image" loading="lazy">
      </div>
      <div class="product-info">
        <div class="product-header">
          <h3 class="product-name">${escapeHTML(product.name)}</h3>
          <span class="product-rating">★ ${product.rating}</span>
        </div>
        <p class="product-desc">${escapeHTML(product.description)}</p>
        <div class="product-card-footer">
          <span class="product-price">$${product.price.toFixed(2)}</span>
          <button class="btn btn-primary btn-add-cart" data-id="${product.id}" aria-label="Add ${escapeHTML(product.name)} to cart">
            <span>+</span> Add to Cart
          </button>
        </div>
      </div>
    `;

    elements.productsGrid.appendChild(card);
  });
}

function handleCategoryChange(e) {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;

  const category = btn.getAttribute("data-category");
  if (!category) return;

  activeCategory = category;

  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  renderProducts();
}

// ==========================================
// Cart Operations & UI
// ==========================================

function handleAddToCart(productId) {
  const product = findProductById(productId);
  if (!product) return;

  cartState = addToCart(cartState, product, 1);
  saveCartToStorage();
  updateCartUI();

  // Badge animation
  elements.cartCountBadge.classList.add("bounce");
  setTimeout(() => elements.cartCountBadge.classList.remove("bounce"), 300);

  showToast(`Added "${product.name}" to cart!`);
}

function updateCartUI() {
  const count = getTotalItemCount(cartState);
  elements.cartCountBadge.textContent = count;
  elements.drawerItemCount.textContent = `${count} ${count === 1 ? "item" : "items"}`;

  const summary = calculateCartSummary(cartState);
  elements.cartSubtotal.textContent = `$${summary.subtotal.toFixed(2)}`;
  elements.cartTax.textContent = `$${summary.tax.toFixed(2)}`;
  elements.cartTotal.textContent = `$${summary.total.toFixed(2)}`;
  elements.checkoutSummaryTotal.textContent = `$${summary.total.toFixed(2)}`;

  renderCartItems();
}

function renderCartItems() {
  if (cartState.length === 0) {
    elements.cartItemsContainer.innerHTML = `
      <div class="empty-cart-state">
        <div class="empty-cart-icon">🛒</div>
        <h4>Your cart is empty</h4>
        <p>Explore our catalog to find items you love.</p>
      </div>
    `;
    elements.cartFooter.classList.add("hidden");
    return;
  }

  elements.cartFooter.classList.remove("hidden");
  elements.cartItemsContainer.innerHTML = "";

  cartState.forEach((item) => {
    const itemRow = document.createElement("div");
    itemRow.className = "cart-item";
    itemRow.innerHTML = `
      <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" class="cart-item-image">
      <div class="cart-item-info">
        <h4 class="cart-item-title">${escapeHTML(item.name)}</h4>
        <div class="cart-item-price">$${Number(item.price).toFixed(2)} each</div>
        <div class="cart-item-controls">
          <button class="qty-btn btn-dec" data-id="${item.id}" aria-label="Decrease quantity">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn btn-inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
          <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">Remove</button>
        </div>
      </div>
      <div class="cart-item-total">
        $${(Number(item.price) * item.quantity).toFixed(2)}
      </div>
    `;

    elements.cartItemsContainer.appendChild(itemRow);
  });
}

function openCartDrawer() {
  elements.cartDrawer.classList.remove("hidden");
  elements.cartDrawerOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeCartDrawer() {
  elements.cartDrawer.classList.add("hidden");
  elements.cartDrawerOverlay.classList.add("hidden");
  document.body.style.overflow = "";
}

// ==========================================
// Checkout Modal & Validation
// ==========================================

function openCheckoutModal() {
  if (cartState.length === 0) {
    showToast("Please add items to your cart before checking out.");
    return;
  }
  closeCartDrawer();
  clearFormErrors();
  elements.checkoutModalOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  elements.fullNameInput.focus();
}

function closeCheckoutModal() {
  elements.checkoutModalOverlay.classList.add("hidden");
  document.body.style.overflow = "";
}

function clearFormErrors() {
  elements.fullNameError.textContent = "";
  elements.emailError.textContent = "";
  elements.addressError.textContent = "";
  elements.fullNameInput.classList.remove("input-error");
  elements.emailInput.classList.remove("input-error");
  elements.addressInput.classList.remove("input-error");
}

function handleCheckoutSubmit(e) {
  e.preventDefault();

  clearFormErrors();

  const formData = {
    fullName: elements.fullNameInput.value,
    email: elements.emailInput.value,
    address: elements.addressInput.value
  };

  const validationResult = validateCheckoutForm(formData);

  if (!validationResult.isValid) {
    if (validationResult.errors.fullName) {
      elements.fullNameError.textContent = validationResult.errors.fullName;
      elements.fullNameInput.classList.add("input-error");
    }
    if (validationResult.errors.email) {
      elements.emailError.textContent = validationResult.errors.email;
      elements.emailInput.classList.add("input-error");
    }
    if (validationResult.errors.address) {
      elements.addressError.textContent = validationResult.errors.address;
      elements.addressInput.classList.add("input-error");
    }
    return;
  }

  // Create Demo Order Confirmation
  const summary = calculateCartSummary(cartState);
  const orderId = "SE-" + Math.floor(100000 + Math.random() * 900000);
  const orderDate = new Date().toLocaleString();
  const paymentMethod = elements.checkoutForm.paymentMethod.value === "CashOnDelivery"
    ? "Cash on Delivery (Demo)"
    : "Fast Simulated UPI / Card";

  const orderItemsSummary = cartState
    .map((item) => `${escapeHTML(item.name)} (x${item.quantity})`)
    .join("<br>");

  elements.confirmationDetails.innerHTML = `
    <div class="confirmation-row">
      <strong>Order ID:</strong>
      <span>${orderId}</span>
    </div>
    <div class="confirmation-row">
      <strong>Customer:</strong>
      <span>${escapeHTML(formData.fullName)}</span>
    </div>
    <div class="confirmation-row">
      <strong>Email:</strong>
      <span>${escapeHTML(formData.email)}</span>
    </div>
    <div class="confirmation-row">
      <strong>Deliver To:</strong>
      <span>${escapeHTML(formData.address)}</span>
    </div>
    <div class="confirmation-row">
      <strong>Items:</strong>
      <span>${orderItemsSummary}</span>
    </div>
    <div class="confirmation-row">
      <strong>Payment Mode:</strong>
      <span>${paymentMethod}</span>
    </div>
    <div class="confirmation-row">
      <strong>Total Paid:</strong>
      <strong style="color: var(--primary); font-size: 1.1rem;">$${summary.total.toFixed(2)}</strong>
    </div>
  `;

  // Close Checkout Modal & Open Confirmation Modal
  closeCheckoutModal();
  elements.confirmationModalOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  // Reset Cart
  cartState = clearCart();
  saveCartToStorage();
  updateCartUI();
  elements.checkoutForm.reset();

  showToast("Order placed successfully!");
}

function closeConfirmationModal() {
  elements.confirmationModalOverlay.classList.add("hidden");
  document.body.style.overflow = "";
}

// ==========================================
// Event Listeners
// ==========================================

function setupEventListeners() {
  // Category filtering
  elements.categoryFilters.addEventListener("click", handleCategoryChange);

  // Products grid delegated click (Add to Cart)
  elements.productsGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add-cart");
    if (!btn) return;
    const productId = btn.getAttribute("data-id");
    handleAddToCart(productId);
  });

  // Open / Close Cart Drawer
  elements.openCartBtn.addEventListener("click", openCartDrawer);
  elements.closeCartBtn.addEventListener("click", closeCartDrawer);
  elements.cartDrawerOverlay.addEventListener("click", closeCartDrawer);

  // Cart item actions (Inc, Dec, Remove)
  elements.cartItemsContainer.addEventListener("click", (e) => {
    const incBtn = e.target.closest(".btn-inc");
    const decBtn = e.target.closest(".btn-dec");
    const removeBtn = e.target.closest(".cart-item-remove");

    if (incBtn) {
      const id = Number(incBtn.getAttribute("data-id"));
      const current = cartState.find((item) => item.id === id);
      if (current) {
        cartState = updateQuantity(cartState, id, current.quantity + 1);
        saveCartToStorage();
        updateCartUI();
      }
    } else if (decBtn) {
      const id = Number(decBtn.getAttribute("data-id"));
      const current = cartState.find((item) => item.id === id);
      if (current) {
        cartState = updateQuantity(cartState, id, current.quantity - 1);
        saveCartToStorage();
        updateCartUI();
      }
    } else if (removeBtn) {
      const id = Number(removeBtn.getAttribute("data-id"));
      cartState = removeFromCart(cartState, id);
      saveCartToStorage();
      updateCartUI();
      showToast("Item removed from cart.");
    }
  });

  // Clear Cart
  elements.clearCartBtn.addEventListener("click", () => {
    if (cartState.length === 0) return;
    if (confirm("Are you sure you want to clear your cart?")) {
      cartState = clearCart();
      saveCartToStorage();
      updateCartUI();
      showToast("Cart cleared.");
    }
  });

  // Open Checkout
  elements.openCheckoutBtn.addEventListener("click", openCheckoutModal);
  elements.closeCheckoutBtn.addEventListener("click", closeCheckoutModal);
  elements.cancelCheckoutBtn.addEventListener("click", () => {
    closeCheckoutModal();
    openCartDrawer();
  });
  elements.checkoutModalOverlay.addEventListener("click", (e) => {
    if (e.target === elements.checkoutModalOverlay) {
      closeCheckoutModal();
    }
  });

  // Real-time input validation blur events
  elements.fullNameInput.addEventListener("blur", () => {
    const check = validateCustomerName(elements.fullNameInput.value);
    if (!check.isValid) {
      elements.fullNameError.textContent = check.error;
      elements.fullNameInput.classList.add("input-error");
    } else {
      elements.fullNameError.textContent = "";
      elements.fullNameInput.classList.remove("input-error");
    }
  });

  elements.emailInput.addEventListener("blur", () => {
    const check = validateEmail(elements.emailInput.value);
    if (!check.isValid) {
      elements.emailError.textContent = check.error;
      elements.emailInput.classList.add("input-error");
    } else {
      elements.emailError.textContent = "";
      elements.emailInput.classList.remove("input-error");
    }
  });

  elements.addressInput.addEventListener("blur", () => {
    const check = validateAddress(elements.addressInput.value);
    if (!check.isValid) {
      elements.addressError.textContent = check.error;
      elements.addressInput.classList.add("input-error");
    } else {
      elements.addressError.textContent = "";
      elements.addressInput.classList.remove("input-error");
    }
  });

  // Checkout Form Submission
  elements.checkoutForm.addEventListener("submit", handleCheckoutSubmit);

  // Close Confirmation Modal
  elements.closeConfirmationBtn.addEventListener("click", closeConfirmationModal);
  elements.confirmationModalOverlay.addEventListener("click", (e) => {
    if (e.target === elements.confirmationModalOverlay) {
      closeConfirmationModal();
    }
  });
}

// ==========================================
// Toast Notification Utility
// ==========================================

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Utility: Sanitize text for HTML injection
function escapeHTML(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Start application once DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
