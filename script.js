import { v4 as uuidv4 } from 'https://jspm.dev/uuid';
import { menuArray } from './data.js'


//
const customerOrder = {};
initOrder(customerOrder);

//
initMiscButtonListeners();

//
buildAndDisplayMenu(menuArray);
initItemButtonListeners();
updateOrderDisplay(customerOrder);
initOrderItemsListener();

//======================================

//
function initOrder(order) {
	order.items = [];
}

//
function buildAndDisplayMenu(menu) {
	let html = '';

	menu.forEach((item) => {
		const { name, desc, options, id, price, image } = item;

		const optsStr = (options || [])
			.map((opt, i) => (i == 0) ? opt[0].toUpperCase() + opt.slice(1).toLowerCase() : opt.toLowerCase())
			.join('; ');

		html += `
<div class="menu-item" data-uuid="${id}">
	<img class="round-icon item-icon" src="./img/${image}" alt="icon of ${desc}">
	<div class="item-details">
		<h3>${name}</h3>
		<p>${optsStr}</p>
	</div>
	<div class="item-price">$${price}</div>
	<button class="sm-c-btn item-btn fa-solid fa-plus"></button>
</div>`;
	});

	document.getElementById('menu-items').innerHTML = html;
}

//
function initItemButtonListeners() {
	document.querySelectorAll('.item-btn').forEach((btn) => {
		btn.addEventListener('click', (ev) => {
			const itemEl = ev.target.closest('.menu-item');

			addItemToOrder(itemEl.dataset.uuid, customerOrder);
		});
	});
}

//
function addItemToOrder(itemId, order) {
	if (!itemId || !order) return;

	const menuItem = getMenuItemWithId(itemId);

	if (menuItem) {
		const existing = (order.items || []).find((o) => (o.id == itemId));

		if (existing) {
			// item already exists in order items
			existing.count += 1;
		}
		else {
			// item is not in order items
			order.items.push({ id: menuItem.id, item: menuItem, count: 1 });
		}
		updateOrderDisplay(order);
	}
}

//
function getMenuItemWithId(itemId) {
	return menuArray.find((item) => (item.id == itemId));
}

//
function updateOrderDisplay(order) {
	if (!order) return;

	const ordersEl = document.getElementById('order-section');

	const validItems = order.items.filter((o) => (o.count > 0));

	if (validItems.length) {
		let gtotal = 0;
		let html = '';

		validItems.forEach((data) => {
			const desc = (data.count > 1) ? `${data.item.name} (${data.count} x $${data.item.price})` : data.item.name;
			const total = data.count * data.item.price;
	
			html += `
<div class="order-item">
	<button class="sm-c-btn delete-btn fa-solid fa-xmark" data-uuid="${data.id}"></button>
	<p class="order-item-desc">${desc}</p>
	<p class="order-item-total">$${total.toLocaleString()}</p>
</div>`;

			gtotal += total;
		});

		// itemized order list
		document.getElementById('order-items').innerHTML = html;

		// order total
		document.getElementById('order-total').textContent = `$${gtotal.toLocaleString()}`;

		ordersEl.classList.remove('hidden');
	}
	else {
		ordersEl.classList.add('hidden');
	}
}

//
function initOrderItemsListener() {
	document.getElementById('order-items').addEventListener('click', (ev) => {
		const itemId = ev.target.dataset.uuid;
		if (itemId) {
			removeItemFromOrder(itemId, customerOrder);
		}
	});
}

//
function removeItemFromOrder(itemId, order) {
	if (!itemId || !order) return;

	const orderData = order.items.find((o) => (o.id == itemId));
	if (orderData) {
		orderData.count -= 1;
		updateOrderDisplay(order);
	}
}

//
function initMiscButtonListeners() {
	document.getElementById('send-order-btn').addEventListener('click', (ev) => {
		console.log('send-order-btn');
	});
}




