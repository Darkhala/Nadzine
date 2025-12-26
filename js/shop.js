/*
  Shop page logic for Nadzine Emporium
  - Brand: Nadzine Emporium
  - Supabase project switched
  - Rebranded cart flows and contact
*/

// Supabase configuration
const SUPABASE_URL = 'https://hhbhkzfoemfowxftgktb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoYmhremZvZW1mb3d4ZnRna3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTMyNzQsImV4cCI6MjA4MjIyOTI3NH0.6DeVz_OR0l6FECAqG7x52fU-nCaFazcklUU6jfg5-RE';
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM refs
const fSearch = document.getElementById('fSearch');
const fMain = document.getElementById('fMain');
const fSub = document.getElementById('fSub');
const brandBox = document.getElementById('brandBox');
const fSort = document.getElementById('fSort');
const countEl = document.getElementById('count');
const grid = document.getElementById('grid');
const listTitle = document.getElementById('listTitle');
const cartBtn = document.getElementById('cartBtn');
const cartCountBadge = document.getElementById('cartCount');

let all = [];
let view = [];

// Cart
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
function saveCart(){ localStorage.setItem('cart', JSON.stringify(cart)); }
function updateCartCount(){ if (cartCountBadge) cartCountBadge.innerText = cart.length; }
updateCartCount();

// Cart drawer
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

// Filters state & helpers
function qs(){ return new URLSearchParams(window.location.search); }
function setQS(params){ const url = new URL(window.location.href); url.search = params.toString(); window.history.replaceState({}, '', url.toString()); }

function initFiltersFromQS(){
  const p = qs();
  if (fSearch) fSearch.value = p.get('q') || '';
  const main = p.get('main') || '';
  populateMain(main);
  const sub = p.get('sub') || '';
  populateSub(main, sub);
  const sort = p.get('sort') || '';
  if (fSort) fSort.value = sort;
  const price = p.get('price');
  if (price){
    const r = document.querySelector(`input[name="price"][value="${price}"]`);
    if (r) r.checked = true;
  }
}

function populateMain(selected=''){
  if (!fMain) return;
  const list = (window.MAIN_CATEGORIES && Array.isArray(window.MAIN_CATEGORIES) && window.MAIN_CATEGORIES.length)
    ? window.MAIN_CATEGORIES : [];
  fMain.innerHTML = '<option value="">All</option>' + list.map(c => `<option ${selected===c?'selected':''} value="${c}">${c}</option>`).join('');
}
function populateSub(main, selected=''){
  if (!fSub) return;
  const subs = main && window.getSubcategories ? (window.getSubcategories(main) || []) : [];
  if (!subs.length){ fSub.innerHTML = '<option value="">All</option>'; fSub.disabled = true; return; }
  fSub.innerHTML = '<option value="">All</option>' + subs.map(s => `<option ${selected===s?'selected':''} value="${s}">${s}</option>`).join('');
  fSub.disabled = false;
}

function uniqueBrands(list){ return Array.from(new Set(list.map(p => (p.brand||'').trim()).filter(Boolean))).sort(); }
function renderBrands(list){
  if (!brandBox) return;
  const brands = uniqueBrands(list);
  const p = qs();
  const active = new Set((p.get('brands')||'').split(',').filter(Boolean));
  brandBox.innerHTML = brands.map(b => `
    <label class="flex items-center gap-2">
      <input type="checkbox" value="${b}" ${active.has(b)?'checked':''}> ${b}
    </label>
  `).join('');
}

async function fetchAll(){
  const { data, error } = await client.from('Products').select('*').order('id', { ascending: false });
  if (error){ console.error(error); return; }
  all = (data||[]).map(p => ({
    ...p,
    main_category: p.main_category || p.category || 'Uncategorized',
    description: p.description || p.subcategory || ''
  }));
  filterAndRender();
}

