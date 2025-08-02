import { App } from "obsidian";
import {PetSize} from "./types";

export class Ball {
	el: HTMLElement;
	app: App;
	position: { x: number; y: number };
	private velocity: { x: number; y: number };

	constructor(app: App, startX: number, startY: number, petSize: PetSize) {
		this.app = app;
		this.position = { x: startX, y: startY };
		this.velocity = { x: (Math.random() * 10) - 5, y: -10 }; // Start with an upward and random horizontal velocity

		const size = {
			[PetSize.nano]: 5,
			[PetSize.small]: 10,
			[PetSize.medium]: 15,
			[PetSize.large]: 20,
		}[petSize];

		this.el = document.createElement('div');
		this.el.addClass('pet-ball');
		this.el.style.position = 'absolute';
		this.el.style.width = `${size}px`;
		this.el.style.height = `${size}px`;
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
		const size = parseInt(this.el.style.width);
		// Gravity
		this.velocity.y += 0.5;

		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		// Bounce off the floor
		if (this.position.y > viewHeight - size) {
			this.position.y = viewHeight - size;
			this.velocity.y *= -0.7; // Lose some energy on bounce
		}

		// Bounce off walls
		if (this.position.x < 0 || this.position.x > viewWidth - size) {
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
