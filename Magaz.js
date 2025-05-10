'use strict';

// Загрузка каталога
let allProducts = {};

fetch("Magaz.json").then(response => response.json()).then(data => {
    allProducts = data;
    getProducts(data);
});

function getProducts(data) {
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = ''; // Очищаем каталог
    for (let legoName in data) {
        const legoData = data[legoName];
        const card = getProductCard(legoName, legoData);
        catalog.append(card);
    }
}

function getProductCard(legoName, legoData) {
    const card = document.createElement('div');
    card.className = "lego-card";

    const title = document.createElement('h4');
    title.innerText = legoName;
    card.append(title);

    const slider = getImagesSlider(legoData.images);
    card.append(slider);

    const description = getDescriptionDiv(legoName, legoData);
    card.append(description);

    return card;
}

function getImagesSlider(imagesList) {
    const wrapper = document.createElement('div');
    wrapper.className = "slider-wrapper";

    imagesList.forEach((src, i) => {
        const img = new Image();
        img.src = src;
        img.className = 'slider-image';
        if (i === 0) img.style.display = 'block';
        wrapper.append(img);
    });

    if (imagesList.length > 1) {
        const forward = document.createElement('span');
        forward.className = 'arrow forward material-symbols-outlined';
        forward.textContent = 'arrow_forward';
        forward.onclick = () => showForwardImage(wrapper);
        wrapper.append(forward);

        const back = document.createElement('span');
        back.className = 'arrow back material-symbols-outlined';
        back.textContent = 'arrow_back';
        back.onclick = () => showBackImage(wrapper);
        wrapper.append(back);
    }

    return wrapper;
}

function showForwardImage(slider) {
    const images = slider.querySelectorAll('.slider-image');
    let current = [...images].findIndex(img => img.style.display !== 'none');
    images[current].style.display = 'none';
    let next = (current + 1) % images.length;
    images[next].style.display = 'block';
}

function showBackImage(slider) {
    const images = slider.querySelectorAll('.slider-image');
    let current = [...images].findIndex(img => img.style.display !== 'none');
    images[current].style.display = 'none';
    let prev = (current - 1 + images.length) % images.length;
    images[prev].style.display = 'block';
}

// Работа с корзиной
const productCounter = document.getElementById("counter");
let order = {};
let checkoutButton = null;

const savedData = localStorage.getItem('order');
if (savedData) {
    order = JSON.parse(savedData);
    updateTotalCounter();
}

function updateLocalStorage() {
    localStorage.setItem('order', JSON.stringify(order));
}

function updateTotalCounter() {
    let count = 0;
    for (let key in order) count += order[key];
    productCounter.innerText = count;

    // Показываем или скрываем кнопку "Перейти в корзину"
    if (count > 0) {
        if (!checkoutButton) {
            createCheckoutButton();
        } else {
            checkoutButton.classList.remove('hidden');
        }
    } else if (checkoutButton) {
        checkoutButton.classList.add('hidden');
    }
}

function createCheckoutButton() {
    checkoutButton = document.createElement('button');
    checkoutButton.className = 'checkout-button';
    checkoutButton.innerText = 'Перейти в корзину';
    checkoutButton.onclick = () => {
        window.location.href = 'box.html';
    };

    const catalog = document.getElementById('catalog');
    catalog.parentNode.insertBefore(checkoutButton, catalog.nextSibling);

    if (Object.keys(order).length > 0) {
        checkoutButton.classList.remove('hidden');
    } else {
        checkoutButton.classList.add('hidden');
    }
}

function orderAdd(productKey) {
    if (order[productKey]) {
        order[productKey]++;
    } else {
        order[productKey] = 1;
    }
    updateLocalStorage();
    updateTotalCounter();
    return order[productKey];
}

function orderRemove(productKey) {
    if (!order[productKey]) return 0;
    order[productKey]--;
    if (order[productKey] === 0) delete order[productKey];
    updateLocalStorage();
    updateTotalCounter();
    return order[productKey] || 0;
}

