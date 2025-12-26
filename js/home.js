/*
  Home page logic for Nadzine Emporium
  - Brand: Nadzine Emporium
  - Tagline: Elegance in every drop
  - WhatsApp: 0101338152
  - Email: nadzineemporium@gmail.com
  - Supabase project switched to new URL/anon key
*/

// Supabase configuration
const SUPABASE_URL = 'https://hhbhkzfoemfowxftgktb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoYmhremZvZW1mb3d4ZnRna3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTMyNzQsImV4cCI6MjA4MjIyOTI3NH0.6DeVz_OR0l6FECAqG7x52fU-nCaFazcklUU6jfg5-RE';
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM references
const mainContent = document.getElementById('mainContent');
const leftCatList = document.getElementById('leftCatList');
const searchInput = document.getElementById('searchInput');
const emailOverlay = document.getElementById('emailOverlay');
const emailForm = document.getElementById('emailForm');
const cartBtn = document.getElementById('cartBtn');
const cartCountBadge = document.getElementById('cartCount');
const mobileCatList = document.getElementById('mobileCatList');
const mobileCatToggle = document.getElementById('mobileCatToggle');
const mobileCatPanel = document.getElementById('mobileCatPanel');

// Local cart
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
function saveCart(){ localStorage.setItem('cart', JSON.stringify(cart)); }
function updateCartCount(){ if (cartCountBadge) cartCountBadge.innerText = cart.length; }
updateCartCount();

// Build cart drawer if not present
(function ensureCartDrawer(){
  if (document.getElementById('cartDrawer')) return;
  const drawer = document.createElement('div');
  drawer.id = 'cartDrawer';
  drawer.className = 'fixed top-0 right-0 w-80 max-w-full h-full bg-white shadow-lg p-4 hidden z-50';
  drawer.innerHTML = `
    <h2 class="text-lg font-bold mb-4">Your Cart</h2>
    <div id="cartItems" class="space-y-3"></div>
    <div class="mt-4 border-t pt-3">
      <p class="font-bold">Total: Ksh <span id="cartTotal">0</span></p>
      <div class="flex gap-2 mt-3">
        <button id="cartWhatsApp" class="bg-green-600 text-white px-3 py-2 rounded w-1/2">WhatsApp</button>
        <button id="cartEmail" class="bg-blue-600 text-white px-3 py-2 rounded w-1/2">Email</button>
      </div>
    </div>
    <button id="cartClose" class="absolute top-2 right-2 text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  `;
  document.body.appendChild(drawer);
  document.getElementById('cartClose').onclick = closeCart;
  document.getElementById('cartWhatsApp').onclick = checkoutWhatsApp;
  document.getElementById('cartEmail').onclick = checkoutEmail;
})();

function openCart(){ renderCart(); document.getElementById('cartDrawer').classList.remove('hidden'); }
function closeCart(){ document.getElementById('cartDrawer').classList.add('hidden'); }
if (cartBtn) cartBtn.onclick = openCart;

function renderCart(){
  const wrap = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  wrap.innerHTML = '';
  let total = 0;
  if (cart.length === 0) { wrap.innerHTML = "<p class='text-gray-500'>Your cart is empty</p>"; totalEl.innerText = 0; return; }
  cart.forEach((item, idx) => {
    total += Number(item.price) || 0;
    const row = document.createElement('div');
    row.className = 'flex gap-2 items-center border-b pb-2';
    row.innerHTML = `
      <img src="${item.image_url}" alt="${item.title}" class="w-12 h-12 object-contain">
      <div class="flex-1">
        <p class="font-bold text-sm">${item.title}</p>
        <p class="text-xs text-gray-600">Ksh ${item.price}</p>
      </div>
      <button class="text-red-600" aria-label="Remove">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 7V5a2 2 0 114 0v2" />
        </svg>
      </button>
    `;
    row.querySelector('button').onclick = () => { cart.splice(idx, 1); saveCart(); updateCartCount(); renderCart(); };
    wrap.appendChild(row);
  });
  totalEl.innerText = total;
}

