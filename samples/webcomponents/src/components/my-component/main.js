customElements.define(
	'my-component',
	class extends HTMLElement {
		constructor() {
			super();

			const typeValue = this.getAttribute('type');

			if (!typeValue) {
				return;
			}

			if (typeValue === 'text') {
				this.textContent = 'Lorem ipsum';
			} else if (typeValue === 'color') {
				this.textContent = this.getAttribute('color')
				this.style.color = this.getAttribute('color')
			} else {
				this.textContent = 'Invalid type'
			}
		}
	}
);
