const cart = JSON.parse(localStorage.getItem('bulltecno-cart') || '[]');
const table = document.querySelector('#cart-table');
const summaryCount = document.querySelector('#summary-count');
const summaryTotal = document.querySelector('#summary-total');
const shippingFields = document.querySelector('#shipping-fields');
const formError = document.querySelector('#form-error');
const money = (amount) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
const unitPrice = (item) => item.prices.reduce((current, tier) => item.quantity >= tier.quantity ? tier.price : current, item.prices[0].price);
const save = () => localStorage.setItem('bulltecno-cart', JSON.stringify(cart));

function render() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0);
  summaryCount.textContent = count;
  summaryTotal.textContent = money(total);
  if (!cart.length) { table.innerHTML = '<tr><td colspan="5" class="empty">Tu carrito está vacío. <a href="index.html">Ver productos</a></td></tr>'; return; }
  table.innerHTML = cart.map((item, index) => { const price = unitPrice(item); return `<tr><td><span class="product-name">${item.name}</span><span class="tier-note">Mínimo: ${item.minimum} u.</span></td><td>${money(price)} c/u</td><td><div class="cart-qty"><button type="button" data-action="minus" data-index="${index}">−</button><span>${item.quantity}</span><button type="button" data-action="plus" data-index="${index}">+</button></div></td><td><strong>${money(price * item.quantity)}</strong></td><td><button class="remove" type="button" data-action="remove" data-index="${index}">Quitar</button></td></tr>`; }).join('');
}

table.addEventListener('click', (event) => {
  const action = event.target.dataset.action;
  if (!action) return;
  const index = Number(event.target.dataset.index);
  const item = cart[index];
  if (action === 'plus') item.quantity += 1;
  if (action === 'minus') item.quantity = Math.max(item.minimum, item.quantity - 1);
  if (action === 'remove') cart.splice(index, 1);
  save(); render();
});

document.querySelectorAll('input[name="delivery"]').forEach((radio) => radio.addEventListener('change', () => { shippingFields.hidden = radio.value !== 'envio' || !radio.checked; }));
document.querySelectorAll('.checkout-button').forEach((button) => button.addEventListener('click', () => {
  const delivery = document.querySelector('input[name="delivery"]:checked')?.value;
  const phone = document.querySelector('#phone').value.trim();
  const payment = document.querySelector('#payment').value;
  const address = document.querySelector('#address').value.trim();
  const city = document.querySelector('#city').value.trim();
  const province = document.querySelector('#province').value.trim();
  if (!cart.length) { formError.textContent = 'Agregá al menos un producto al carrito.'; return; }
  if (!delivery || !phone || !payment) { formError.textContent = 'Completá entrega, teléfono y método de pago.'; return; }
  if (delivery === 'envio' && (!address || !city || !province)) { formError.textContent = 'Completá los datos de envío.'; return; }
  formError.textContent = '';
  const details = cart.map((item) => { const price = unitPrice(item); return `• ${item.name}\n  Cantidad: ${item.quantity}\n  Subtotal: ${money(price * item.quantity)}`; }).join('\n\n');
  const total = cart.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0);
  const deliveryText = delivery === 'envio' ? `Envío a: ${address}, ${city}, ${province}` : 'Retiro / coordinación';
  const message = `Hola, quiero realizar este pedido en Bulltecno:\n\n${details}\n\nTotal estimado: ${money(total)}\n${deliveryText}\nTeléfono: ${phone}\nPago: ${payment}`;
  window.open(`https://wa.me/${button.dataset.phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
}));

render();
