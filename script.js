const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');
const cart = JSON.parse(localStorage.getItem('bulltecno-cart') || '[]');
const cartModal = document.querySelector('#cart-modal');
const cartOverlay = document.querySelector('#cart-modal-overlay');
const cartItems = document.querySelector('#cart-modal-items');
const cartTotal = document.querySelector('#cart-modal-total');
const cartCounts = document.querySelectorAll('.cart-count');
const toast = document.querySelector('#add-toast');
let toastTimer;

menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? '×' : '☰';
});

document.querySelectorAll('.nav a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  if (menuButton) menuButton.textContent = '☰';
}));

const money = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
const parsePrices = (value) => value.split(',').map((tier) => { const [quantity, price] = tier.split(':').map(Number); return { quantity, price }; });
const unitPrice = (item) => item.prices.reduce((current, tier) => item.quantity >= tier.quantity ? tier.price : current, item.prices[0].price);
const saveCart = () => localStorage.setItem('bulltecno-cart', JSON.stringify(cart));

function openCart() { cartModal.classList.add('is-open'); cartOverlay.classList.add('is-open'); cartModal.setAttribute('aria-hidden', 'false'); }
function closeCart() { cartModal.classList.remove('is-open'); cartOverlay.classList.remove('is-open'); cartModal.setAttribute('aria-hidden', 'true'); }
function showToast() { clearTimeout(toastTimer); toast.classList.add('is-visible'); toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3500); }

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0);
  cartCounts.forEach((cartCount) => { cartCount.textContent = count; });
  cartTotal.textContent = money(total);
  if (!cart.length) { cartItems.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>'; return; }
  cartItems.innerHTML = cart.map((item, index) => { const price = unitPrice(item); return `<article class="cart-item"><div><h3>${item.name}</h3><div class="cart-item-price">${money(price)} c/u · ${money(price * item.quantity)}</div><div class="cart-quantity"><button type="button" data-action="minus" data-index="${index}">−</button><input class="cart-quantity-input" type="number" inputmode="numeric" min="${item.minimum}" value="${item.quantity}" data-index="${index}" aria-label="Cantidad de ${item.name}"><button type="button" data-action="plus" data-index="${index}">+</button></div></div><button class="cart-remove" type="button" data-action="remove" data-index="${index}">Quitar</button></article>`; }).join('');
}

document.querySelectorAll('.add-to-cart').forEach((button) => button.addEventListener('click', () => {
  const name = button.dataset.product;
  const minimum = Number(button.dataset.minimum);
  const prices = parsePrices(button.dataset.prices);
  const existing = cart.find((item) => item.name === name);
  if (existing) existing.quantity += minimum;
  else cart.push({ name, minimum, prices, quantity: minimum });
  saveCart(); renderCart(); showToast();
}));

cartItems.addEventListener('click', (event) => {
  const action = event.target.dataset.action;
  if (!action) return;
  const index = Number(event.target.dataset.index);
  const item = cart[index];
  if (action === 'plus') item.quantity += 1;
  if (action === 'minus') item.quantity = Math.max(item.minimum, item.quantity - 1);
  if (action === 'remove') cart.splice(index, 1);
  saveCart(); renderCart();
});

cartItems.addEventListener('change', (event) => {
  if (!event.target.matches('.cart-quantity-input')) return;
  const item = cart[Number(event.target.dataset.index)];
  const quantity = Number(event.target.value);
  item.quantity = Number.isFinite(quantity) ? Math.max(item.minimum, Math.floor(quantity)) : item.minimum;
  saveCart(); renderCart();
});

document.querySelectorAll('.cart-trigger, .mobile-cart-button').forEach((trigger) => trigger.addEventListener('click', openCart));
document.querySelector('#cart-modal-close')?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);
document.querySelector('#toast-cart-button')?.addEventListener('click', openCart);

document.querySelectorAll('.checkout-button').forEach((button) => button.addEventListener('click', () => {
  if (!cart.length) { showToast(); return; }
  const detail = cart.map((item) => { const price = unitPrice(item); return `• ${item.name}\n  Cantidad: ${item.quantity}\n  Precio unitario: ${money(price)}\n  Subtotal: ${money(price * item.quantity)}`; }).join('\n\n');
  const total = cart.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0);
  const message = `Hola, quiero realizar este pedido en Bulltecno:\n\n${detail}\n\nTotal estimado: ${money(total)}`;
  const url = `https://wa.me/${button.dataset.phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}));

renderCart();
