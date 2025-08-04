import { App, Modal, Setting } from 'obsidian';
import { PetView } from './PetView';
import { PetSize } from './types';

export class NameInputModal extends Modal {
	view: PetView;
	petType: string;
	petColor: string;
	name = '';

	constructor(app: App, view: PetView, petType: string, petColor: string) {
		super(app);
		this.view = view;
		this.petType = petType;
		this.petColor = petColor;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "Name your new pet!" });

		new Setting(contentEl)
			.setName("Pet's name")
			.addText((text) =>
				text.onChange((value) => {
					this.name = value;
				}));

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Create Pet")
					.setCta()
					.onClick(() => {
						this.close();
						const plugin = (this.app as any).plugins.plugins['vault-pets'];
						if (plugin) {
							const petSize = plugin.settings.petSize as PetSize;
							// Use the entered name, or a default if empty
							const finalName = this.name || `${this.petColor} ${this.petType}`;
							this.view.spawnPet(this.petType, this.petColor, petSize, finalName);
						}
					}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
