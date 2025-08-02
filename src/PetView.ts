// src/PetView.ts

import { ItemView, WorkspaceLeaf } from "obsidian";
import { Pet } from "./pet";

export const PET_VIEW_TYPE = "pet-view";

export class PetView extends ItemView {
	private pet: Pet;
	private animationFrameId: number;

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

	private gameLoop = () => {
		if (this.pet) {
			this.pet.update(this.contentEl.offsetWidth);
		}
		this.animationFrameId = window.requestAnimationFrame(this.gameLoop);
	};

	// NEW: A dedicated function to spawn pets
	spawnPet(type: string, color: string) {
		// Clean up old pet if it exists
		if (this.pet && this.pet.el) {
			this.pet.el.remove();
		}

		// Create and spawn a new pet with the given settings
		this.pet = new Pet(this.app, type, color);
		this.pet.spawn(this.contentEl);
	}

	async onOpen() {
		this.contentEl.empty();
		this.contentEl.style.position = 'relative';
		this.contentEl.style.height = '100%';

		// Get the settings from the main plugin class
		const plugin = (this.app as any).plugins.plugins['obsidian-pets'];
		if (plugin) {
			this.spawnPet(plugin.settings.petType, plugin.settings.petColor);
		}

		this.animationFrameId = window.requestAnimationFrame(this.gameLoop);
	}

	async onClose() {
		if (this.animationFrameId) {
			window.cancelAnimationFrame(this.animationFrameId);
		}
		if (this.pet && this.pet.el) {
			this.pet.el.remove();
		}
	}
}
