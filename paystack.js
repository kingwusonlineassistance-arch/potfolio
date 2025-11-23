// ========== CONFIGURATION ==========
const CONFIG = {
  PAYSTACK_KEY: 'pk_live_ddf8670224e5fd82618ef872c2be73b5502ffc2a', // Your live Paystack public key
  CURRENCY: 'GHS',
  AGENT_FEE: 50,
  AGENT_COMMISSION: 2
};

// Network Configurations with Phone Patterns
const NETWORKS = {
  'MTN': {
    name: 'MTN',
    color: '#fbbf24',
    image: 'mtn.jpg',
    prefixes: ['024', '054', '055', '059', '0244'],
    bundles: {
      6: '1GB', 11: '2GB', 15: '3GB', 20: '4GB', 25: '5GB',
      30: '6GB', 42: '8GB', 45: '10GB', 69: '15GB', 85: '20GB',
      110: '25GB', 132: '30GB', 164: '40GB', 202: '50GB'
    }
  },
  'Telecel': {
    name: 'Telecel/Vodafone',
    color: '#ef4444',
    image: 'telecel.jpg',
    prefixes: ['020', '050'],
    bundles: {
      43: '10GB', 63: '15GB', 80: '20GB', 100: '25GB',
      117: '30GB', 152: '40GB', 189: '50GB'
    }
  },
  'AirtelTigo': {
    name: 'Airtel/Tigo',
    color: '#3b82f6',
    image: 'at.jpg',
    prefixes: ['027', '057', '026', '056'],
    bundles: {
      6: '1GB', 12: '2GB', 15: '3GB', 19: '4GB', 24: '5GB',
      27: '6GB', 32: '7GB', 43: '10GB', 63: '15GB', 82: '20GB',
      102: '25GB', 122: '30GB', 162: '40GB', 198: '50GB'
    }
  }
};

// ========== SECURITY TIPS ==========
const SECURITY_TIPS = [
  '🔒 Use a password manager for strong, unique passwords',
  '🔐 Enable multi-factor authentication (MFA) for extra security',
  '🔄 Never reuse passwords across different accounts',
  '🔄 Update passwords every 3-6 months, especially for financial accounts',
  '👆 Use biometric authentication (fingerprint/face ID) where available',
  '💳 Verify payment details before confirming transactions',
  '💳 Use only secure payment gateways with HTTPS encryption',
  '📱 Enable SMS/email alerts for all transactions',
  '🚫 Avoid public Wi-Fi for sensitive transactions',
  '🎣 Beware of phishing scams in emails and messages',
  '🔍 Double-check recipient details before sending money',
  '📱 Keep your devices updated with the latest security patches',
  '🛡️ Use a VPN on public networks to protect your data',
  '📵 Disable auto-connect for Wi-Fi and Bluetooth',
  '🛡️ Install antivirus software to block malware',
  '🔄 Enable remote wipe for lost or stolen devices',
  '🌐 Limit personal details shared on social media',
  '💬 Use encrypted messaging apps like Signal or WhatsApp',
  '🔍 Review app permissions and revoke unnecessary access',
  '🧹 Clear browser cache and cookies regularly',
  '🕵️ Use private browsing mode for sensitive searches',
  '🛡️ Beware of fake support calls asking for OTPs or passwords',
  '🔍 Verify sender email addresses for signs of spoofing',
  '🎁 Avoid "too good to be true" offers (free data, prizes, etc.)',
  '🔒 Check website URLs for HTTPS and a padlock icon',
  '🚨 Report suspicious activity or scams immediately',
  '📧 Enable email encryption for sensitive communications',
  '📧 Avoid opening unknown email attachments',
  '📧 Use disposable email addresses for sign-ups',
  '🔍 Hover over links to verify their true destination',
  '📧 Unsubscribe from unwanted emails to reduce phishing risks',
  '💾 Backup your data regularly to recover from ransomware',
  '🔥 Use a firewall to block unauthorized access',
  '📶 Secure your home network with WPA3 encryption',
  '📚 Stay updated on the latest cyber threats and scams',
  '💻 Use a dedicated device for banking to minimize risks'
];

