const productList = document.getElementById('productList');
const searchInput = document.getElementById('search');
const fuseOptions = {
  keys: ['name'],
  threshold: 0.3,
};
const fuse = new Fuse(products, fuseOptions);
let cart = {};

function addToCart(product, quantity) {
  const cartItemId = Date.now();
  cart[cartItemId] = {
    id: cartItemId,
    name: product.name,
    supplier: product.supplier,
    manufacturer: product.manufacturer,
    partNumber: product.partNumber,
    articleNumber: product.articleNumber,
    usedAtCustomer: product.usedAtCustomer,
    quantity: quantity,
	minOrderQuantity: product.minOrderQuantity, // Add this line
    orderUnit: product.orderUnit, // Add this line
  };
  alert('Product added to the cart!');
}

function renderCart() {
  const cartList = document.getElementById('cart');
  cartList.innerHTML = '';

  for (const cartItemId in cart) {
    const cartItem = cart[cartItemId];
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item';

    const minOrderQuantity = cartItem.minOrderQuantity || 1;
    const orderUnit = cartItem.orderUnit || 'stuks?';

    const itemContainer = document.createElement('div');
    itemContainer.className = 'd-flex align-items-center justify-content-between';

    const itemInfo = document.createElement('span');
    itemInfo.textContent = `${cartItem.name} [${cartItem.manufacturer}, ${cartItem.partNumber}]@[${cartItem.supplier}, ${cartItem.articleNumber}] <${cartItem.usedAtCustomer}>`;

    const actionContainer = document.createElement('div');
    actionContainer.className = 'd-flex align-items-center';

    const quantityInput = document.createElement('input');
    quantityInput.className = 'form-control form-control-sm w-auto';
    quantityInput.type = 'number';
    quantityInput.min = minOrderQuantity;
    quantityInput.value = cartItem.quantity;
    quantityInput.step = minOrderQuantity;
    quantityInput.style.marginRight = '5px';
    quantityInput.style.width = '40px'; // Set a fixed width
    quantityInput.addEventListener('change', () => {
      cart[cartItemId].quantity = parseInt(quantityInput.value);
    });

    const orderUnitSpan2 = document.createElement('span');
    orderUnitSpan2.textContent = `${cartItem.orderUnit}`;
    orderUnitSpan2.style.marginRight = '5px';
    orderUnitSpan2.style.width = '70px'; // Set a fixed width

    const removeButton = document.createElement('button');
    removeButton.className = 'btn btn-sm btn-outline-danger';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      delete cart[cartItemId];
      renderCart();
    });

    actionContainer.appendChild(quantityInput);
    actionContainer.appendChild(orderUnitSpan2);
    actionContainer.appendChild(removeButton);

    itemContainer.appendChild(itemInfo);
    itemContainer.appendChild(actionContainer);

    listItem.appendChild(itemContainer);
    cartList.appendChild(listItem);
  }
}

function renderProducts(productsToRender) {
  productList.innerHTML = '';

  productsToRender.forEach(product => {
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item';

    const minOrderQuantity = product.minOrderQuantity || 1;
    const orderUnit = product.orderUnit || 'stuks?';

    const itemContainer = document.createElement('div');
    itemContainer.className = 'd-flex align-items-center justify-content-between';
	
    const productInfo = document.createElement('span');
    productInfo.textContent = `${product.name} [${product.manufacturer}, ${product.partNumber}] <${product.usedAtCustomer}>`;

    const actionContainer = document.createElement('div');
    actionContainer.className = 'd-flex align-items-center';

    const quantityInput = document.createElement('input');
    quantityInput.className = 'form-control form-control-sm w-auto';
    quantityInput.type = 'number';
    quantityInput.min = minOrderQuantity;
    quantityInput.value = minOrderQuantity;
    quantityInput.step = minOrderQuantity;
    quantityInput.style.marginRight = '5px';
    quantityInput.style.width = '40px'; // Set a fixed width

    const orderUnitSpan = document.createElement('span');
    orderUnitSpan.textContent = `${orderUnit}`;
    orderUnitSpan.style.marginRight = '5px';
    orderUnitSpan.style.width = '70px'; // Set a fixed width

    const addToCartButton = document.createElement('button');
    addToCartButton.className = 'btn btn-sm btn-outline-primary';
    addToCartButton.textContent = 'Add to Cart';
    addToCartButton.addEventListener('click', () => {
      if (product.name === 'Add non-available article') {
        const customName = prompt('Enter custom product description:');
        if (!customName || customName.trim() === '') {
          return;
        }

        addToCart({ ...product, name: customName }, parseInt(quantityInput.value));
      } else {
        addToCart(product, parseInt(quantityInput.value));
      }
    });

    actionContainer.appendChild(quantityInput);
    actionContainer.appendChild(orderUnitSpan);
    actionContainer.appendChild(addToCartButton);

    itemContainer.appendChild(productInfo);
    itemContainer.appendChild(actionContainer);

    listItem.appendChild(itemContainer);
    productList.appendChild(listItem);
  });
}


