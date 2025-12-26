/*
  Product page logic for Nadzine Emporium
  - Uses Supabase (new project)
  - Brand: Nadzine Emporium
  - Tagline context: Elegance in every drop
  - WhatsApp: 0101338152
  - Email: nadzineemporium@gmail.com
  - Compatible with existing product.html element IDs
*/

// Supabase configuration
const SUPABASE_URL = 'https://hhbhkzfoemfowxftgktb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoYmhremZvZW1mb3d4ZnRna3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NTMyNzQsImV4cCI6MjA4MjIyOTI3NH0.6DeVz_OR0l6FECAqG7x52fU-nCaFazcklUU6jfg5-RE';
const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elements
const pImg = document.getElementById('pImg');
const pTitle = document.getElementById('pTitle');
const pCat = document.getElementById('pCat');
const pOriginal = document.getElementById('pOriginal');
const pPrice = document.getElementById('pPrice');
const pDisc = document.getElementById('pDisc');
const btnWhats = document.getElementById('btnWhats');
const btnEmail = document.getElementById('btnEmail');
const btnCart = document.getElementById('btnCart');
const descToggle = document.getElementById('descToggle');
const descText = document.getElementById('descText');
const pThumbs = document.getElementById('thumbs');
const featuresList = document.getElementById('featuresList');
const featuresBox = document.getElementById('featuresBox');
const variantBox = document.getElementById('variantBox');
const variantOptions = document.getElementById('variantOptions');
const relGrid = document.getElementById('relGrid');
const relMore = document.getElementById('relMore');
const cartBtn = document.getElementById('cartBtn');
const cartCountBadge = document.getElementById('cartCount');

// Cart state
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
function saveCart(){ localStorage.setItem('cart', JSON.stringify(cart)); }
function updateCartCount(){ if (cartCountBadge) cartCountBadge.innerText = cart.length; }
updateCartCount();

// Utility
function qs(){ return new URLSearchParams(window.location.search); }
function isNum(v){ return typeof v === 'number' && !Number.isNaN(v); }

// Hover zoom lens on main product image
function initMainImageZoom(){
  const img = pImg;
  if (!img) return;
  let container = img.closest('.zoom-container');
  if (!container){
    container = document.createElement('span');
    container.className = 'zoom-container';
    Object.assign(container.style, { position: 'relative', display: 'inline-block', width: '100%' });
    img.parentNode.insertBefore(container, img);
    container.appendChild(img);
  }
  let lens = container.querySelector('.zoom-lens');
  if (!lens){
    lens = document.createElement('span');
    lens.className = 'zoom-lens';
    container.appendChild(lens);
  }
  Object.assign(lens.style, {
    position: 'absolute', pointerEvents: 'none', width: '140px', height: '140px', borderRadius: '9999px',
    border: '2px solid rgba(255,255,255,0.95)', boxShadow: '0 6px 18px rgba(0,0,0,0.25)', backgroundRepeat: 'no-repeat',
    backgroundImage: `url(${img.src})`, backgroundSize: '200% 200%', opacity: '0', transition: 'opacity .15s ease'
  });
  function updateLensBg(){ lens.style.backgroundImage = `url(${img.src})`; }
  img.removeEventListener('load', updateLensBg); img.addEventListener('load', updateLensBg);
  function move(e){
    const rect = container.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    const x = src.clientX - rect.left; const y = src.clientY - rect.top;
    const lx = Math.max(0, Math.min(rect.width, x)) - lens.offsetWidth/2;
    const ly = Math.max(0, Math.min(rect.height, y)) - lens.offsetHeight/2;
    lens.style.left = lx + 'px'; lens.style.top = ly + 'px';
    const px = Math.max(0, Math.min(1, x / rect.width)) * 100;
    const py = Math.max(0, Math.min(1, y / rect.height)) * 100;
    lens.style.backgroundPosition = px + '% ' + py + '%';
  }
  function enter(){ lens.style.opacity = '1'; }
  function leave(){ lens.style.opacity = '0'; }
  container.addEventListener('mousemove', move);
  container.addEventListener('mouseenter', enter);
  container.addEventListener('mouseleave', leave);
  container.addEventListener('touchmove', move, { passive: true });
  container.addEventListener('touchstart', enter, { passive: true });
  container.addEventListener('touchend', leave);
}