// ========== STATE MANAGEMENT ==========
let STATE = {
  selectedNetwork: '',
  selectedAmount: 0,
  bundleSize: '',
  cart: JSON.parse(localStorage.getItem('kingwus_cart')) || []
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setTimeout(showWelcomeModalOnce, 100);
});

window.addEventListener('load', () => {
  setTimeout(hideLoader, 300);
  setTimeout(showWelcomeModalOnce, 200);
});

function initializeApp() {
  renderNetworks();
  setupCartPanel();
  setupAgentModal();
  setupPhoneValidation();
  updateCartUI();
  startDigitalClock();
  setTimeout(hideLoader, 800);
}

// ========== DIGITAL CLOCK ==========
function startDigitalClock() {
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const clockEl = document.getElementById('digitalClock');
    if (clockEl) {
      const timeDisplay = clockEl.querySelector('div');
      if (timeDisplay) {
        timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
      }
    }
  }
  updateClock();
  setInterval(updateClock, 1000);
}

// ========== LOADER ==========
function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.5s ease-out';
    loader.style.pointerEvents = 'none';
    setTimeout(() => {
      if (loader.parentElement) {
        loader.style.display = 'none';
      }
    }, 500);
  }
}

// ========== NETWORK RENDERING WITH IMAGES ==========
function renderNetworks() {
  const container = document.getElementById('networkButtons');
  if (!container) return;
  container.innerHTML = '';
  const icons = {
    'MTN': 'fa-phone',
    'Telecel': 'fa-mobile-alt',
    'AirtelTigo': 'fa-signal'
  };
  for (const [key, network] of Object.entries(NETWORKS)) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col items-center gap-2';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'networkBtn px-0 py-0 rounded-2xl transition-all hover:shadow-lg active:scale-95 overflow-hidden group';
    btn.style.width = '120px';
    btn.style.height = '120px';
    btn.innerHTML = `
      <div class="relative w-full h-full flex items-center justify-center bg-cover bg-center group-hover:scale-110 transition-transform" style="background-image: url('${network.image}'); background-color: ${network.color};">
        <div class="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all flex items-center justify-center">
        </div>
      </div>
    `;
    btn.onclick = (e) => {
      e.preventDefault();
      selectNetwork(key, btn);
    };
    const iconDiv = document.createElement('div');
    iconDiv.className = 'text-center';
    iconDiv.innerHTML = `<i class="fas ${icons[key]} text-2xl transition-all group-hover:scale-125" style="color: ${network.color}; filter: drop-shadow(0 0 4px ${network.color}33);"></i>`;
    wrapper.appendChild(btn);
    wrapper.appendChild(iconDiv);
    container.appendChild(wrapper);
  }
}

function selectNetwork(networkKey, btn) {
  STATE.selectedNetwork = networkKey;
  const network = NETWORKS[networkKey];
  document.getElementById('network').value = networkKey;
  document.querySelectorAll('.networkBtn').forEach(b => {
    b.style.boxShadow = '';
  });
  btn.style.boxShadow = `0 0 30px ${network.color}, 0 8px 16px rgba(0, 0, 0, 0.3)`;
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.placeholder = network.prefixes.join(' / ');
  }
  renderBundles(networkKey);
  resetSelection();
  Swal.fire({
    icon: 'success',
    title: `${network.name} Selected`,
    toast: true,
    position: 'top-end',
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false
  });
}

// ========== PHONE VALIDATION ==========
function setupPhoneValidation() {
  const phoneInputs = ['phone', 'senderPhone'];
  phoneInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 10) {
        value = value.slice(0, 10);
      }
      e.target.value = value;
      validatePhoneNumber(inputId);
    });
    input.addEventListener('blur', () => {
      validatePhoneNumber(inputId);
    });
  });
}

