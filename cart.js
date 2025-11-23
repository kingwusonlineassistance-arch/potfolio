// Cart state
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// DOM elements
const cartBtn = document.getElementById("cartButton");
const cartPanel = document.getElementById("cartPanel");
const closeCartBtn = document.querySelector("#cartPanel button[onclick='closeCart()']");
const cartList = document.getElementById("cartItems");
const cartBadge = document.getElementById("cartBadge");

// Initialize cart UI
function updateCartUI() {
  cartList.innerHTML = "";
  // Update cart badge
  cartBadge.textContent = cart.length;
  cartBadge.classList.toggle("hidden", cart.length === 0);

  if (cart.length === 0) {
    cartList.innerHTML = `
      <div class="text-center text-white/50 py-8">
        <i class="fas fa-inbox text-4xl mb-2"></i>
        <p class="text-lg">Cart is empty</p>
      </div>
    `;
    return;
  }

  cart.forEach((item, index) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item p-4 rounded-xl border-l-4 transition-all hover:shadow-lg bg-white/10 backdrop-blur-sm border border-white/20 relative";
    cartItem.style.borderLeftColor = getNetworkColor(item.network);
    cartItem.innerHTML = `
      <div class="flex justify-between items-start gap-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-1 rounded text-xs font-bold backdrop-blur-sm" style="background-color: ${getNetworkColor(item.network)}40; color: ${getNetworkColor(item.network)}; border: 1px solid ${getNetworkColor(item.network)}80;">
              ${item.network}
            </span>
            <span class="font-bold text-white">${item.bundle}</span>
          </div>
          <p class="text-xs text-white/70 mb-1">To: <strong>${item.receiver}</strong></p>
          <p class="text-xs text-white/70 mb-2">From: <strong>${item.sender}</strong></p>
          <div class="flex items-center justify-between">
            <span class="font-bold text-green-300 text-sm">GHS ${item.amount}</span>
            <span class="px-2 py-1 bg-yellow-600/40 text-xs rounded text-yellow-200 font-semibold border border-yellow-500/40 backdrop-blur-sm">${item.status}</span>
          </div>
        </div>
        <div class="flex flex-col gap-2 flex-shrink-0">
          <button onclick="removeCart(${index})" class="px-3 py-2 bg-red-600/40 hover:bg-red-600/60 text-red-200 rounded-lg transition text-lg font-bold hover:scale-110 active:scale-95 border border-red-500/40 backdrop-blur-sm flex items-center justify-center w-10 h-10" title="Remove item">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `;
    cartList.appendChild(cartItem);
  });
}

// Helper: Get network color
function getNetworkColor(network) {
  const colors = {
    MTN: "#fbbf24",
    Telecel: "#ef4444",
    AirtelTigo: "#3b82f6",
  };
  return colors[network] || "#fff";
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Add item to cart
function addToCart(paid = false, ref = "") {
  const network = document.getElementById("network").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const bundle = document.getElementById("bundleSize").value;
  const receiver = document.getElementById("phone").value;
  const sender = document.getElementById("senderPhone").value;
  if (!network || !amount || !bundle || !receiver || !sender) {
    Swal.fire("Incomplete", "Fill all fields", "warning");
    return;
  }
  const item = {
    network,
    amount,
    bundle,
    receiver,
    sender,
    status: paid ? "Processing" : "Pending",
    ref,
    created: Date.now(),
  };
  cart.push(item);
  saveCart();
  updateCartUI();
  animateStatus(cart.length - 1);
}

// Remove single item
function removeCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
  Swal.fire("Removed", "Item removed from cart", "success");
}

// Clear cart
function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
  Swal.fire("Cleared", "Cart cleared", "success");
}

// Checkout cart
function checkoutCart() {
  if (cart.length === 0) {
    Swal.fire("Empty", "Cart is empty", "warning");
    return;
  }
  Swal.fire("Redirecting", "Proceed to payment page", "info");
}

// Toggle cart panel
cartBtn.onclick = (e) => {
  e.stopPropagation();
  cartPanel.style.display = "flex";
  setTimeout(() => {
    cartPanel.style.opacity = "1";
  }, 10);
};

// Close cart panel
function closeCart() {
  cartPanel.style.opacity = "0";
  setTimeout(() => {
    cartPanel.style.display = "none";
  }, 300);
}

// Animate status changes
function animateStatus(idx) {
  if (cart[idx].status === "Pending") {
    setTimeout(() => {
      cart[idx].status = "Processing";
      saveCart();
      document.querySelectorAll("#cartItems .cart-item")[idx].querySelector(".text-yellow-200").textContent = "Processing";
      setTimeout(() => {
        cart[idx].status = "Delivered";
        saveCart();
        document.querySelectorAll("#cartItems .cart-item")[idx].querySelector(".text-yellow-200").textContent = "Delivered";
      }, 5 * 60 * 1000);
    }, 60 * 1000);
  }
}

// Remove old orders >1 day
cart = cart.filter((item) => Date.now() - item.created < 24 * 60 * 60 * 1000);
saveCart();
updateCartUI();
