let allProducts = []
let currentSort = 'desc'
const cart = []

const headerMenu = document.querySelector('.header__menu')
const cardElement = document.querySelector('.card')
const filterElement = document.querySelector('.filter')
const cardsDateList = document.querySelector('.cards__date-list')
const cardsCardCount = document.querySelector('.cards__card-count')
const sortBlock = document.querySelector('.cards__date-sort')
const sortBody = document.querySelector('.sort__body')
const sortByText = document.querySelector('#sort-by')
const cartItemsContainer = document.querySelector('.header__card-items')
const headerItemsNum = document.querySelector('.header__items-num')
const mathPrice = document.getElementById('mathPrice')
const actionsCardBtn = document.querySelector('.--actions-card')
const clearCartBtn = document.querySelector('.header__items-del')
const filterCheckboxes = document.querySelectorAll('.filter-toggle__checkbox')

const toggleClass = (element, className = 'active') => {
  if (element) {
    element.classList.toggle(className)
  }
}

const setBodyOverflow = (hidden) => {
  document.body.style.overflow = hidden ? 'hidden' : 'auto'
}

const toggleMenu = () => toggleClass(headerMenu)
const toggleCard = () => toggleClass(cardElement)
const toggleFilter = () => toggleClass(filterElement)

const swiper = new Swiper('.mySwiper', {
  effect: 'fade',
  fadeEffect: { crossFade: true },
  loop: true,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
})

if (sortBlock && sortBody) {
  sortBlock.addEventListener('click', (e) => {
    e.stopPropagation()
    sortBlock.classList.toggle('--active')
    sortBody.classList.toggle('open')
  })
}

document.addEventListener('click', (e) => {
  if (sortBlock && sortBody && !sortBlock.contains(e.target)) {
    sortBlock.classList.remove('--active')
    sortBody.classList.remove('open')
    setBodyOverflow(false)
  }
})

if (sortBody) {
  sortBody.addEventListener('click', (e) => {
    const clickedButton = e.target.closest('.sort__body-btn')
    if (clickedButton) {
      document
        .querySelectorAll('.sort__body-btn')
        .forEach((btn) => btn.classList.remove('--active'))
      clickedButton.classList.add('--active')
      const sortText = clickedButton.textContent.trim()
      if (sortByText) {
        sortByText.textContent = sortText
      }
      switch (sortText) {
        case 'Сначала дорогие':
          currentSort = 'desc'
          break
        case 'Сначала недорогие':
          currentSort = 'asc'
          break
        case 'Сначала популярные':
          currentSort = 'popular'
          break
        case 'Сначала новые':
          currentSort = 'new'
          break
        default:
          currentSort = 'desc'
      }
      applyFiltersAndSort()
      sortBlock.classList.remove('--active')
      sortBody.classList.remove('open')
      setBodyOverflow(false)
    }
  })
}

async function fetchData() {
  try {
    const resp = await fetch('https://679270a56f8379b3.mokky.dev/colors')
    if (!resp.ok) {
      const errorData = await resp.json()
      throw new Error(errorData.message || `HTTP error! status: ${resp.status}`)
    }
    const data = await resp.json()
    return data.map((item, index) => ({
      ...item,
      id: item.id || index + 1,
      price: Number(item.price) || 0,
      count: Number(item.count) || 0,
      rating: Number(item.rating) || 0,
      conact: Boolean(item.conact),
      ex: Boolean(item.ex),
      onsale: Boolean(item.onsale),
      new: Boolean(item.new),
    }))
  } catch (error) {
    console.error('Failed to fetch products:', error)
    if (cardsDateList) {
      cardsDateList.innerHTML =
        '<p class="empty-message">Не удалось загрузить товары. Пожалуйста, попробуйте позже.</p>'
    }
    if (cardsCardCount) {
      cardsCardCount.textContent = '0 товаров'
    }
    return []
  }
}

function renderCards(data) {
  if (!cardsDateList || !cardsCardCount) return
  cardsDateList.innerHTML = ''
  if (data.length === 0) {
    cardsDateList.innerHTML = '<p class="empty-message">Товары не найдены.</p>'
    cardsCardCount.textContent = '0 товаров'
    return
  }
  const lastDigit = data.length % 10
  const lastTwoDigits = data.length % 100
  let nounEnding
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    nounEnding = 'ов'
  } else if (lastDigit === 1) {
    nounEnding = ''
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    nounEnding = 'а'
  } else {
    nounEnding = 'ов'
  }
  cardsCardCount.textContent = `${data.length} товар${nounEnding}`
  const html = data
    .map((item) => {
      const isUnavailable = item.count === 0
      const buttonContent = isUnavailable
        ? 'Не в наличии'
        : `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"
         xmlns="http://www.w3.org/2000/svg">
         <path d="M10 4.16663V15.8333" stroke="#1F2020" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round"/>
         <path d="M4.16699 10H15.8337" stroke="#1F2020" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round"/>
       </svg>`
      return `
        <div class="card__item">
            <img src="${item.image}" alt="${item.title}" class="card__image" loading="lazy" />
            <h3 class="card__title">${item.title}</h3>
            <div class="card__bottom">
                <p class="card__price">${item.price.toLocaleString()} ₽</p>
                <button class="card__btn"
                    ${isUnavailable ? 'disabled' : `onclick='addToCartById(${item.id})'`}>
                    ${buttonContent}
                </button>
            </div>
        </div>
    `
    })
    .join('')
  cardsDateList.innerHTML = html
}

