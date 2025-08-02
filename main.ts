import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { PetView, PET_VIEW_TYPE } from './src/PetView';

// Remember to rename these classes and interfaces!

interface PetPluginSettings {
	petType: string;
	petColor: string;
	theme: string;
}

const DEFAULT_SETTINGS: PetPluginSettings = {
	petType: 'dog',
	petColor: 'brown',
	theme: 'none',
}


export default class MyPlugin extends Plugin {
	settings: PetPluginSettings;

	async onload() {
		await this.loadSettings();

		// This registers our custom view with Obsidian
		this.registerView(
			PET_VIEW_TYPE,
			(leaf) => new PetView(leaf)
		);

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('dog', 'Open Pet View', () => {
			this.activateView();
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-pet-view',
			name: 'Open Pet View',
			callback: () => {
				this.activateView();
			}
		});

		this.addCommand({
			id: 'spawn-additional-pet',
			name: 'Spawn an additional pet',
			callback: () => {
				const leaf = this.app.workspace.getLeavesOfType(PET_VIEW_TYPE)[0];
				if (leaf) {
					const petView = leaf.view as PetView;
					petView.spawnPet(this.settings.petType, this.settings.petColor);
				}
			}
		});

		this.addCommand({
			id: 'remove-all-pets',
			name: 'Remove all pets',
			callback: () => {
				const leaf = this.app.workspace.getLeavesOfType(PET_VIEW_TYPE)[0];
				if (leaf) {
					const petView = leaf.view as PetView;
					petView.clearAllPets();
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new PetSettingTab(this.app, this));
	}

	// This function is responsible for opening the view
	async activateView() {
		// First, we detach any existing leaves of our view type
		this.app.workspace.detachLeavesOfType(PET_VIEW_TYPE);

		// Then, we get a new leaf in the right sidebar
		const leaf = this.app.workspace.getRightLeaf(false);
		if (leaf) {
			await leaf.setViewState({
				type: PET_VIEW_TYPE,
				active: true,
			});

			// Finally, we reveal the leaf to make it visible
			this.app.workspace.revealLeaf(leaf);
		}
	}

	async respawnPet() {
		const leaf = this.app.workspace.getLeavesOfType(PET_VIEW_TYPE)[0];
		if (leaf) {
			const petView = leaf.view as PetView;
			petView.spawnPet(this.settings.petType, this.settings.petColor);
		}
	}

	onunload() {
		// When the plugin is disabled, we clean up by detaching our view
		this.app.workspace.detachLeavesOfType(PET_VIEW_TYPE);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


// in main.ts, at the bottom

class PetSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl('h2', { text: 'Obsidian Pets Settings' });

		new Setting(containerEl)
			.setName('Pet Type')
			.setDesc('Choose your pet!')
			.addDropdown(dropdown => dropdown
				.addOption('dog', 'Dog')
				.addOption('cat', 'Cat (WIP)')
				.addOption('crab', 'Crab')
				.addOption('clippy', 'Clippy')
				.addOption('chicken', 'Chicken')
				.addOption('fox', 'Fox')
				.setValue(this.plugin.settings.petType)
				.onChange(async (value) => {
					this.plugin.settings.petType = value;
					const leaf = this.app.workspace.getLeavesOfType(PET_VIEW_TYPE)[0];
					if (leaf) {
						const petView = leaf.view as PetView;
						petView.resetAndSpawnPet(this.plugin.settings.petType, this.plugin.settings.petColor);
					}
				}));

		new Setting(containerEl)
			.setName('Pet Color')
			.setDesc('Choose the color of your pet.')
			.addDropdown(dropdown => dropdown
				.addOption('brown', 'Brown')
				.addOption('black', 'Black')
				.addOption('red', 'Red')
				.addOption('green', 'Green')
				.addOption('yellow', 'Yellow')
				.addOption('gray', 'Gray')
				.addOption('white', 'White')
				.setValue(this.plugin.settings.petColor)
				.onChange(async (value) => {
					this.plugin.settings.petColor = value;
					await this.plugin.saveSettings();
					const leaf = this.app.workspace.getLeavesOfType(PET_VIEW_TYPE)[0];
					if (leaf) {
						const petView = leaf.view as PetView;
						petView.resetAndSpawnPet(this.plugin.settings.petType, this.plugin.settings.petColor);
					}
				}));

		new Setting(containerEl)
			.setName('Theme')
			.setDesc('Choose a background theme for your pets.')
			.addDropdown(dropdown => dropdown
				.addOption('none', 'None')
				.addOption('castle', 'Castle')
				.addOption('forest', 'Forest')
				.addOption('beach', 'Beach')
				.addOption('winter', 'Winter')
				.setValue(this.plugin.settings.theme)
				.onChange(async (value) => {
					this.plugin.settings.theme = value;
					await this.plugin.saveSettings();

					// Tell the view to update its theme
					const leaf = this.app.workspace.getLeavesOfType(PET_VIEW_TYPE)[0];
					if (leaf) {
						const petView = leaf.view as PetView;
						petView.applyTheme(this.plugin.settings.theme);
					}
				}));

	}
}