function validatePhoneNumber(inputId) {
  const input = document.getElementById(inputId);
  const validIndicator = document.getElementById(inputId + 'Valid');
  if (!input || !validIndicator) return;
  const phone = input.value.trim();
  const network = STATE.selectedNetwork;
  if (!phone) {
    input.classList.remove('valid-input', 'invalid-input');
    validIndicator.classList.add('hidden');
    return;
  }
  if (phone.length !== 10) {
    input.classList.remove('valid-input');
    input.classList.add('invalid-input');
    validIndicator.classList.add('hidden');
    return;
  }
  if (network && isValidPhoneForNetwork(phone, network)) {
    input.classList.remove('invalid-input');
    input.classList.add('valid-input');
    validIndicator.classList.remove('hidden');
    validIndicator.style.color = '#10b981';
    validIndicator.textContent = '✓';
  } else {
    input.classList.remove('valid-input');
    if (network) {
      input.classList.add('invalid-input');
      validIndicator.classList.add('hidden');
    }
  }
}

function isValidPhoneForNetwork(phone, network) {
  const networkData = NETWORKS[network];
  if (!networkData) return false;
  const prefix = phone.slice(0, 3);
  return networkData.prefixes.includes(prefix);
}

// ========== BUNDLE RENDERING ==========
function renderBundles(network) {
  const optionsDiv = document.getElementById('bundleOptions');
  if (!optionsDiv) return;
  optionsDiv.innerHTML = '';
  const networkData = NETWORKS[network];
  if (!networkData) return;
  for (const price in networkData.bundles) {
    const size = networkData.bundles[price];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'amountBtn px-2 md:px-3 py-2 md:py-3 border-2 border-white text-white rounded-lg hover:bg-white/20 transition-all active:scale-95 text-sm md:text-base font-semibold';
    btn.innerHTML = `<div class="font-bold">GHS ${price}</div><div class="text-xs text-white/70">${size}</div>`;
    btn.onclick = (e) => {
      e.preventDefault();
      selectAmount(price, size, btn);
    };
    optionsDiv.appendChild(btn);
  }
}

function selectAmount(amount, size, btn) {
  STATE.selectedAmount = amount;
  STATE.bundleSize = size;
  document.getElementById('amount').value = amount;
  document.getElementById('bundleSize').value = size;
  document.querySelectorAll('.amountBtn').forEach(b => {
    b.classList.remove('bg-green-500', 'border-green-400', 'ring-2', 'ring-green-400');
    b.style.boxShadow = '';
  });
  btn.classList.add('bg-green-500', 'border-green-400', 'ring-2', 'ring-green-400');
  btn.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.6)';
  const summaryEl = document.getElementById('summary');
  if (summaryEl) {
    summaryEl.innerHTML = DOMPurify.sanitize(`
      <div class="flex flex-col items-center gap-3 w-full">
        <div class="flex items-center gap-3 text-lg md:text-xl">
          <span class="text-3xl">📦</span>
          <span>You'll receive <strong class="text-green-400">${size}</strong> for <strong class="text-yellow-300">GHS ${amount}</strong></span>
        </div>
      </div>
    `);
  }
  const receiverFields = document.getElementById('receiverFields');
  if (receiverFields) {
    receiverFields.classList.remove('hidden');
    receiverFields.style.animation = 'fadeInDown 0.4s ease-out';
  }
}

// ========== FORM RESET ==========
function resetSelection() {
  STATE.selectedAmount = 0;
  STATE.bundleSize = '';
  document.getElementById('amount').value = '';
  document.getElementById('bundleSize').value = '';
  document.getElementById('summary').innerHTML = '';
  const receiverFields = document.getElementById('receiverFields');
  if (receiverFields) {
    receiverFields.classList.add('hidden');
  }
}

// ========== CART MANAGEMENT ==========
function setupCartPanel() {
  const cartButton = document.getElementById('cartButton');
  const cartPanel = document.getElementById('cartPanel');
  if (cartButton) {
    cartButton.addEventListener('click', (e) => {
      e.stopPropagation();
      openCart();
    });
  }
  if (cartPanel) {
    cartPanel.addEventListener('click', (e) => {
      if (e.target.id === 'cartPanel') {
        closeCart();
      }
    });
  }
}

