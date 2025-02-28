// This is a test JavaScript file with repetitive patterns
function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return total;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return total;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Sample data
const items = [
  { name: "Widget", price: 9.99, quantity: 2 },
  { name: "Gadget", price: 14.99, quantity: 1 },
  { name: "Doodad", price: 4.99, quantity: 3 }
];

const total = calculateTotal(items);
console.log(formatCurrency(total));
