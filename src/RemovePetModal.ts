import { App, SuggestModal } from 'obsidian';
import { PetView } from './PetView';

// This interface helps us pass both the name and the unique ID
interface PetSuggestion {
	id: number;
	name: string;
	type: string;
}

export class RemovePetModal extends SuggestModal<PetSuggestion> {
	view: PetView;

	constructor(app: App, view: PetView) {
		super(app);
		this.view = view;
		this.setPlaceholder("Choose a pet to remove...");
	}

	// Get the list of current pets from the view
	getSuggestions(query: string): PetSuggestion[] {
		return this.view.getPets()
			.map(pet => ({ id: pet.id, name: pet.name, type: pet.petType }))
			.filter(pet => pet.name.toLowerCase().includes(query.toLowerCase()));
	}

	// Render the pet's name and type in the list
	renderSuggestion(pet: PetSuggestion, el: HTMLElement) {
		el.createEl("div", { text: pet.name });
		el.createEl("small", { text: pet.type, cls: "text-muted" });
	}

	// When a pet is chosen, call the view to remove it by its ID
	onChooseSuggestion(pet: PetSuggestion, evt: MouseEvent | KeyboardEvent) {
		this.view.removePetById(pet.id);
	}
}