function openCart() {
  const cartPanel = document.getElementById('cartPanel');
  if (cartPanel) {
    cartPanel.style.display = 'flex';
    setTimeout(() => {
      cartPanel.style.opacity = '1';
    }, 10);
  }
}

function closeCart() {
  const cartPanel = document.getElementById('cartPanel');
  if (cartPanel) {
    cartPanel.style.opacity = '0';
    setTimeout(() => {
      cartPanel.style.display = 'none';
    }, 300);
  }
}

function toggleCart(event) {
  event.stopPropagation();
  const cartPanel = document.getElementById('cartPanel');
  if (cartPanel && cartPanel.style.display === 'flex' && cartPanel.style.opacity === '1') {
    closeCart();
  } else {
    openCart();
  }
}

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  const itemsContainer = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  const cartSummary = document.getElementById('cartSummary');
  const subtotal = document.getElementById('subtotal');
  const itemCount = document.getElementById('itemCount');
  const cartTotal = document.getElementById('cartTotal');
  if (!badge || !itemsContainer) return;
  badge.textContent = STATE.cart.length;
  if (cartCount) cartCount.textContent = `${STATE.cart.length} items`;
  if (STATE.cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="text-center text-white/50 py-8">
        <i class="fas fa-inbox text-4xl mb-2"></i>
        <p class="text-lg">Cart is empty</p>
      </div>
    `;
    if (cartSummary) cartSummary.classList.add('hidden');
    return;
  }
  if (cartSummary) cartSummary.classList.remove('hidden');
  itemsContainer.innerHTML = '';
  let total = 0;
  STATE.cart.forEach((item, index) => {
    total += parseFloat(item.amount);
    const network = NETWORKS[item.network];
    const networkColor = network ? network.color : '#fff';
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item p-4 rounded-lg border-l-4 transition-all hover:shadow-lg';
    cartItem.style.borderLeftColor = networkColor;
    cartItem.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    cartItem.innerHTML = DOMPurify.sanitize(`
      <div class="flex justify-between items-start gap-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-1 rounded text-xs font-bold" style="background-color: ${networkColor}50; color: ${networkColor}">
              ${item.network}
            </span>
            <span class="font-bold text-white">${item.bundleSize}</span>
          </div>
          <p class="text-xs text-white/70 mb-1">To: <strong>${item.receiverPhone}</strong></p>
          <p class="text-xs text-white/70 mb-2">From: <strong>${item.senderPhone}</strong></p>
          <div class="flex items-center justify-between">
            <span class="font-bold text-green-300 text-sm">GHS ${item.amount}</span>
            <span class="px-2 py-1 bg-yellow-600/40 text-xs rounded text-yellow-200 font-semibold">${item.status}</span>
          </div>
        </div>
        <button onclick="removeCartItem(${index})" class="px-2 py-1 bg-red-600/20 hover:bg-red-600/50 text-red-300 rounded transition text-lg font-bold hover:scale-110 active:scale-95">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `);
    itemsContainer.appendChild(cartItem);
  });
  if (subtotal) subtotal.textContent = `GHS ${total.toFixed(2)}`;
  if (itemCount) itemCount.textContent = STATE.cart.length;
  if (cartTotal) cartTotal.textContent = `GHS ${total.toFixed(2)}`;
}

function removeCartItem(index) {
  STATE.cart.splice(index, 1);
  saveCart();
  updateCartUI();
  Swal.fire({
    icon: 'success',
    title: 'Item Removed',
    toast: true,
    position: 'top-end',
    timer: 1500,
    timerProgressBar: true,
    showConfirmButton: false
  });
}

function clearCart() {
  Swal.fire({
    title: 'Clear Cart?',
    text: 'This will remove all items from your cart',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, Clear It!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      STATE.cart = [];
      saveCart();
      updateCartUI();
      Swal.fire({
        icon: 'success',
        title: 'Cart Cleared',
        toast: true,
        position: 'top-end',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
      });
    }
  });
}

function saveCart() {
  localStorage.setItem('kingwus_cart', JSON.stringify(STATE.cart));
}

// ========== ADD TO CART ==========
function addToCart() {
  const phone = document.getElementById('phone').value.trim();
  const senderPhone = document.getElementById('senderPhone').value.trim();
  const email = document.getElementById('email').value.trim();
  if (!STATE.selectedNetwork || !STATE.selectedAmount || !phone || !senderPhone || !email) {
    Swal.fire({
      icon: 'error',
      title: 'Incomplete Form',
      text: 'Please fill in all required fields',
      confirmButtonColor: '#ef4444'
    });
    return;
  }
  if (phone.length !== 10) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Phone Number',
      text: 'Phone number must be 10 digits',
      confirmButtonColor: '#ef4444'
    });
    return;
  }
  if (!isValidPhoneForNetwork(phone, STATE.selectedNetwork)) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Network Number',
      text: `This number doesn't match the selected ${STATE.selectedNetwork} network. Please check and try again.`,
      confirmButtonColor: '#ef4444'
    });
    return;
  }
  if (senderPhone.length !== 10) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Phone Number',
      text: 'Sender phone number must be 10 digits',
      confirmButtonColor: '#ef4444'
    });
    return;
  }
  if (!email.includes('@')) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Email',
      text: 'Please enter a valid email address',
      confirmButtonColor: '#ef4444'
    });
    return;
  }
  const cartItem = {
    network: STATE.selectedNetwork,
    amount: STATE.selectedAmount,
    bundleSize: STATE.bundleSize,
    receiverPhone: phone,
    senderPhone: senderPhone,
    email: email,
    status: 'Pending',
    timestamp: Date.now()
  };
  STATE.cart.push(cartItem);
  saveCart();
  updateCartUI();
  addToHistory({
    network: STATE.selectedNetwork,
    amount: STATE.selectedAmount,
    bundleSize: STATE.bundleSize,
    receiverPhone: phone,
    senderPhone: senderPhone,
    email: email,
    status: 'Added'
  });
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.classList.add('animate-pulse');
    setTimeout(() => badge.classList.remove('animate-pulse'), 1000);
  }
  document.getElementById('phone').value = '';
  document.getElementById('senderPhone').value = '';
  document.getElementById('email').value = '';
  document.getElementById('phone').classList.remove('valid-input', 'invalid-input');
  document.getElementById('senderPhone').classList.remove('valid-input', 'invalid-input');
  document.getElementById('phoneValid').classList.add('hidden');
  document.getElementById('senderPhoneValid').classList.add('hidden');
  resetSelection();
  Swal.fire({
    icon: 'success',
    title: 'Added to Cart!',
    html: `<div><strong>${STATE.bundleSize}</strong> for <strong>GHS ${STATE.selectedAmount}</strong> added to cart</div>`,
    confirmButtonColor: '#10b981',
    timer: 3000,
    timerProgressBar: true
  });
}

