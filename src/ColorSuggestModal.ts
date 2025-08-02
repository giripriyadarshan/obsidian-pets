// src/ColorSuggestModal.ts

import { App, SuggestModal } from 'obsidian';
import { PetView } from './PetView';
import { PetSize } from './types';
import { PET_COLOR_MAP } from './PetSuggestModal'; // Import the color map

export class ColorSuggestModal extends SuggestModal<string> {
	view: PetView;
	petType: string;

	constructor(app: App, view: PetView, petType: string) {
		super(app);
		this.view = view;
		this.petType = petType;
		this.setPlaceholder(`Choose a color for your ${petType}...`);
	}

	// Returns all the available colors for the selected pet type
	getSuggestions(query: string): string[] {
		const colors = PET_COLOR_MAP[this.petType] || [];
		return colors.filter(
			(color) => color.toLowerCase().includes(query.toLowerCase())
		);
	}

	// Renders each color suggestion
	renderSuggestion(color: string, el: HTMLElement) {
		el.createEl("div", { text: color });
	}

	// Called when the user clicks a color
	onChooseSuggestion(color: string, evt: MouseEvent | KeyboardEvent) {
		const plugin = (this.app as any).plugins.plugins['obsidian-pets'];
		if (plugin) {
			const petSize = plugin.settings.petSize as PetSize;
			// This is the final step, spawn the pet with the chosen type AND color
			this.view.spawnPet(this.petType, color, petSize);
		}
	}
}
