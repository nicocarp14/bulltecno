const button = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

const cart = JSON.parse(localStorage.getItem('bulltecno-cart') || '[]');
const cartPanel = document.querySelector('#cart-panel');
const cartOverlay = document.querySelector('#cart-overlay');
const cartItems = document.querySelector('#cart-items');
const cartCount = document.querySelector('#cart-count');
const cartTotal = document.querySelector('#cart-total');
const money = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
const parsePrices = (value) => value.split(',').map((tier) => { const [quantity, price] = tier.split(':').map(Number); return { quantity, price }; });
const unitPrice = (item) => item.prices.reduce((current, tier) => item.quantity >= tier.quantity ? tier.price : current, item.prices[0].price);
const saveCart = () => localStorage.setItem('bulltecno-cart', JSON.stringify(cart));

function openCart() { cartPanel.classList.add('is-open'); cartOverlay.classList.add('is-open'); cartPanel.setAttribute('aria-hidden', 'false'); }
function closeCart() { cartPanel.classList.remove('is-open'); cartOverlay.classList.remove('is-open'); cartPanel.setAttribute('aria-hidden', 'true'); }

function renderCart() {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0);
  cartCount.textContent = itemCount;
  cartTotal.textContent = money(total);
  if (!cart.length) { cartItems.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>'; return; }
  cartItems.innerHTML = cart.map((item, index) => {
    const price = unitPrice(item);
    return `<article class="cart-item"><div><h3>${item.name}</h3><div class="cart-item-price">${money(price)} c/u · ${money(price * item.quantity)}</div><div class="cart-quantity"><button type="button" data-action="decrease" data-index="${index}">−</button><span>${item.quantity}</span><button type="button" data-action="increase" data-index="${index}">+</button></div></div><button type="button" class="cart-remove" data-action="remove" data-index="${index}">Quitar</button></article>`;
  }).join('');
}

document.querySelectorAll('.add-to-cart').forEach((productButton) => productButton.addEventListener('click', () => {
  const name = productButton.dataset.product;
  const minimum = Number(productButton.dataset.minimum);
  const prices = parsePrices(productButton.dataset.prices);
  const existing = cart.find((item) => item.name === name);
  if (existing) existing.quantity += minimum;
  else cart.push({ name, minimum, prices, quantity: minimum });
  saveCart(); renderCart(); openCart();
}));

cartItems.addEventListener('click', (event) => {
  const action = event.target.dataset.action;
  if (!action) return;
  const index = Number(event.target.dataset.index);
  const item = cart[index];
  if (action === 'increase') item.quantity += 1;
  if (action === 'decrease') item.quantity = Math.max(item.minimum, item.quantity - 1);
  if (action === 'remove') cart.splice(index, 1);
  saveCart(); renderCart();
});
document.querySelector('#cart-trigger')?.addEventListener('click', openCart);
document.querySelector('#cart-close')?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);
document.querySelectorAll('.checkout-button').forEach((checkoutButton) => checkoutButton.addEventListener('click', () => {
  if (!cart.length) return;
  const detail = cart.map((item) => { const price = unitPrice(item); return `• ${item.name}\n  Cantidad: ${item.quantity}\n  Precio unitario: ${money(price)}\n  Subtotal: ${money(price * item.quantity)}`; }).join('\n\n');
  const total = cart.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0);
  const message = `Hola, quiero realizar este pedido en Bulltecno:\n\n${detail}\n\nTotal estimado: ${money(total)}`;
  window.open(`https://wa.me/${checkoutButton.dataset.phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
}));
renderCart();

button?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  button.setAttribute('aria-expanded', String(open));
  button.textContent = open ? '×' : '☰';
});

document.querySelectorAll('.nav a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  button?.setAttribute('aria-expanded', 'false');
  if (button) button.textContent = '☰';
}));