// ========== PAYMENT FUNCTIONS ==========
function payCart() {
  try {
    if (STATE.cart.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Empty Cart',
        text: 'Please add items to cart first',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }
    const totalAmount = STATE.cart.reduce((sum, item) => sum + parseFloat(item.amount), 0) * 100; // Convert to kobo
    const email = STATE.cart[0].email;
    if (!email) {
      Swal.fire({
        icon: 'error',
        title: 'Email Missing',
        text: 'Please provide an email address for payment',
        confirmButtonColor: '#ef4444'
      });
      return;
    }
    const handler = PaystackPop.setup({
      key: CONFIG.PAYSTACK_KEY,
      email: email,
      amount: totalAmount,
      currency: CONFIG.CURRENCY,
      onClose: function() {
        Swal.fire({
          icon: 'info',
          title: 'Payment Cancelled',
          text: 'Your payment was not completed',
          confirmButtonColor: '#3b82f6'
        });
      },
      callback: function(response) {
        try {
          STATE.cart.forEach(item => {
            item.status = 'Processing';
          });
          saveCart();
          updateCartUI();
          Swal.fire({
            icon: 'success',
            title: 'Payment Successful!',
            html: `<div>Your bundles are being processed<br><small style="color: #10b981;">Reference: ${response.reference}</small><br><br><small>You will receive SMS confirmation shortly</small></div>`,
            confirmButtonColor: '#10b981'
          });
          setTimeout(() => {
            STATE.cart = [];
            saveCart();
            updateCartUI();
            closeCart();
          }, 3000);
        } catch (err) {
          console.error('Error processing payment callback:', err);
          Swal.fire({
            icon: 'error',
            title: 'Processing Error',
            text: 'There was an issue processing your payment. Please contact support.',
            confirmButtonColor: '#ef4444'
          });
        }
      }
    });
    handler.openIframe();
  } catch (err) {
    console.error('Error in payCart:', err);
    Swal.fire({
      icon: 'error',
      title: 'Payment Error',
      text: 'An error occurred during payment. Please try again later.',
      confirmButtonColor: '#ef4444'
    });
  }
}

