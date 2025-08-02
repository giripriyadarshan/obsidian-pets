// src/PetView.ts

import { ItemView, WorkspaceLeaf } from "obsidian";
import { Pet } from "./pet";
import { PetSize } from "./types";

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

	applyTheme(theme: string) {
		if (theme === 'none') {
			this.contentEl.style.backgroundImage = 'none';
			return;
		}

		const assetPath = (asset: string) => {
			const pluginId = 'obsidian-pets';
			const plugin = this.app.plugins.getPlugin(pluginId);
			if (!plugin) return '';
			return this.app.vault.adapter.getResourcePath(
				`${plugin.app.vault.configDir}/plugins/${pluginId}/media/${asset}`
			);
		};

		// 1. Determine the panel size
		const width = this.contentEl.offsetWidth;
		let petSize: PetSize;
		if (width < 300) {
			petSize = PetSize.nano;
		} else if (width < 500) {
			petSize = PetSize.small;
		} else if (width < 800) {
			petSize = PetSize.medium;
		} else {
			petSize = PetSize.large;
		}

		// 2. Determine the color theme
		const isDarkMode = document.body.classList.contains('theme-dark');
		const themeKind = isDarkMode ? 'dark' : 'light';

		// 3. Construct the filename based on the original project's logic
		// This handles all cases, including "beach", "castle", etc.
		const backgroundUrl = assetPath(`backgrounds/${theme}/background-${themeKind}-${petSize}.png`);

		// 4. Set the background image
		// We removed the fetch() wrapper to prevent the unhandled promise rejection error.
		// If a file is not found, the background will simply be empty, which is graceful.
		this.contentEl.style.backgroundImage = `url('${backgroundUrl}')`;
		this.contentEl.style.backgroundSize = 'cover';
		this.contentEl.style.backgroundRepeat = 'no-repeat';
		this.contentEl.style.backgroundPosition = 'center';
	}


	async onOpen() {
		this.contentEl.empty();
		this.contentEl.style.position = 'relative';
		this.contentEl.style.height = '100%';

		const plugin = (this.app as any).plugins.plugins['obsidian-pets'];
		if (plugin) {
			this.applyTheme(plugin.settings.theme);
			this.spawnPet(plugin.settings.petType, plugin.settings.petColor);
		}

		this.animationFrameId = window.requestAnimationFrame(this.gameLoop);
	}

	async onClose() {
		this.clearAllPets(); // Use our new cleanup method
	}
}
