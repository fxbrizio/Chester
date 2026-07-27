const cartCount = document.getElementById('cartCount');
const cartList = document.getElementById('cartList');
const cartToggle = document.getElementById('cartToggle');
const categoryButtons = document.querySelectorAll('.category-chip');
const productCards = document.querySelectorAll('.product-card');
const detailBox = document.getElementById('productDetail');
const detailContent = document.getElementById('detailContent');
const closeDetailButton = document.getElementById('closeDetail');
const filterLabel = document.getElementById('filterLabel');
const offerCards = document.querySelectorAll('.offer-card');
const offerButtons = document.querySelectorAll('.offer-btn');
const searchInput = document.getElementById('searchInput');

const cartStorageKey = 'chesterCart';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(cartStorageKey)) || {};
  } catch (error) {
    return {};
  }
}

function saveCart() {
  localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
}

let cartItems = loadCart();
let activeCategory = 'all';

const productDetails = {
  'Chaqueta ligera': {
    emoji: '🧥',
    description: 'Una chaqueta ligera ideal para el día a día, con un ajuste cómodo y una apariencia moderna para salir a caminar, trabajar o viajar.',
    price: 18,
    stock: 12,
    rating: '4.8/5',
    badge: 'Nuevo',
    features: ['Material transpirable', 'Cierre suave y práctico', 'Ideal para primavera y otoño'],
    comments: [
      { user: 'Marta', text: 'Muy cómoda y se ve elegante. La recomiendo.' },
      { user: 'Leo', text: 'Llegó rápido y el material se siente de calidad.' }
    ]
  },
  'Mini jardín': {
    emoji: '🪴',
    description: 'Un mini jardín decorativo que aporta frescura y estilo a tu habitación, escritorio o rincón favorito.',
    price: 14,
    stock: 8,
    rating: '4.6/5',
    badge: 'Oferta',
    features: ['Fácil de ubicar', 'Diseño limpio y natural', 'Perfecto para ambientar espacios pequeños'],
    comments: [
      { user: 'Sofía', text: 'Se ve muy bonito y le dio vida al escritorio.' },
      { user: 'Tomás', text: 'Muy buen regalo, llegó en perfecto estado.' }
    ]
  },
  'Cargador portátil': {
    emoji: '🔋',
    description: 'Un cargador compacto, rápido y confiable para tus dispositivos cuando estás fuera de casa o de viaje.',
    price: 22,
    stock: 15,
    rating: '4.9/5',
    badge: 'Top',
    features: ['Carga rápida', 'Ligero y fácil de transportar', 'Compatible con varios dispositivos'],
    comments: [
      { user: 'Nico', text: 'Me ha salvado varias veces en viajes cortos.' },
      { user: 'Dani', text: 'Muy práctico y el acabado se siente premium.' }
    ]
  },
  'Mochila urbana': {
    emoji: '🎒',
    description: 'Una mochila urbana espaciosa y funcional, pensada para ir a clases, al trabajo o para tus escapadas diarias.',
    price: 26,
    stock: 10,
    rating: '4.7/5',
    badge: 'Envío gratis',
    features: ['Compartimentos cómodos', 'Diseño moderno', 'Muy práctica para cargar essentials'],
    comments: [
      { user: 'Ana', text: 'Tiene mucho espacio y se ve muy bien.' },
      { user: 'Pablo', text: 'Ideal para llevar todo en el día a día.' }
    ]
  }
};

function slugify(text) {
  return text.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}

