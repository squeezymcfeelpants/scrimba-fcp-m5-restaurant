import { v4 as uuidv4 } from 'https://jspm.dev/uuid';
import { menuArray } from './data.js'

// for (let i = 0; i < 10; ++i)
// 	console.log(uuidv4());
// console.log(menuArray);

//
function buildAndDisplayMenu(menu) {
	let html = '';

	menu.forEach((item) => {
		const { name, desc, options, id, price, image } = item;

		const optsStr = (options || [])
			.map((opt, i) => (i == 0) ? opt[0].toUpperCase() + opt.slice(1).toLowerCase() : opt.toLowerCase())
			.join('; ');

		html += `
<article class="menu-item">
	<img class="round-icon item-icon" src="./img/${image}" alt="icon of ${desc}">
	<div class="item-details">
		<h3>${name}</h3>
		<p>${optsStr}</p>
	</div>
	<div class="item-price">$${price}</div>
	<button class="fa-solid fa-plus"></button>
</article>`;
	});

	document.getElementById('menu-items').innerHTML = html;
}

//
buildAndDisplayMenu(menuArray);




