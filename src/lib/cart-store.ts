export function clearCart() {
  try {
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cart:change'));
  } catch {}
}