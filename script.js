// ---------- PRODUCT DATA ----------
const products = [
  { id: 1, name: "Horizon Smart Watch", price: 99, category: "Electronics", image: "https://picsum.photos/id/0/300/220", description: "Elegant smartwatch with HR monitor, GPS, and 5-day battery." },
  { id: 2, name: "Aura Wireless Headphones", price: 49, category: "Electronics", image: "https://picsum.photos/id/1/300/220", description: "Noise cancelling, 30h playtime, deep bass." },
  { id: 3, name: "Essential Cotton Tee", price: 19, category: "Clothing", image: "https://picsum.photos/id/20/300/220", description: "100% premium cotton, breathable, modern fit." },
  { id: 4, name: "Vintage Leather Jacket", price: 129, category: "Clothing", image: "https://picsum.photos/id/30/300/220", description: "Genuine leather, timeless style." },
  { id: 5, name: "Urban Backpack", price: 59, category: "Accessories", image: "https://picsum.photos/id/41/300/220", description: "Waterproof, laptop compartment, ergonomic." },
  { id: 6, name: "Polarized Sunglasses", price: 29, category: "Accessories", image: "https://picsum.photos/id/96/300/220", description: "UV400 protection, lightweight frame." },
  { id: 7, name: "LED Desk Lamp", price: 39, category: "Home Goods", image: "https://picsum.photos/id/26/300/220", description: "Adjustable brightness, modern touch control." },
  { id: 8, name: "Ceramic Coffee Mug", price: 12, category: "Home Goods", image: "https://picsum.photos/id/60/300/220", description: "Handcrafted, 12oz, heat-resistant." }
];

let cart = []; // { id, quantity }
let currentProductId = null;

// ---------- CART MANAGEMENT ----------
function loadCart() {
  const stored = localStorage.getItem("novaCart");
  if (stored) cart = JSON.parse(stored);
  else cart = [];
  updateCartCounter();
}

function saveCart() {
  localStorage.setItem("novaCart", JSON.stringify(cart));
  updateCartCounter();
  renderCartPage();
}

function updateCartCounter() {
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const counter = document.getElementById("cartCount");
  if (counter) counter.innerText = totalQty;
}

function addToCart(productId, qty = 1) {
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.quantity += qty;
  else cart.push({ id: productId, quantity: qty });
  saveCart();
}

function removeCartItem(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
}

function updateQuantity(productId, newQty) {
  if (newQty <= 0) removeCartItem(productId);
  else {
    const item = cart.find(i => i.id === productId);
    if (item) item.quantity = newQty;
    saveCart();
  }
}

function getCartWithProducts() {
  return cart.map(cartItem => {
    const prod = products.find(p => p.id === cartItem.id);
    return { ...cartItem, product: prod, totalPrice: prod.price * cartItem.quantity };
  }).filter(item => item.product);
}

function renderCartPage() {
  const container = document.getElementById("cartItemsList");
  if (!container) return;
  const cartItems = getCartWithProducts();
  if (cartItems.length === 0) {
    container.innerHTML = "<p>Your cart is empty. ✨ Start shopping!</p>";
    document.getElementById("cartTotal").innerHTML = "";
    return;
  }
  let html = "";
  let grand = 0;
  cartItems.forEach(item => {
    grand += item.totalPrice;
    html += `<div class="cart-item">
      <div><img src="${item.product.image}" alt="${item.product.name}"> ${item.product.name}</div>
      <div>$${item.product.price}</div>
      <div><input type="number" class="quantity-input" data-id="${item.id}" value="${item.quantity}" min="1"></div>
      <div>$${item.totalPrice}</div>
      <div><button class="btn-outline remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button></div>
    </div>`;
  });
  container.innerHTML = html;
  document.getElementById("cartTotal").innerHTML = `Total: $${grand.toFixed(2)}`;
  document.querySelectorAll(".quantity-input").forEach(inp => {
    inp.addEventListener("change", (e) => updateQuantity(parseInt(inp.dataset.id), parseInt(inp.value)));
  });
  document.querySelectorAll(".remove-item").forEach(btn => {
    btn.addEventListener("click", (e) => removeCartItem(parseInt(btn.dataset.id)));
  });
}

// ---------- PRODUCT LISTING & FILTERS ----------
function renderProductList(containerId = "productsGrid", isFeatured = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let filtered = [...products];
  if (!isFeatured) {
    const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() || "";
    const category = document.getElementById("categoryFilter")?.value || "all";
    const maxPrice = parseInt(document.getElementById("priceSlider")?.value || 200);
    filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm) &&
      (category === "all" || p.category === category) &&
      p.price <= maxPrice
    );
  } else {
    // Featured: show first 4 products
    filtered = products.slice(0, 4);
  }
  if (filtered.length === 0) {
    container.innerHTML = "<p style='grid-column:1/-1; text-align:center'>No products found.</p>";
    return;
  }
  container.innerHTML = filtered.map(p => `
    <div class="product-card">
      <img class="product-img" src="${p.image}" alt="${p.name}">
      <div class="product-info">
        <div class="product-title">${p.name}</div>
        <div class="product-price">$${p.price}</div>
        <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
          <button class="btn-sm addCartQuick" data-id="${p.id}">Add to Cart</button>
          <button class="btn-outline viewDetails" data-id="${p.id}">View</button>
        </div>
      </div>
    </div>
  `).join("");
  document.querySelectorAll(".addCartQuick").forEach(btn => {
    btn.addEventListener("click", (e) => { addToCart(parseInt(btn.dataset.id), 1); alert("Added to cart!"); });
  });
  document.querySelectorAll(".viewDetails").forEach(btn => {
    btn.addEventListener("click", (e) => { showProductDetail(parseInt(btn.dataset.id)); });
  });
}