// ========== AGENT MODAL ==========
function setupAgentModal() {
  const becomeAgentBtn = document.getElementById('becomeAgentBtn');
  const agentModal = document.getElementById('agentModal');
  if (becomeAgentBtn && agentModal) {
    becomeAgentBtn.addEventListener('click', () => {
      agentModal.classList.remove('hidden');
      agentModal.style.animation = 'fadeIn 0.3s ease-out';
    });
  }
}

function closeAgentModal() {
  const agentModal = document.getElementById('agentModal');
  if (agentModal) {
    agentModal.classList.add('hidden');
  }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const agentModal = document.getElementById('agentModal');
  if (agentModal && !agentModal.classList.contains('hidden') && agentModal.contains(e.target)) {
    if (e.target.id === 'agentModal') {
      closeAgentModal();
    }
  }
});

// ========== AGENT PAYMENT ==========
function payAgent(e) {
  try {
    if (e) e.preventDefault();
    const email = document.getElementById('agentEmail').value.trim();
    const phone = document.getElementById('agentPhone').value.trim();
    if (!email || !phone) {
      Swal.fire({
        icon: 'error',
        title: 'Incomplete Form',
        text: 'Please enter both email and phone number',
        confirmButtonColor: '#ef4444'
      });
      return;
    }
    if (!email.includes('@')) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
        confirmButtonColor: '#ef4444'
      });
      return;
    }
    if (phone.length < 9 || phone.length > 10) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Phone Number',
        text: 'Phone number must be 9-10 digits',
        confirmButtonColor: '#ef4444'
      });
      return;
    }
    // Calculate 2% charge and total amount
    const baseFee = CONFIG.AGENT_FEE;
    const chargePercentage = 2;
    const chargeAmount = (baseFee * chargePercentage) / 100;
    const totalAmount = baseFee + chargeAmount;
    const amountInPesewas = Math.round(totalAmount * 100);
    const handler = PaystackPop.setup({
      key: CONFIG.PAYSTACK_KEY,
      email: email,
      amount: amountInPesewas,
      currency: CONFIG.CURRENCY,
      onClose: function() {
        // Optional: handle close
      },
      callback: function(response) {
        try {
          Swal.fire({
            icon: 'success',
            title: 'Congratulations! 🎉',
            html: `<div>
              <p class="mb-2">You are now a KINGWUS Agent!</p>
              <p class="text-sm text-gray-600 mb-3">Reference: ${response.reference}</p>
              <p class="text-sm mb-3">You now have access to:</p>
              <ul class="text-left text-sm space-y-1">
                <li>✓ Cheaper data rates</li>
                <li>✓ 2% commission per sale</li>
                <li>✓ Priority support</li>
              </ul>
              <p class="text-xs text-gray-600 mt-4">Contact support for your agent dashboard link</p>
            </div>`,
            confirmButtonColor: '#10b981'
          });
          document.getElementById('agentEmail').value = '';
          document.getElementById('agentPhone').value = '';
          setTimeout(() => closeAgentModal(), 2000);
        } catch (err) {
          console.error('Error processing agent callback:', err);
          Swal.fire({
            icon: 'success',
            title: 'Registration Successful!',
            text: 'Your agent registration has been submitted. Check your email for details.',
            confirmButtonColor: '#10b981'
          });
          setTimeout(() => closeAgentModal(), 2000);
        }
      }
    });
    handler.openIframe();
  } catch (err) {
    console.error('Error in payAgent:', err);
    Swal.fire({
      icon: 'error',
      title: 'Registration Error',
      text: 'An error occurred during registration. Please try again later.',
      confirmButtonColor: '#ef4444'
    });
  }
}