function getDescriptionDiv(productKey, data) {
    const desc = document.createElement('div');
    desc.className = 'lego-description';

    const fields = [
        ['Артикул', data["article number"]],
        ['Линия', data["line"]],
        ['Название', data["name"]],
        ['Год выпуска', data["year"]],
        ['Количество деталей', data["pices"]],
        ['Цена (тенге)', data["price"]]
    ];

    fields.forEach(([label, value]) => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${label}:</strong> ${value}`;
        desc.appendChild(p);
    });

    const orderDiv = document.createElement('div');
    const firstButton = document.createElement('button');
    firstButton.className = 'buy-button';
    firstButton.innerText = 'Купить';

    const removeButton = document.createElement('button');
    removeButton.className = 'change-order-button';
    removeButton.innerText = '-';

    const counterSpan = document.createElement('span');
    counterSpan.className = 'order-counter';

    const addButton = document.createElement('button');
    addButton.className = 'change-order-button';
    addButton.innerText = '+';

    removeButton.onclick = () => {
        const count = orderRemove(productKey);
        updateOrderBlock(count);
    };

    addButton.onclick = () => {
        const count = orderAdd(productKey);
        updateOrderBlock(count);
    };

    firstButton.onclick = () => {
        const count = orderAdd(productKey);
        updateOrderBlock(count);
    };

    function updateOrderBlock(count) {
        counterSpan.innerText = count;
        if (count > 0) {
            firstButton.style.display = 'none';
            removeButton.style.display = 'inline';
            addButton.style.display = 'inline';
            counterSpan.style.display = 'inline';
        } else {
            firstButton.style.display = 'inline';
            removeButton.style.display = 'none';
            addButton.style.display = 'none';
            counterSpan.style.display = 'none';
        }
    }

    orderDiv.append(firstButton, removeButton, counterSpan, addButton);
    desc.append(orderDiv);

    const initial = order[productKey] || 0;
    updateOrderBlock(initial);

    return desc;
}

// Поиск по артикулу
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchIcon = document.getElementById('search-icon');

    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        const filteredProducts = {};

        for (let legoName in allProducts) {
            const legoData = allProducts[legoName];
            if (legoData["article number"].toLowerCase().includes(query)) {
                filteredProducts[legoName] = legoData;
            }
        }

        getProducts(filteredProducts);
    }

    searchInput.addEventListener('input', performSearch);
    searchIcon.addEventListener('click', performSearch);
});

// Анимация падающих кубиков LEGO
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('legoCanvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class LegoBrick {
        constructor() {
            this.width = 20;
            this.height = 20;
            this.x = Math.random() * canvas.width;
            this.y = -this.height;
            this.speed = 2 + Math.random() * 3;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 0.05;
            this.color = ['#ff0000', '#0000ff', '#ffff00', '#00ff00'][Math.floor(Math.random() * 4)];
        }

        update() {
            this.y += this.speed;
            this.rotation += this.rotationSpeed;
            if (this.y > canvas.height + this.height) {
                this.y = -this.height;
                this.x = Math.random() * canvas.width;
                this.speed = 2 + Math.random() * 3;
                this.rotation = Math.random() * 360;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            const studRadius = 3;
            ctx.beginPath();
            ctx.arc(-this.width / 4, -this.height / 4, studRadius, 0, Math.PI * 2);
            ctx.arc(this.width / 4, -this.height / 4, studRadius, 0, Math.PI * 2);
            ctx.arc(-this.width / 4, this.height / 4, studRadius, 0, Math.PI * 2);
            ctx.arc(this.width / 4, this.height / 4, studRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    const bricks = [];
    for (let i = 0; i < 20; i++) {
        bricks.push(new LegoBrick());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        bricks.forEach(brick => {
            brick.update();
            brick.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();
});