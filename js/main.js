const toggleMenu = () => {
  const menu = document.querySelector('.header__menu')
  menu.classList.toggle('active')
}

const toggleCard = () => {
  const cardMenu = document.querySelector('.card')
  cardMenu.classList.toggle('active')
}
const swiper = new Swiper('.mySwiper', {
  // 👇 Добавьте эти две строки
  effect: 'fade',
  fadeEffect: {
    crossFade: true,
  },

  loop: true,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
    // type: 'bullets',
  },
})

const checkboxes = document.querySelectorAll('.filter-toggle__checkbox')

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    const filters = Array.from(checkboxes)
      .filter((c) => c.checked)
      .map((c) => c.dataset.filter)

    console.log('Активные фильтры:', filters)
    // Можно вызывать: filterProducts(filters);
  })
})

let allProducts = []
let currentSort = 'desc' // начальная сортировка — сначала дорогие

async function fetchData() {
  const resp = await fetch('https://679270a56f8379b3.mokky.dev/colors')
  const data = await resp.json()
  if (!resp.ok) throw new Error(data.message || 'Something went wrong')

  // Добавим каждому товару уникальный ID (например, по индексу)
  return data.map((item, index) => ({ ...item, id: index + 1 }))
}

function renderCards(data) {
  const container = document.querySelector('.cards__date .cards__date-list')
  const counter = document.querySelector('.cards__date-head span')
  container.innerHTML = ''

  counter.textContent = `${data.length} товар${
    data.length === 1 ? '' : data.length < 5 ? 'а' : 'ов'
  }`

  data.forEach((item) => {
    const card = `
  <div class="card__item">
    <img src="${item.image}" alt="${item.title}" class="card__image" />
    <h3 class="card__title">${item.title}</h3>
    <div class="card__bottom">
      <p class="card__price">${item.price.toLocaleString()} ₽</p>
      <button class="card__btn"${
        item.count === 0
          ? ' disabled'
          : ` onclick='addToCart(${JSON.stringify(item).replace(/'/g, "\\'")})'`
      }>
        ${
          item.count === 0
            ? 'Не в наличии'
            : `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4.16663V15.8333" stroke="#1F2020" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4.16699 10H15.8337" stroke="#1F2020" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`
        }
      </button>
    </div>
  </div>
`

    container.innerHTML += card
  })
}

function applyFiltersAndSort() {
  const checkboxes = document.querySelectorAll('.filter-toggle__checkbox:checked')
  const filters = Array.from(checkboxes).map((cb) => cb.dataset.filter)

  let filtered = [...allProducts]

  filters.forEach((filter) => {
    if (filter === 'available') {
      filtered = filtered.filter((p) => p.count > 0)
    } else if (filter === 'contract') {
      filtered = filtered.filter((p) => p.conact)
    } else if (filter === 'exclusive') {
      filtered = filtered.filter((p) => p.ex)
    } else if (filter === 'sale') {
      filtered = filtered.filter((p) => p.onsale)
    } else if (filter === 'new') {
      // Если появится new флаг — отфильтруем по нему
      filtered = filtered.filter((p) => p.new === true)
    }
  })

  // сортировка по цене
  filtered.sort((a, b) => {
    return currentSort === 'desc' ? b.price - a.price : a.price - b.price
  })

  renderCards(filtered)
}

window.onload = async () => {
  allProducts = await fetchData()
  renderCards(allProducts)

  // фильтры
  document.querySelectorAll('.filter-toggle__checkbox').forEach((cb) => {
    cb.addEventListener('change', applyFiltersAndSort)
  })

  // сортировка
  const sortBtn = document.querySelector('.cards__date-sort')
  const sortLabel = document.querySelector('#sort-by')

  sortBtn.addEventListener('click', () => {
    currentSort = currentSort === 'desc' ? 'asc' : 'desc'
    sortLabel.textContent = currentSort === 'desc' ? 'Сначала дорогие' : 'Сначала дешевые'
    applyFiltersAndSort()
  })
}

const cart = []

function updateCartUI() {
  const itemsContainer = document.querySelector('.header__card-items')
  const countSpan = document.querySelector('.header__items-num')
  const priceTotal = document.getElementById('mathPrice')
  const cartBtn = document.querySelector('.--actions-card')

  const heads = itemsContainer.querySelector('.header__items-head')
  itemsContainer.innerHTML = ''
  itemsContainer.appendChild(heads)

  let total = 0
  let totalCount = 0

  cart.forEach((item, index) => {
    const { product, quantity } = item
    const subtotal = product.price * quantity
    total += subtotal
    totalCount += quantity

    const cartItem = document.createElement('div')
    cartItem.className = 'header__item'
    cartItem.innerHTML = `
      <img src="${product.image}" alt="${product.title}" class="header__item-img" />
      <div class="header__item-info">
          <div>
            <h4 class="header__item-title">${product.title}</h4>
            <p class="header__item-price">${subtotal.toLocaleString()} ₽</p>
          </div>
          <div class="header__item-qty">
              <button onclick="decreaseQty(${index})">
                <svg width="12" height="2" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.3335 1H10.6668" stroke="black" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <span>${quantity}</span>
              <button onclick="increaseQty(${index})">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 1.33325V10.6666" stroke="black" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M1.3335 6H10.6668" stroke="black" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
          </div>
        <button class="header__item-remove" onclick="removeFromCart(${index})">✕</button>
      </div>
      
    `
    itemsContainer.appendChild(cartItem)
  })

  countSpan.textContent = totalCount
  cartBtn.textContent = totalCount
  priceTotal.textContent = total.toLocaleString()
}

function addToCart(product) {
  const existing = cart.find((item) => item.product.id === product.id)

  if (existing) {
    existing.quantity++
  } else {
    cart.push({ product, quantity: 1 })
  }

  updateCartUI()
}

function removeFromCart(index) {
  cart.splice(index, 1)
  updateCartUI()
}

function clearCart() {
  cart.length = 0
  updateCartUI()
}

// Подключим к кнопке "очистить список"
document.querySelector('.header__items-del').addEventListener('click', clearCart)

function increaseQty(index) {
  cart[index].quantity++
  updateCartUI()
}

function decreaseQty(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--
  } else {
    cart.splice(index, 1)
  }
  updateCartUI()
}
