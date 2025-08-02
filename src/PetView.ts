// src/PetView.ts

import { ItemView, WorkspaceLeaf } from "obsidian";
import { Pet } from "./pet";

export const PET_VIEW_TYPE = "pet-view";

export class PetView extends ItemView {
	// We now have an array of pets
	private pets: Pet[] = [];
	private animationFrameId: number;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() { return PET_VIEW_TYPE; }
	getDisplayText() { return "Pet View"; }
	getIcon() { return "dog"; }

	private gameLoop = () => {
		// Update every pet in the array
		this.pets.forEach(pet => {
			pet.update(this.contentEl.offsetWidth);
		});
		this.animationFrameId = window.requestAnimationFrame(this.gameLoop);
	};

	// This now adds a new pet to our array
	spawnPet(type: string, color: string) {
		const newPet = new Pet(this.app, type, color);
		this.pets.push(newPet);
		newPet.spawn(this.contentEl);
	}

	// New method to clear all pets and spawn a new default one
	resetAndSpawnPet(type: string, color: string) {
		this.clearAllPets();
		this.spawnPet(type, color);
	}

	// New method to clear all pets from the view
	clearAllPets() {
		// Stop the animation and remove all pet elements
		if (this.animationFrameId) {
			window.cancelAnimationFrame(this.animationFrameId);
		}
		this.pets.forEach(pet => {
			if (pet.el) pet.el.remove();
		});
		this.pets = []; // Clear the array

		// Restart the loop
		this.animationFrameId = window.requestAnimationFrame(this.gameLoop);
	}

	async onOpen() {
		this.contentEl.empty();
		this.contentEl.style.position = 'relative';
		this.contentEl.style.height = '100%';

		const plugin = (this.app as any).plugins.plugins['obsidian-pets'];
		if (plugin) {
			this.spawnPet(plugin.settings.petType, plugin.settings.petColor);
		}

		this.animationFrameId = window.requestAnimationFrame(this.gameLoop);
	}

	async onClose() {
		this.clearAllPets(); // Use our new cleanup method
	}
}
