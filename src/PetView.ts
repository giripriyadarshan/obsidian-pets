// src/PetView.ts

import { ItemView, WorkspaceLeaf } from "obsidian";
import { Pet } from "./pet";

export const PET_VIEW_TYPE = "pet-view";

export class PetView extends ItemView {
	private pet: Pet;
	private animationFrameId: number; // To store the ID of the animation frame

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return PET_VIEW_TYPE;
	}

	getDisplayText() {
		return "Pet View";
	}

	getIcon() {
		return "dog";
	}

	// NEW: The game loop
	private gameLoop = () => {
		if (this.pet) {
			// Pass the width of the view to the pet for boundary detection
			this.pet.update(this.contentEl.offsetWidth);
		}
		// Continue the loop
		this.animationFrameId = window.requestAnimationFrame(this.gameLoop);
	};

	async onOpen() {
		this.contentEl.empty();

		this.contentEl.style.position = 'relative';
		this.contentEl.style.height = '100%';

		this.pet = new Pet(this.app, 'dog', 'brown');
		this.pet.spawn(this.contentEl);

		// Start the game loop
		this.animationFrameId = window.requestAnimationFrame(this.gameLoop);
	}

	async onClose() {
		// IMPORTANT: Stop the animation loop when the view is closed to save resources
		if (this.animationFrameId) {
			window.cancelAnimationFrame(this.animationFrameId);
		}

		if (this.pet && this.pet.el) {
			this.pet.el.remove();
		}
	}
}
