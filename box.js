'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Анимация кубиков LEGO
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

    // Логика корзины
    const order = JSON.parse(localStorage.getItem('order')) || {};
    const productCounter = document.getElementById("counter");
    const cartItemsContainer = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");
    const backToShopButton = document.getElementById("back-to-shop");

    // Инициализация корзины
    updateCartCounter();
    checkEmptyCart();

    // Загрузка данных о товарах
    fetch("Magaz.json")
        .then(response => response.json())
        .then(data => {
            displayCartItems(data);
        })
        .catch(error => {
            console.error('Ошибка загрузки данных:', error);
            cartItemsContainer.innerHTML = '<p class="error-message">Не удалось загрузить данные о товарах</p>';
        });

    backToShopButton.addEventListener('click', () => {
        window.location.href = 'Magaz.html';
    });

    function updateCartCounter() {
        let count = 0;
        for (let key in order) {
            if (order[key] > 0) count += order[key];
        }
        productCounter.innerText = count;
        return count;
    }

    function displayCartItems(productsData) {
        cartItemsContainer.innerHTML = '';
        let totalPrice = 0;
        let itemsCount = 0;

        for (const productKey in order) {
            const quantity = order[productKey];
            
            // Пропускаем товары с нулевым количеством
            if (quantity <= 0 || !productsData[productKey]) continue;
            
            itemsCount++;
            const product = productsData[productKey];
            const itemTotal = quantity * parseInt(product.price);
            totalPrice += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.dataset.product = productKey;

            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <h3>${productKey}</h3>
                    <p><strong>Артикул:</strong> ${product["article number"]}</p>
                    <p><strong>Цена за шт:</strong> ${product.price} тенге</p>
                    <p><strong>Количество:</strong> ${quantity}</p>
                    <p><strong>Сумма:</strong> ${itemTotal} тенге</p>
                </div>
                <div class="cart-item-controls">
                    <button class="remove-item" data-product="${productKey}">
                        <span class="material-symbols-outlined">delete</span>
                        Удалить
                    </button>
                </div>
            `;

            cartItemsContainer.appendChild(itemElement);
        }

        // Обновляем итоговую сумму
        totalPriceElement.textContent = totalPrice;

        // Добавляем обработчики событий для кнопок удаления
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const productKey = e.target.closest('button').dataset.product;
                removeFromCart(productKey);
                
                // Перезагружаем данные после изменения
                fetch("Magaz.json")
                    .then(response => response.json())
                    .then(data => displayCartItems(data))
                    .catch(error => console.error('Ошибка:', error));
            });
        });

        checkEmptyCart();
    }

    function removeFromCart(productKey) {
        if (order[productKey]) {
            delete order[productKey];
            localStorage.setItem('order', JSON.stringify(order));
            updateCartCounter();
        }
    }

    function checkEmptyCart() {
        const isEmpty = Object.keys(order).length === 0 || 
                       Object.values(order).every(qty => qty <= 0);
        
        if (isEmpty) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <span class="material-symbols-outlined">shopping_cart</span>
                    <p>Ваша корзина пуста</p>
                </div>
            `;
            totalPriceElement.textContent = '0';
        }
    }
});