import { App, SuggestModal } from 'obsidian';
import { PetView } from './PetView';
import { PetSize } from './types';
import { ColorSuggestModal } from './ColorSuggestModal';

const PET_TYPES = [
	'dog', 'cat', 'crab', 'clippy', 'chicken', 'fox', 'rocky', 'rubber-duck', 'totoro', 'snake', 'horse'
];

export const PET_COLOR_MAP: Record<string, string[]> = {
	'dog': ['brown', 'black', 'red', 'white', 'akita'],
	'cat': ['brown', 'black', 'orange', 'white'],
	'crab': ['red'],
	'clippy': ['black', 'brown', 'green', 'yellow'],
	'chicken': ['white'],
	'fox': ['red', 'white'],
	'rocky': ['gray'],
	'rubber-duck': ['yellow'],
	'totoro': ['gray'],
	'snake': ['green'],
	'horse': ['brown', 'white', 'black', 'magical']
};

export class PetSuggestModal extends SuggestModal<string> {
	view: PetView;

	constructor(app: App, view: PetView) {
		super(app);
		this.view = view;
		this.setPlaceholder("Choose a pet to add...");
	}

	getSuggestions(query: string): string[] {
		return PET_TYPES.filter(
			(pet) => pet.toLowerCase().includes(query.toLowerCase())
		);
	}

	renderSuggestion(pet: string, el: HTMLElement) {
		el.createEl("div", { text: pet });
	}

	onChooseSuggestion(petType: string, evt: MouseEvent | KeyboardEvent) {
		this.close();
		new ColorSuggestModal(this.app, this.view, petType).open();
	}
}
