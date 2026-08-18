const button = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

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
