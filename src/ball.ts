import { App } from "obsidian";

export class Ball {
	el: HTMLElement;
	app: App;
	position: { x: number; y: number };
	private velocity: { x: number; y: number };

	constructor(app: App, startX: number, startY: number) {
		this.app = app;
		this.position = { x: startX, y: startY };
		this.velocity = { x: (Math.random() * 10) - 5, y: -10 }; // Start with an upward and random horizontal velocity

		this.el = document.createElement('div');
		this.el.addClass('pet-ball');
		this.el.style.position = 'absolute';
		this.el.style.width = '20px';
		this.el.style.height = '20px';
		this.el.style.borderRadius = '50%';
		this.el.style.backgroundColor = 'red';
	}

	spawn(container: HTMLElement) {
		container.appendChild(this.el);
		this.updatePosition();
	}

	private updatePosition() {
		this.el.style.left = `${this.position.x}px`;
		this.el.style.top = `${this.position.y}px`;
	}

	// A simple physics update
	update(viewHeight: number, viewWidth: number) {
		// Gravity
		this.velocity.y += 0.5;

		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		// Bounce off the floor
		if (this.position.y > viewHeight - 20) {
			this.position.y = viewHeight - 20;
			this.velocity.y *= -0.7; // Lose some energy on bounce
		}

		// Bounce off walls
		if (this.position.x < 0 || this.position.x > viewWidth - 20) {
			this.velocity.x *= -1;
		}

		this.updatePosition();
	}

	remove() {
		if (this.el) {
			this.el.remove();
		}
	}
}