function prepareCSV() {
  const suppliers = {};

  for (const cartItemId in cart) {
    const cartItem = cart[cartItemId];
    const supplier = cartItem.supplier;

    if (!suppliers[supplier]) {
      suppliers[supplier] = [];
    }

    suppliers[supplier].push([
      cartItem.articleNumber,
      cartItem.quantity
    ]);
  }

  return suppliers;
}

searchInput.addEventListener('input', () => {
  const searchValue = searchInput.value.trim();
  if (searchValue === '') {
    renderProducts(products);
  } else {
    const searchResults = fuse.search(searchValue);
    renderProducts(searchResults.map(result => result.item));
  }
});

document.getElementById('checkout').addEventListener('click', () => {
  const csvFiles = prepareCSV();
  let emailBodyAsInCart = 'As in the cart:\n\n';
  let emailBodySortedBySupplier = 'Sorted by supplier:\n\n';

  // Loop through the original cart items (as they appear in the shopping cart)
  Object.values(cart).forEach(cartItem => {
    emailBodyAsInCart += `Name: ${cartItem.name}, Quantity: ${cartItem.quantity} \n`;
  });

  // Loop through the sorted cart items (sorted by supplier)
  const sortedCartItems = Object.values(cart).sort((a, b) => {
    // Check for undefined or null suppliers
    const aSupplier = a.supplier || '';
    const bSupplier = b.supplier || '';
    return aSupplier.localeCompare(bSupplier);
  });

	let currentSupplier = ''; // Add this line to declare currentSupplier
  
  sortedCartItems.forEach(cartItem => {
    if (cartItem.supplier !== currentSupplier) {
      currentSupplier = cartItem.supplier;
      emailBodySortedBySupplier += `Supplier: ${currentSupplier}\n`;
    }

    emailBodySortedBySupplier += `Name: ${cartItem.name}, Quantity: ${cartItem.quantity}, ${cartItem.articleNumber}, [${cartItem.manufacturer}#${cartItem.partNumber}] \n`;
  });

  // Combine the two email body strings
  const emailBody = emailBodyAsInCart + '\n' + emailBodySortedBySupplier;

  for (const supplier in csvFiles) {
    const csvContent = csvFiles[supplier].map(row => row.join(';')).join('\n');
    const blob = new Blob([csvContent], {type: "text/csv"});
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${supplier}_${Date.now()}.csv`;
    link.click();
  }

  // Email sending
  window.location.href = `mailto:your-email@example.com?subject=Order%20Details&body=${encodeURIComponent(emailBody)}`;
});

renderProducts(products);

// Page navigation
document.getElementById('goToCart').addEventListener('click', () => {
  renderCart();
  document.getElementById('storePage').classList.add('d-none');
  document.getElementById('cartPage').classList.remove('d-none');
});

document.getElementById('backToStore').addEventListener('click', () => {
  document.getElementById('cartPage').classList.add('d-none');
  document.getElementById('storePage').classList.remove('d-none');
});