// ========== PURCHASE HISTORY ==========
let HISTORY = JSON.parse(localStorage.getItem('kingwus_history')) || [];

function addToHistory(item) {
  const historyItem = {
    ...item,
    purchasedAt: new Date().toLocaleString(),
    timestamp: Date.now()
  };
  HISTORY.unshift(historyItem);
  saveHistory();
  updateHistoryUI();
}

function saveHistory() {
  localStorage.setItem('kingwus_history', JSON.stringify(HISTORY));
}

function updateHistoryUI() {
  const container = document.getElementById('historyContainer');
  if (!container) return;
  const oneDayMs = 24 * 60 * 60 * 1000;
  HISTORY = HISTORY.filter(item => Date.now() - item.timestamp < oneDayMs);
  saveHistory();
  if (HISTORY.length === 0) {
    container.innerHTML = `
      <div class="text-center text-white/50 py-8">
        <i class="fas fa-inbox text-4xl mb-2"></i>
        <p class="text-lg">No purchase history yet</p>
      </div>
    `;
    return;
  }
  container.innerHTML = '';
  HISTORY.forEach((item, index) => {
    const network = NETWORKS[item.network];
    const networkColor = network ? network.color : '#fff';
    const historyItem = document.createElement('div');
    historyItem.className = 'p-4 rounded-lg border-l-4 transition-all hover:shadow-lg bg-white/5';
    historyItem.style.borderLeftColor = networkColor;
    historyItem.innerHTML = DOMPurify.sanitize(`
      <div class="flex justify-between items-start gap-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-1 rounded text-xs font-bold" style="background-color: ${networkColor}50; color: ${networkColor}">
              ${item.network}
            </span>
            <span class="font-bold text-white">${item.bundleSize}</span>
          </div>
          <p class="text-xs text-white/70 mb-1"><i class="fas fa-phone"></i> ${item.receiverPhone}</p>
          <p class="text-xs text-white/70 mb-2"><i class="fas fa-calendar"></i> ${item.purchasedAt}</p>
          <span class="inline-block px-2 py-1 bg-green-600/30 text-xs rounded text-green-300 font-semibold">GHS ${item.amount}</span>
        </div>
      </div>
    `);
    container.appendChild(historyItem);
  });
}

function clearHistory() {
  Swal.fire({
    icon: 'warning',
    title: 'Clear History?',
    text: 'This will delete all purchase history. Are you sure?',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, Clear It'
  }).then((result) => {
    if (result.isConfirmed) {
      HISTORY = [];
      saveHistory();
      updateHistoryUI();
      Swal.fire({
        icon: 'success',
        title: 'Cleared!',
        text: 'Purchase history has been cleared',
        timer: 2000
      });
    }
  });
}

// ========== CLEANUP OLD ORDERS ==========
function cleanupOldOrders() {
  const oneDayMs = 24 * 60 * 60 * 1000;
  STATE.cart = STATE.cart.filter(item => Date.now() - item.timestamp < oneDayMs);
  saveCart();
  HISTORY = HISTORY.filter(item => Date.now() - item.timestamp < oneDayMs);
  saveHistory();
}

// ========== WELCOME MODAL FUNCTIONS ==========
function closeWelcomeModal() {
  const modal = document.getElementById('agentWelcomeModal');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.style.display = 'none';
    }, 500);
    sessionStorage.setItem('welcomeModalShown', 'true');
  }
}