function showProductDetail(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  currentProductId = productId;
  const container = document.getElementById("productDetailContainer");
  container.innerHTML = `
    <div class="detail-card" style="display:flex; flex-wrap:wrap; gap:2rem; background:var(--card); border-radius:2rem; padding:2rem;">
      <img src="${product.image}" style="flex:1; min-width:250px; border-radius:1rem; object-fit:cover;">
      <div style="flex:2;">
        <h2>${product.name}</h2>
        <p style="color:var(--accent); font-size:1.8rem; font-weight:bold;">$${product.price}</p>
        <p>${product.description}</p>
        <p><strong>Category:</strong> ${product.category}</p>
        <button class="btn-primary" id="detailAddToCart">Add to Cart</button>
      </div>
    </div>
  `;
  document.getElementById("detailAddToCart")?.addEventListener("click", () => {
    addToCart(product.id, 1);
    alert(`${product.name} added to cart`);
  });
  switchPage("product-detail");
}

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;
  const cats = [...new Set(products.map(p => p.category))];
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

function initFilters() {
  const slider = document.getElementById("priceSlider");
  const priceVal = document.getElementById("priceValue");
  const maxP = Math.max(...products.map(p => p.price));
  slider.max = maxP;
  slider.value = maxP;
  priceVal.innerText = maxP;
  slider.addEventListener("input", () => {
    priceVal.innerText = slider.value;
    renderProductList("productsGrid", false);
  });
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.addEventListener("input", () => renderProductList("productsGrid", false));
  const categoryFilter = document.getElementById("categoryFilter");
  if (categoryFilter) categoryFilter.addEventListener("change", () => renderProductList("productsGrid", false));
  renderProductList("productsGrid", false);
}

// ---------- PAGE SWITCHING ----------
function switchPage(pageId) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active-page"));
  document.getElementById(`${pageId}-page`).classList.add("active-page");
  if (pageId === "products") {
    renderProductList("productsGrid", false);
    initFilters();
  }
  if (pageId === "cart") renderCartPage();
  if (pageId === "product-detail" && currentProductId) showProductDetail(currentProductId);
  if (pageId === "home") {
    renderProductList("featuredGrid", true);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
  setActiveNav(pageId);
}

function setActiveNav(page) {
  document.querySelectorAll("[data-page]").forEach(link => link.classList.remove("active"));
  const activeLink = document.querySelector(`[data-page="${page}"]`);
  if (activeLink) activeLink.classList.add("active");
}

// ---------- FORM VALIDATIONS ----------
const checkoutForm = document.getElementById("checkoutForm");
if (checkoutForm) {
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const zip = document.getElementById("zip").value.trim();
    if (!name || !email || !address || !city || !zip) {
      alert("Please complete all fields.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      alert("Valid email required.");
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty. Add items before checkout.");
      return;
    }
    const total = getCartWithProducts().reduce((s, i) => s + i.totalPrice, 0).toFixed(2);
    alert(`Order placed successfully! Thank you ${name}. Total: $${total}`);
    cart = [];
    saveCart();
    switchPage("home");
  });
}

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("contactName").value.trim();
    const mail = document.getElementById("contactEmail").value.trim();
    const msg = document.getElementById("contactMsg").value.trim();
    if (!name || !mail || !msg) {
      alert("All fields required.");
      return;
    }
    if (!mail.includes("@")) {
      alert("Email invalid.");
      return;
    }
    alert(`Thanks ${name}, we'll get back to you soon!`);
    contactForm.reset();
  });
}

// ---------- DARK MODE (with dynamic text "Light"/"Dark") ----------
const darkToggle = document.getElementById("darkModeToggle");

// Function to update the button text and icon based on current theme
function updateDarkModeButton() {
  const isDark = document.body.classList.contains("dark");
  if (isDark) {
    darkToggle.innerHTML = '<i class="fas fa-sun"></i> Light';
  } else {
    darkToggle.innerHTML = '<i class="fas fa-moon"></i> Dark';
  }
}

// Set initial theme from localStorage
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}
updateDarkModeButton();

// Toggle theme on click
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDarkNow = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDarkNow ? "dark" : "light");
  updateDarkModeButton();
});

// ---------- HAMBURGER MENU ----------
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
hamburger.addEventListener("click", () => navLinks.classList.toggle("open"));

// ---------- NAVIGATION SETUP ----------
function setupNavigation() {
  document.querySelectorAll("[data-page]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      if (page === "cart") renderCartPage();
      switchPage(page);
    });
  });
  document.getElementById("heroShopBtn")?.addEventListener("click", () => switchPage("products"));
  document.getElementById("heroLearnBtn")?.addEventListener("click", () => alert("Discover the latest trends at NovaMart!"));
  document.getElementById("backToProductsBtn")?.addEventListener("click", () => switchPage("products"));
}

// ---------- INITIALIZATION ----------
loadCart();
populateCategories();
setupNavigation();
renderProductList("featuredGrid", true);
// Ensure homepage featured products are shown on load
switchPage("home");