function filterAndRender(){
  const p = qs();
  const q = (p.get('q')||'').toLowerCase();
  const main = p.get('main') || '';
  const sub = p.get('sub') || '';
  const sort = p.get('sort') || '';
  const price = p.get('price') || '';
  const brandParam = (p.get('brands')||'').split(',').filter(Boolean);

  view = all.filter(item => {
    if (q && !(`${item.title} ${item.main_category} ${item.subcategory} ${item.brand||''}`.toLowerCase().includes(q))) return false;
    if (main && (item.main_category !== main)) return false;
    if (sub && (item.subcategory !== sub)) return false;
    if (brandParam.length && !brandParam.includes((item.brand||'').trim())) return false;
    if (price){
      const [min,max] = price.split('-').map(Number);
      const pp = Number(item.price)||0;
      if (pp < min || pp > max) return false;
    }
    return true;
  });

  if (sort === 'price_asc') view.sort((a,b)=> (a.price||0) - (b.price||0));
  else if (sort === 'price_desc') view.sort((a,b)=> (b.price||0) - (a.price||0));
  else if (sort === 'newest') view.sort((a,b)=> (b.id||0) - (a.id||0));

  grid.innerHTML = '';
  if (view.length === 0){ grid.innerHTML = '<p class="text-gray-600">No items found.</p>'; }
  view.forEach(p => grid.appendChild(renderCard(p)));
  if (countEl) countEl.textContent = view.length;
  if (listTitle) listTitle.textContent = main ? main : 'Our Shop';
  renderBrands(view.length ? view : all);
}

function renderCard(product){
  const discount = (product.original_price && product.original_price>0)
    ? Math.round(((product.original_price - product.price)/product.original_price)*100)
    : 0;
  const el = document.createElement('div');
  el.className = 'bg-white border rounded shadow p-3 flex flex-col';
  el.innerHTML = `
    <a href="product.html?id=${encodeURIComponent(product.id)}" class="block">
      <img src="${product.image_url}" alt="${product.title}" class="h-40 w-full object-contain rounded mb-2">
      <h3 class="text-sm font-semibold line-clamp-2">${product.title}</h3>
    </a>
    <div class="mt-1">
      <p class="text-xs line-through text-gray-500">${product.original_price ? 'Ksh '+product.original_price : ''}</p>
      <p class="text-rose-600 font-bold">Ksh ${product.price}</p>
      ${discount?`<span id="discount-badge" class="discount-badge text-xs inline-block mt-1">${discount}% OFF</span>`:''}
    </div>
    <div class="mt-2 flex gap-2">
      <button class="flex-1 bg-rose-600 text-white text-sm py-1.5 rounded hover:bg-rose-700" data-add> Add to Cart </button>
      <a class="flex-1 bg-green-600 text-white text-sm py-1.5 rounded text-center hover:bg-green-700" target="_blank" href="https://wa.me/0101338152?text=${encodeURIComponent('I want ' + product.title)}">WhatsApp</a>
    </div>`;
  el.querySelector('[data-add]').onclick = () => { cart.push({ id: product.id, title: product.title, price: product.price, image_url: product.image_url }); saveCart(); updateCartCount(); };
  return el;
}

// Events
if (fMain) fMain.addEventListener('change', () => { populateSub(fMain.value, ''); const p = qs(); p.set('main', fMain.value); p.delete('sub'); setQS(p); filterAndRender(); });
if (fSub) fSub.addEventListener('change', () => { const p = qs(); if (fSub.value) p.set('sub', fSub.value); else p.delete('sub'); setQS(p); filterAndRender(); });
const applyBtn = document.getElementById('applyBtn');
if (applyBtn) applyBtn.addEventListener('click', () => {
  const p = qs();
  const q = (fSearch?.value||'').trim();
  if (q) p.set('q', q); else p.delete('q');
  if (fSort?.value) p.set('sort', fSort.value); else p.delete('sort');
  const pr = document.querySelector('input[name="price"]:checked');
  if (pr) p.set('price', pr.value); else p.delete('price');
  const selectedBrands = Array.from(brandBox?.querySelectorAll('input[type="checkbox"]:checked')||[]).map(i=>i.value);
  if (selectedBrands.length) p.set('brands', selectedBrands.join(',')); else p.delete('brands');
  setQS(p);
  filterAndRender();
});
const clearBtn = document.getElementById('clearBtn');
if (clearBtn) clearBtn.addEventListener('click', () => {
  const p = new URLSearchParams();
  setQS(p);
  if (fSearch) fSearch.value = '';
  populateMain('');
  populateSub('', '');
  document.querySelectorAll('input[name="price"]').forEach(i => i.checked = false);
  if (fSort) fSort.value = '';
  fetchAll();
});

if (fMain) fMain.addEventListener('input', () => populateSub(fMain.value, ''));

// Initialize
initFiltersFromQS();
fetchAll();
