// src/pet.ts

import { App } from "obsidian";
import { PetState } from "./states";

export class Pet {
	el: HTMLElement;
	app: App;
	petType: string;
	petColor: string;

	// New properties for state and movement
	currentState: PetState = PetState.idle;
	private speed = 2; // Pixels per frame
	private direction = 1; // 1 for right, -1 for left
	private position: { x: number, y: number };

	constructor(app: App, petType = 'dog', petColor = 'brown') {
		this.app = app;
		this.petType = petType;
		this.petColor = petColor;
		this.position = { x: 50, y: 0 }; // Start at 50% from left

		this.el = document.createElement('div');
		this.el.addClass('obsidian-pet');
	}

	// Returns the correct path to our media assets.
	private getAssetPath(asset: string): string {
		const pluginId = 'obsidian-pets'; // Must match your manifest.json id
		const plugin = this.app.plugins.getPlugin(pluginId);
		if (!plugin) {
			console.error(`Plugin ${pluginId} not found`);
			return '';
		}
		return this.app.vault.adapter.getResourcePath(
			`${plugin.app.vault.configDir}/plugins/${pluginId}/media/${asset}`
		);
	}

	// NEW: Sets the background image based on the current state
	private updateSprite() {
		let stateSprite = "idle";
		if (this.currentState === PetState.walk) {
			stateSprite = "walk";
		} else if (this.currentState === PetState.run) {
			stateSprite = "run";
		}

		const assetPath = this.getAssetPath(`${this.petType}/${this.petColor}_${stateSprite}_8fps.gif`);
		this.el.style.backgroundImage = `url('${assetPath}')`;

		// Flip the image if moving left
		this.el.style.transform = this.direction === -1 ? 'scaleX(-1)' : 'scaleX(1)';
	}

	// NEW: The main update loop called on every frame
	update(viewWidth: number) {
		// Decide to change state randomly
		if (Math.random() < 0.005) { // 0.5% chance each frame
			this.currentState = Math.random() < 0.5 ? PetState.walk : PetState.idle;
			this.updateSprite();
		}

		// Move the pet if it's not idle
		if (this.currentState === PetState.walk || this.currentState === PetState.run) {
			this.position.x += this.speed * this.direction;

			// Check for boundaries and reverse direction
			if (this.position.x > viewWidth - 50 || this.position.x < 0) {
				this.direction *= -1; // Reverse direction
				this.updateSprite();
			}
		}

		// Apply the new position
		this.el.style.left = `${this.position.x}px`;
	}

	spawn(container: HTMLElement) {
		this.el.style.position = 'absolute';
		this.el.style.bottom = '0px';
		this.el.style.width = '50px';
		this.el.style.height = '50px';
		this.el.style.backgroundSize = 'contain';
		this.el.style.backgroundRepeat = 'no-repeat';

		this.position.x = container.offsetWidth / 2; // Start in the middle
		this.updateSprite(); // Set initial sprite
		container.appendChild(this.el);
	}
}