// Cart side drawer (if not present)
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

// Description + features parsing
function parseFeatures(text){
  let features = [];
  let desc = text || '';
  const start = desc.indexOf('[FEATURES]');
  const end = desc.indexOf('[/FEATURES]');
  if (start !== -1 && end !== -1 && end > start){
    const inner = desc.substring(start + 10, end).trim();
    features = inner.split(/\r?\n/).map(s => s.replace(/^[\-•]\s*/, '').trim()).filter(Boolean);
    desc = (desc.slice(0, start) + desc.slice(end + 11)).trim();
  }
  return { features, desc };
}
function normalizeFeatures(featuresField, descriptionText){
  try{
    if (Array.isArray(featuresField)){
      const list = featuresField.map(s => String(s||'').trim()).filter(Boolean);
      return { features: list, desc: descriptionText };
    }
    if (typeof featuresField === 'string' && featuresField.trim()){
      const list = featuresField.split(/\r?\n|,|;|•/).map(s => s.replace(/^[\-•]\s*/, '').trim()).filter(Boolean);
      return { features: list, desc: descriptionText };
    }
    return parseFeatures(descriptionText || '');
  } catch {
    return parseFeatures(descriptionText || '');
  }
}
function renderFeatures(list){
  if (!featuresBox || !featuresList) return;
  if (!list || list.length === 0){ featuresBox.classList.add('hidden'); return; }
  featuresBox.classList.remove('hidden');
  featuresList.innerHTML = list.map(li => `<li>${li}</li>`).join('');
}

// Variants
function parseVariants(prod){
  if (Array.isArray(prod.variants)) {
    const arr = prod.variants
      .map(v => ({ size: String(v.size||'').trim(), price: Number(v.price) }))
      .filter(v => v.size && !Number.isNaN(v.price) && v.price > 0);
    if (arr.length) return arr;
  }
  if (typeof prod.variants === 'string' && prod.variants.trim()) {
    try {
      const parsed = JSON.parse(prod.variants);
      if (Array.isArray(parsed)) {
        const arr = parsed
          .map(v => ({ size: String(v.size||'').trim(), price: Number(v.price) }))
          .filter(v => v.size && !Number.isNaN(v.price) && v.price > 0);
        if (arr.length) return arr;
      }
    } catch {}
  }
  const sizesByCategory = {
    'Mattresses': ['3x6', '3.5x6', '4x6', '5x6', '6x6'],
    'Shoes': ['38','39','40','41','42','43','44','45'],
    'Shoe': ['38','39','40','41','42','43','44','45'],
    'Footwear': ['38','39','40','41','42','43','44','45']
  };
  const main = String(prod.main_category||'').toLowerCase();
  const sub = String(prod.subcategory||'').toLowerCase();
  let sizes = [];
  if (/(mattress|mattresses)/.test(main) || /(mattress|mattresses)/.test(sub)) sizes = sizesByCategory['Mattresses'];
  if (/(shoe|shoes|footwear)/.test(main) || /(shoe|shoes|footwear)/.test(sub)) sizes = sizesByCategory['Shoes'];
  const desc = String(prod.description||'');
  const m = desc.match(/\[SIZES\]([\s\S]*?)\[\/SIZES\]/i);
  if (m){ sizes = m[1].split(/\r?\n|,|;|\s+/).map(s => s.trim()).filter(Boolean); }
  return (sizes||[]).map(sz => ({ size: sz, price: Number(prod.price) }));
}
function setupVariants(prod){
  const variants = parseVariants(prod);
  if (!variantBox) return;
  if (!variants || variants.length === 0){ variantBox.classList.add('hidden'); return; }
  variantBox.classList.remove('hidden');
  if (variantOptions){
    variantOptions.innerHTML = variants.map((v, i) => `
      <label class="inline-flex items-center gap-2 border rounded px-3 py-1 cursor-pointer">
        <input type="radio" name="variant-size" value="${v.size}" data-price="${v.price}" ${i===0?'checked':''} />
        <span>${v.size} <span class="text-xs text-gray-500">(Ksh ${v.price})</span></span>
      </label>
    `).join('');
    const handler = () => {
      const sel = variantOptions.querySelector('input[name="variant-size"]:checked');
      const pv = sel?.getAttribute('data-price');
      if (pv && pPrice) pPrice.textContent = `Ksh ${Number(pv)}`;
    };
    variantOptions.addEventListener('change', handler);
    handler();
  }
}