function openDetailOverlay() {
  detailBox.classList.add('active');
  detailBox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeDetailOverlay() {
  detailBox.classList.remove('active');
  detailBox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function renderCart() {
  const totalItems = Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  if (totalItems === 0) {
    cartList.innerHTML = '<li>Tu carrito está vacío</li>';
    return;
  }

  cartList.innerHTML = Object.entries(cartItems)
    .map(([name, item]) => `<li>${name} × ${item.quantity}</li>`)
    .join('');
}

function showProductDetail(card) {
  const name = card.dataset.name;
  const description = card.dataset.desc;
  const price = card.dataset.price;
  const image = card.querySelector('.product-image')?.getAttribute('src') || '';
  const details = productDetails[name] || {
    emoji: '✨',
    description,
    price,
    stock: 12,
    rating: '4.7/5',
    badge: 'Popular',
    features: ['Diseño funcional', 'Entrega rápida', 'Calidad garantizada'],
    comments: [
      { user: 'Cliente', text: 'Muy buen producto y fácil de usar.' }
    ]
  };

  detailContent.innerHTML = `
    <div class="detail-hero">
      <div class="detail-visual">
        <img src="${image}" alt="${name}" />
      </div>
      <div>
        <span class="preview-pill">${details.badge}</span>
        <h3>${name}</h3>
        <p>${details.description}</p>
      </div>
    </div>
    <div class="detail-meta">
      <span>⭐ ${details.rating}</span>
      <span>⚡ Envío en 24h</span>
      <span>📦 Stock: ${details.stock}</span>
    </div>
    <div class="detail-price-row">
      <strong>$${price}</strong>
      <button class="buy-btn preview-btn">Añadir al carrito</button>
    </div>
    <div class="detail-section">
      <h4>¿Por qué te va a gustar?</h4>
      <ul>
        ${details.features.map((feature) => `<li>${feature}</li>`).join('')}
      </ul>
    </div>
    <div class="detail-section">
      <h4>Comentarios reales de clientes</h4>
      <div class="comments-list">
        ${details.comments.map((comment) => `
          <article class="comment-card">
            <strong>${comment.user}</strong>
            <p>${comment.text}</p>
          </article>
        `).join('')}
      </div>
    </div>
  `;

  const previewButton = detailContent.querySelector('.preview-btn');
  previewButton.addEventListener('click', () => {
    addToCart(name);
  });

  history.pushState(null, '', `#${slugify(name)}`);
  openDetailOverlay();
}

function addToCart(name) {
  if (cartItems[name]) {
    cartItems[name].quantity += 1;
  } else {
    cartItems[name] = { quantity: 1 };
  }

  saveCart();
  renderCart();
}

function filterProducts(category, query = '') {
  activeCategory = category;
  let visibleCount = 0;

  productCards.forEach((card) => {
    const text = `${card.dataset.name} ${card.dataset.desc}`.toLowerCase();
    const matchesCategory = category === 'all' || card.dataset.category === category;
    const matchesQuery = !query || text.includes(query.toLowerCase());
    const matches = matchesCategory && matchesQuery;

    card.style.display = matches ? 'block' : 'none';
    if (matches) visibleCount += 1;
  });

  if (query) {
    filterLabel.textContent = `Mostrando resultados para "${query}"`;
  } else if (category === 'all') {
    filterLabel.textContent = 'Mostrando todos';
  } else {
    filterLabel.textContent = `Mostrando ${category}`;
  }

  if (visibleCount > 0) {
    const firstVisible = Array.from(productCards).find((card) => card.style.display !== 'none');
    if (firstVisible) {
      productCards.forEach((card) => card.classList.remove('selected'));
      firstVisible.classList.add('selected');
    }
  } else {
    filterLabel.textContent = 'No hay coincidencias';
  }
}

categoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    categoryButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    filterProducts(button.dataset.category, searchInput.value);
  });
});

searchInput.addEventListener('input', () => {
  filterProducts(activeCategory, searchInput.value);
});

productCards.forEach((card) => {
  card.addEventListener('click', () => {
    productCards.forEach((item) => item.classList.remove('selected'));
    card.classList.add('selected');
    const slug = card.dataset.product || slugify(card.dataset.name);
    window.location.href = `product.html?product=${encodeURIComponent(slug)}`;
  });

  const buyButton = card.querySelector('.buy-btn');
  buyButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const name = card.dataset.name;
    addToCart(name);
    buyButton.textContent = 'Añadido';
    buyButton.classList.add('added');
  });
});

offerButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    offerCards.forEach((card) => card.classList.remove('active'));
    button.closest('.offer-card').classList.add('active');
  });
});

offerCards.forEach((card) => {
  card.addEventListener('click', () => {
    offerCards.forEach((item) => item.classList.remove('active'));
    card.classList.add('active');
  });
});

cartToggle.addEventListener('click', () => {
  document.getElementById('carrito').scrollIntoView({ behavior: 'smooth' });
});

closeDetailButton.addEventListener('click', closeDetailOverlay);
detailBox.addEventListener('click', (event) => {
  if (event.target === detailBox) {
    closeDetailOverlay();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeDetailOverlay();
  }
});

renderCart();
filterProducts('all');

const initialHash = window.location.hash.substring(1);
if (initialHash) {
  const matchingCard = Array.from(productCards).find((card) => slugify(card.dataset.name) === initialHash);
  if (matchingCard) {
    productCards.forEach((item) => item.classList.remove('selected'));
    matchingCard.classList.add('selected');
    showProductDetail(matchingCard);
  }
}
