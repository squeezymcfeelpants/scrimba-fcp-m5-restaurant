import { menuArray } from './data.js'

//
const customerOrder = {};
initOrder(customerOrder);

//
initMiscButtonListeners();
initNumberInputListeners();

//
buildAndDisplayMenu(menuArray);
initItemButtonListeners();
updateOrderDisplay(customerOrder);
initOrderItemsListener();

//======================================

//
function initOrder(order) {
	order.items = [];
	order.formData = null;
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
		});

		// itemized order list
		document.getElementById('order-items').innerHTML = html;

		// order total
		document.getElementById('order-total').textContent = `$${getOrderTotalCost(order).toLocaleString()}`;

		ordersEl.classList.remove('hidden');
	}
	else {
		ordersEl.classList.add('hidden');
	}
}

//
function getOrderTotalCost(order) {
	let total = 0;

	if (order) {
		const validItems = order.items.filter((o) => (o.count > 0));

		validItems.forEach((data) => {
			total += (data.count * data.item.price);
		});
	}

	return total;
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
	// send order button
	document.getElementById('send-order-btn').addEventListener('click', onSubmitOrder);

	// payment modal close button
	document.getElementById('payment-modal-close').addEventListener('click', onClosePaymentModal);

	// payment modal pay button
	document.getElementById('pay-btn').addEventListener('click', onPayButton);

	// receipt modal close button
	document.getElementById('receipt-modal-close').addEventListener('click', closeReceiptModal);
}

//
function initNumberInputListeners() {
	document.querySelectorAll('input[type="number"]').forEach((el) => {
		el.addEventListener('keypress', (ev) => {
			const key = ev.keyCode;
			if ((key < 48) || (key > 57)) {
				ev.preventDefault();
			}
		});
	});
}

//
function showModal(id, reset = true) {
	const modalEl = document.getElementById(id);

	if (modalEl) {
		if (reset) {
			modalEl.querySelectorAll('input').forEach((el) => {
				el.value = '';
			});
		}
	
		document.querySelectorAll('.modal').forEach((el) => {
			el.classList.add('hidden');
		});

		modalEl.classList.remove('hidden');
		document.getElementById('modal-container').classList.remove('hidden');
	}
}

//
function hideModal(id) {
	const modalEl = document.getElementById(id);

	if (modalEl) {
		modalEl.classList.add('hidden');

		// assume only one modal active at any time
		document.getElementById('modal-container').classList.add('hidden');
	}
}

//
function onSubmitOrder(ev) {
	const total = getOrderTotalCost(customerOrder);
	if (total) {
		document.getElementById('total-amount-due').textContent = `$${total}`;
		showModal('payment-modal');
	}
}

//
function onClosePaymentModal(ev) {
	hideModal('payment-modal');
}

//
function onPayButton(ev) {
	const formEl = document.getElementById('payment-form');

	formEl.querySelectorAll('input').forEach((el) => {
		el.value = el.value.trim();
	});

	if (formEl.reportValidity()) {
		customerOrder.formData = new FormData(document.getElementById('payment-form'));

		//
		hideModal('payment-modal');

		//
		document.getElementById('receipt-modal-close').setAttribute('disabled', true);
		showModal('receipt-modal');

		//
		processPayment();
	}
}

//
function closeReceiptModal(ev) {
	hideModal('receipt-modal');

	// reset
	initOrder(customerOrder);
	updateOrderDisplay(customerOrder);
}

//
function processPayment() {
	const msgEl = document.getElementById('receipt-message');
	const trailers = ['^-----', '-^----', '--^---', '---^--', '----^-', '-----^'];
	let count = 0;

	function showProcessingMsg() {
		msgEl.textContent = `${trailers[(count % trailers.length)]} Processing ${trailers[(count % trailers.length)]}`;
		++count;
	}

	showProcessingMsg();
	const interval = setInterval(showProcessingMsg, 350);

	setTimeout(() => {
		clearInterval(interval);

		const name = customerOrder.formData?.get('name') || 'patron';
		msgEl.textContent = `Thank you, ${name}. You order is on the way!`;

		document.getElementById('receipt-modal-close').removeAttribute('disabled');
	}, 6000);
}