// Thumbnails from Supabase Storage
function getImageFolderFromUrl(url){
  try{
    const idx = url.indexOf('/product-images/');
    if (idx === -1) return null;
    const path = url.substring(idx + '/product-images/'.length);
    const parts = path.split('/');
    if (parts.length <= 1) return null;
    parts.pop();
    return parts.join('/') + '/';
  } catch { return null; }
}
async function loadThumbnails(imageUrl){
  try{
    if (!pThumbs) return;
    const folder = getImageFolderFromUrl(imageUrl);
    if (!folder) return;
    const { data, error } = await client.storage.from('product-images').list(folder, { limit: 50, sortBy: { column: 'name', order: 'asc' } });
    if (error || !Array.isArray(data) || data.length === 0) return;
    pThumbs.innerHTML = '';
    data.filter(f => f.name && !f.name.startsWith('.')).forEach(file => {
      const url = `${SUPABASE_URL}/storage/v1/object/public/product-images/${folder}${file.name}`;
      const b = document.createElement('button');
      b.className = 'border rounded p-1 hover:ring-2 hover:ring-yellow-500';
      b.innerHTML = `<img src="${url}" class="w-16 h-16 object-contain" alt="thumb">`;
      b.addEventListener('click', () => { if (pImg) { pImg.src = url; initMainImageZoom(); } });
      pThumbs.appendChild(b);
    });
  } catch {}
}