function checkoutWhatsApp(){
  if (cart.length === 0) return alert('Your cart is empty!');
  let msg = '🛒 *New Order from Nadzine Emporium*\n\n';
  let total = 0; cart.forEach((item, i) => { msg += `${i+1}. ${item.title} - Ksh ${item.price}\n`; total += Number(item.price)||0; });
  msg += `\n----------------------\n💰 *Total:* Ksh ${total}\n\n`;
  msg += '📍 Please confirm delivery details.';
  window.open(`https://wa.me/0101338152?text=${encodeURIComponent(msg)}`, '_blank');
}
function checkoutEmail(){
  if (cart.length === 0) return alert('Your cart is empty!');
  let subject = '🛒 New Cart Order - Nadzine Emporium';
  let body = 'Hello Nadzine Emporium,\n\nI\'d like to order the following products:\n\n';
  let total = 0; cart.forEach((item, i) => { body += `${i+1}. ${item.title} - Ksh ${item.price}\n`; total += Number(item.price)||0; });
  body += `\n----------------------\nTotal: Ksh ${total}\n\n`;
  body += 'Customer details:\nName: __________\nPhone: __________\nLocation: __________';
  window.location.href = `mailto:nadzineemporium@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Categories
function buildLeftCategories(categories){
  if (leftCatList) leftCatList.innerHTML = '';
  if (mobileCatList) mobileCatList.innerHTML = '';
  (categories || []).forEach(cat => {
    const li = document.createElement('li');
    li.innerHTML = `<a class="block px-2 py-1 rounded hover:bg-gray-100" href="shop.html?main=${encodeURIComponent(cat)}">${cat}</a>`;
    if (leftCatList) leftCatList.appendChild(li.cloneNode(true));
    if (mobileCatList) mobileCatList.appendChild(li);
  });
}

if (mobileCatToggle && mobileCatPanel){
  mobileCatToggle.addEventListener('click', () => mobileCatPanel.classList.toggle('hidden'));
}

// Products fetching + rendering
let allProducts = [];
async function fetchProducts(){
  const { data, error } = await client.from('Products').select('*');
  if (error) { console.error('❌ Error fetching products:', error); return; }
  allProducts = (data||[]).map(p => ({
    ...p,
    category: p.category || p.main_category || 'Uncategorized',
    sub_category: p.sub_category || p.subcategory || '',
    description: p.description || ''
  }));
  const categories = (window.MAIN_CATEGORIES && Array.isArray(window.MAIN_CATEGORIES) && window.MAIN_CATEGORIES.length)
    ? window.MAIN_CATEGORIES
    : Array.from(new Set(allProducts.map(p => p.category).filter(Boolean))).sort();
  buildLeftCategories(categories);
  buildHomeSections(allProducts);
}

function buildHomeSections(products){
  const map = new Map();
  products.forEach(p => {
    const mc = p.category || 'Uncategorized';
    if (!map.has(mc)) map.set(mc, []);
    map.get(mc).push(p);
  });
  const cats = Array.from(map.keys()).sort();
  if (mainContent) mainContent.innerHTML = '';
  cats.forEach(cat => {
    const list = map.get(cat).slice();
    list.sort(() => Math.random() - 0.5);
    const sample = list.slice(0, 6);
    const section = document.createElement('section');
    section.className = 'space-y-3';
    section.innerHTML = `
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">${cat}</h2>
        <a href="shop.html?main=${encodeURIComponent(cat)}" class="text-rose-600 hover:underline">See more</a>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" data-cat="${cat}"></div>
    `;
    if (mainContent) mainContent.appendChild(section);
    const container = section.querySelector('[data-cat]');
    sample.forEach(p => container.appendChild(renderCard(p)));
  });
  if (window.initHoverZoom) window.initHoverZoom();
}

function renderCard(product){
  const disc = (product.original_price && product.original_price>0)
    ? Math.round(((product.original_price - product.price)/product.original_price)*100) : 0;
  const el = document.createElement('div');
  el.className = 'bg-white p-3 rounded shadow text-center';
  el.innerHTML = `
    <a href="product.html?id=${encodeURIComponent(product.id)}" class="block">
      <img src="${product.image_url}" alt="${product.title}" class="h-32 mx-auto object-contain mb-2">
      <h3 class="text-sm font-bold line-clamp-2">${product.title}</h3>
    </a>
    <p class="text-xs line-through text-gray-500">${product.original_price ? 'Ksh ' + product.original_price : ''}</p>
    <p class="text-rose-600 font-bold">Ksh ${product.price}</p>
    ${disc?`<span id="discount-badge" class="discount-badge text-xs inline-block mt-1">${disc}% OFF</span>`:''}
    <div class="mt-3 flex justify-center gap-2">
      <a href="https://wa.me/0101338152?text=${encodeURIComponent('I want ' + product.title)}" target="_blank" class="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 32 32" fill="currentColor"><path d="M16 .5C7.6.5.5 7.6.5 16c0 2.8.7 5.5 2.2 7.9L0 32l8.3-2.7c2.3 1.3 5 2 7.7 2 8.4 0 15.5-7.1 15.5-15.5S24.4.5 16 .5zM16 29c-2.4 0-4.8-.6-6.9-1.8l-.5-.3-4.9 1.6 1.6-4.8-.3-.5C3.6 21 3 18.6 3 16 3 9.4 9.4 3 16 3s13 6.4 13 13-6.4 13-13 13zm7.3-9.8c-.4-.2-2.3-1.1-2.6-1.2s-.6-.2-.8.2c-.2.4-1 1.2-1.2 1.4s-.4.3-.8.1c-.4-.2-1.6-.6-3-2-1.1-1.1-1.9-2.3-2.1-2.7s0-.6.2-.8.4-.4.6-.6c.2-.2.3-.4.4-.6.1-.2 0-.5 0-.7s-.8-2-1.1-2.8c-.3-.8-.6-.7-.8-.7h-.7c-.2 0-.7.1-1.1.5s-1.4 1.4-1.4 3.4 1.4 3.9 1.6 4.1c.2.2 2.7 4.2 6.5 5.9.9.4 1.7.7 2.2.9.9.3 1.6.3 2.2.2.7-.1 2.3-1 2.6-1.9.3-.9.3-1.7.2-1.9-.1-.2-.3-.3-.7-.5z"/></svg>
        WhatsApp
      </a>
      <button class="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" data-email>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm8 7 8-5H4l8 5zm0 2-8-5v10h16V8l-8 5z"/></svg>
        Email
      </button>
    </div>
  `;
  el.querySelector('[data-email]').onclick = () => openEmailForm(product.title);
  return el;
}

// Email overlay
function openEmailForm(productTitle){
  if (!emailOverlay) return;
  emailOverlay.classList.remove('hidden');
  const message = `I want ${productTitle}`;
  const pi = document.getElementById('productInfo');
  const msgEl = document.getElementById('message');
  if (pi) pi.value = productTitle;
  if (msgEl) msgEl.value = message;
}
const cancelEmailBtn = document.getElementById('cancelEmail');
if (cancelEmailBtn) cancelEmailBtn.onclick = function(){ emailOverlay.classList.add('hidden'); };

if (emailForm) emailForm.onsubmit = function(e){
  e.preventDefault();
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const location = document.getElementById('location').value;
  const product = document.getElementById('productInfo').value;
  const emailMessage = document.getElementById('message').value;
  const body = `Product: ${product}%0AName: ${name}%0APhone: ${phone}%0ALocation: ${location}%0AMessage: ${emailMessage}`;
  window.location.href = `mailto:nadzineemporium@gmail.com?subject=Product Inquiry&body=${body}`;
  emailOverlay.classList.add('hidden');
};

// Search behavior
const searchBtn = document.getElementById('searchBtn');
if (searchBtn){
  searchBtn.addEventListener('click', () => {
    const q = (searchInput?.value || '').trim();
    window.location.href = `shop.html?q=${encodeURIComponent(q)}`;
  });
  searchInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchBtn.click(); });
}

// Kickoff
fetchProducts();