function startAgentRegistration() {
  closeWelcomeModal();
  const modal = document.getElementById('agentModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

// ========== TIME PERIOD INDICATOR ==========
function updateTimePeriodIndicator() {
  const now = new Date();
  const hour = now.getHours();
  let icon = '☀️';
  let greeting = 'Good Morning';
  let color = 'text-yellow-400';
  if (hour >= 5 && hour < 12) {
    icon = '🌅';
    greeting = 'Good Morning';
    color = 'text-yellow-400';
  } else if (hour >= 12 && hour < 16) {
    icon = '☀️';
    greeting = 'Good Afternoon';
    color = 'text-orange-400';
  } else if (hour >= 16 && hour < 21) {
    icon = '🌆';
    greeting = 'Good Evening';
    color = 'text-purple-400';
  } else {
    icon = '🌙';
    greeting = 'Good Night';
    color = 'text-indigo-400';
  }
  const iconElement = document.getElementById('timePeriodIcon');
  const textElement = document.getElementById('timePeriodText');
  if (iconElement) {
    iconElement.textContent = icon;
    iconElement.className = `text-3xl drop-shadow-glow`;
  }
  if (textElement) {
    textElement.textContent = `${greeting} ${icon}`;
  }
}

// Update time period every minute
setInterval(updateTimePeriodIndicator, 60000);
updateTimePeriodIndicator();

// Run cleanup on app start
cleanupOldOrders();

// Initialize history display
updateHistoryUI();

// ========== ONLINE TIPS & QUOTES SYSTEM ==========
let onlineTips = [];
let combinedTips = [...SECURITY_TIPS];
let currentTipIndex = 0;

async function fetchOnlineContent() {
  try {
    const sources = [
      'https://zenquotes.io/api/random',
      'https://api.adviceslip.com/advice'
    ];

    const randomSource = sources[Math.floor(Math.random() * sources.length)];

    if (randomSource.includes('zenquotes')) {
      const response = await fetch(randomSource);
      const data = await response.json();
      if (data && data[0]) {
        onlineTips.push(`${data[0].q} - ${data[0].a}`);
      }
    } else {
      const response = await fetch(randomSource);
      const data = await response.json();
      if (data && data.slip && data.slip.advice) {
        onlineTips.push(`${data.slip.advice}`);
      }
    }

    combinedTips = [...SECURITY_TIPS, ...onlineTips];
    console.log('✓ Online content fetched');
  } catch (error) {
    console.log('Using local tips');
  }
}

// ========== SECURITY TIPS ROTATION ==========
function rotateSecurityTip() {
  const tipElement = document.getElementById('securityTipText');
  if (!tipElement) return;
  const allTips = combinedTips.length > 0 ? combinedTips : SECURITY_TIPS;
  currentTipIndex = Math.floor(Math.random() * allTips.length);
  const tip = allTips[currentTipIndex];
  tipElement.style.opacity = '0';
  tipElement.style.transform = 'translateY(10px)';
  setTimeout(() => {
    tipElement.textContent = '🔐 Tips: ' + tip;
    tipElement.style.transition = 'all 0.5s ease-in-out';
    tipElement.style.opacity = '1';
    tipElement.style.transform = 'translateY(0)';
    tipElement.style.textAlign = 'center';
  }, 300);
}

fetchOnlineContent();
setInterval(rotateSecurityTip, 120000);
setInterval(fetchOnlineContent, 120000);
rotateSecurityTip();

// Show welcome modal once on page load (modal stays until dismissed)
function showWelcomeModalOnce() {
  const modal = document.getElementById('agentWelcomeModal');
  if (!modal) {
    console.warn('Welcome modal element not found');
    return;
  }

  // Check if modal was dismissed in this session
  if (sessionStorage.getItem('agentModalDismissed')) {
    return;
  }

  // Ensure modal is in DOM and visible
  try {
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.offsetHeight; // Force reflow to ensure opacity transition works
    modal.style.opacity = '1';
  } catch (error) {
    console.error('Error displaying welcome modal:', error);
  }
}