function applyFiltersAndSort() {
  const activeFilters = Array.from(filterCheckboxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.dataset.filter)

  let filteredProducts = [...allProducts]

  activeFilters.forEach((filter) => {
    switch (filter) {
      case 'available':
        filteredProducts = filteredProducts.filter((p) => p.count > 0)
        break
      case 'contract':
        filteredProducts = filteredProducts.filter((p) => p.conact === true)
        break
      case 'exclusive':
        filteredProducts = filteredProducts.filter((p) => p.ex === true)
        break
      case 'sale':
        filteredProducts = filteredProducts.filter((p) => p.onsale === true)
        break
      case 'new':
        filteredProducts = filteredProducts.filter((p) => p.new === true)
        break
    }
  })

  if (currentSort === 'desc' || currentSort === 'asc') {
    filteredProducts.sort((a, b) =>
      currentSort === 'desc' ? b.price - a.price : a.price - b.price
    )
  } else if (currentSort === 'popular') {
    filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  }

  renderCards(filteredProducts)
}

function updateCartUI() {
  if (!cartItemsContainer || !headerItemsNum || !mathPrice || !actionsCardBtn) return

  const cartHeader = cartItemsContainer.querySelector('.header__items-head')
  cartItemsContainer.innerHTML = ''

  if (cartHeader) {
    cartItemsContainer.appendChild(cartHeader)
  }

  let total = 0
  let totalCount = 0

  if (cart.length === 0) {
    const emptyMessage = document.createElement('p')
    emptyMessage.className = 'empty-message'
    emptyMessage.textContent = 'Корзина пуста.'
    cartItemsContainer.appendChild(emptyMessage)
  } else {
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
                <button onclick="decreaseQty(${index})">−</button>
                <span>${quantity}</span>
                <button onclick="increaseQty(${index})">+</button>
            </div>
            <button class="header__item-remove" onclick="removeFromCart(${index})">✕</button>
        </div>
      `
      cartItemsContainer.appendChild(cartItem)
    })
  }

  headerItemsNum.textContent = totalCount
  actionsCardBtn.textContent = totalCount
  mathPrice.textContent = total.toLocaleString()
}

function addToCartById(productId) {
  const productToAdd = allProducts.find((p) => p.id === productId)
  if (!productToAdd) return
  if (productToAdd.count === 0) {
    alert('Извините, этот товар временно отсутствует.')
    return
  }
  const existingCartItem = cart.find((item) => item.product.id === productId)
  if (existingCartItem) {
    if (existingCartItem.quantity < productToAdd.count) {
      existingCartItem.quantity++
    } else {
      alert(
        `Вы достигли максимального количества ${productToAdd.title} в наличии (${productToAdd.count}).`
      )
    }
  } else {
    cart.push({ product: productToAdd, quantity: 1 })
  }
  updateCartUI()
}

function removeFromCart(index) {
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1)
    updateCartUI()
  }
}

function increaseQty(index) {
  if (index >= 0 && index < cart.length) {
    const item = cart[index]
    if (item.quantity < item.product.count) {
      item.quantity++
      updateCartUI()
    } else {
      alert(
        `Вы достигли максимального количества ${item.product.title} в наличии (${item.product.count}).`
      )
    }
  }
}

function decreaseQty(index) {
  if (index >= 0 && index < cart.length) {
    if (cart[index].quantity > 1) {
      cart[index].quantity--
    } else {
      cart.splice(index, 1)
    }
    updateCartUI()
  }
}

function clearCart() {
  cart.length = 0
  updateCartUI()
}

if (clearCartBtn) {
  clearCartBtn.addEventListener('click', clearCart)
}

if (document.querySelector('.filter__body')) {
  document.querySelector('.filter__body').addEventListener('change', (e) => {
    if (e.target.classList.contains('filter-toggle__checkbox')) {
      applyFiltersAndSort()
    }
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  allProducts = await fetchData()
  renderCards(allProducts)
  applyFiltersAndSort()
  updateCartUI()
  document.querySelectorAll('.filter-toggle__checkbox').forEach((cb) => {
    cb.addEventListener('change', applyFiltersAndSort)
  })
})