// Fetch + render product
async function fetchProduct(id){
  const { data, error } = await client.from('Products').select('*').eq('id', id).single();
  if (error || !data){
    const content = document.getElementById('content');
    if (content) content.innerHTML = '<p class="p-6">Product not found.</p>';
    return;
  }
  const p = {
    ...data,
    main_category: data.main_category || data.category || 'Uncategorized',
    description: data.description || data.subcategory || ''
  };

  // Media + basic info
  if (pImg){ pImg.src = p.image_url; initMainImageZoom(); }
  loadThumbnails(p.image_url);
  if (pTitle) pTitle.textContent = p.title;
  if (pCat) pCat.textContent = `${p.main_category}${p.subcategory ? ' > ' + p.subcategory : ''}${p.brand ? ' • ' + p.brand : ''}`;
  if (pOriginal) pOriginal.textContent = p.original_price ? `Ksh ${p.original_price}` : '';
  if (pPrice) pPrice.textContent = `Ksh ${p.price}`;

  const disc = (p.original_price && p.original_price>0) ? Math.round(((p.original_price - p.price)/p.original_price)*100) : 0;
  if (disc && pDisc){ pDisc.textContent = `${disc}% OFF`; pDisc.classList.remove('hidden'); pDisc.id = 'discount-badge'; }

  // Description + features
  const { desc: baseDesc, features } = normalizeFeatures(p.features, p.description || '');
  const fullDesc = baseDesc || 'No description available';
  const previewText = fullDesc.length > 220 ? (fullDesc.slice(0, 220) + '...') : fullDesc;
  let expanded = false;
  function renderDesc(){
    if (descText){ descText.textContent = expanded ? fullDesc : previewText; }
    if (descToggle){ descToggle.textContent = expanded ? 'Show less' : 'Read more'; }
  }
  renderFeatures(features);
  renderDesc();
  if (descToggle) descToggle.onclick = () => { expanded = !expanded; renderDesc(); };

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": p.title,
    "image": p.image_url,
    "description": p.description || "",
    "sku": p.id,
    "brand": { "@type": "Brand", "name": p.brand || "Nadzine Emporium" },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "KES",
      "price": p.price,
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "Organization", "name": "Nadzine Emporium" }
    }
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'product-jsonld';
  script.textContent = JSON.stringify(jsonLd);
  document.head.appendChild(script);

  // CTAs
  if (btnWhats) btnWhats.href = `https://wa.me/0101338152?text=${encodeURIComponent('I want ' + p.title)}`;
  if (btnEmail) btnEmail.href = `mailto:nadzineemporium@gmail.com?subject=${encodeURIComponent('Product Inquiry: ' + p.title)}&body=${encodeURIComponent('I am interested in ' + p.title)}`;

  // Variants and cart
  setupVariants(p);
  if (btnCart) btnCart.onclick = () => {
    const selectedRadio = variantOptions?.querySelector('input[name="variant-size"]:checked');
    const selectedSize = selectedRadio?.value || null;
    const variantPrice = selectedRadio?.getAttribute('data-price');
    const priceForCart = variantPrice ? Number(variantPrice) : p.price;
    const titleWithVariant = selectedSize ? `${p.title} (${selectedSize})` : p.title;
    cart.push({ id: p.id, title: titleWithVariant, price: priceForCart, image_url: p.image_url, variant: selectedSize });
    saveCart(); updateCartCount(); alert('Added to cart ✅');
  };

  // Related
  if (relMore) relMore.href = `shop.html?main=${encodeURIComponent(p.main_category)}`;
  const bcCatWrapper = document.getElementById('bcCatWrapper');
  const bcCatLink = document.getElementById('bcCatLink');
  const bcSubWrapper = document.getElementById('bcSubWrapper');
  const bcSubLink = document.getElementById('bcSubLink');
  if (bcCatWrapper && p.main_category){
    bcCatWrapper.classList.remove('hidden');
    if (bcCatLink){ bcCatLink.href = `shop.html?main=${encodeURIComponent(p.main_category)}`; bcCatLink.textContent = p.main_category; }
  }
  if (bcSubWrapper && p.subcategory){
    bcSubWrapper.classList.remove('hidden');
    if (bcSubLink){ bcSubLink.href = `shop.html?main=${encodeURIComponent(p.main_category)}&sub=${encodeURIComponent(p.subcategory)}`; bcSubLink.textContent = p.subcategory; }
  }
  fetchRelated(p);
}

async function fetchRelated(p){
  const { data, error } = await client
    .from('Products')
    .select('*')
    .eq('main_category', p.main_category)
    .neq('id', p.id)
    .limit(12);
  if (error) { console.error(error); return; }
  if (!relGrid) return;
  relGrid.innerHTML = '';
  (data||[]).forEach(item => {
    const el = document.createElement('a');
    el.href = `product.html?id=${encodeURIComponent(item.id)}`;
    el.className = 'bg-white border rounded p-3 shadow hover:shadow-md transition block';
    el.innerHTML = `
      <img src="${item.image_url}" class="h-28 w-full object-contain mb-2" alt="${item.title}">
      <div class="text-sm font-semibold line-clamp-2">${item.title}</div>
      <div class="text-red-600 font-bold">Ksh ${item.price}</div>
    `;
    relGrid.appendChild(el);
  });
  if (window.initHoverZoom) window.initHoverZoom();
}

// Entry
const id = qs().get('id');
if (id) fetchProduct(id);
