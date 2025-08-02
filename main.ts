import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { PetView, PET_VIEW_TYPE } from './src/PetView';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

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

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
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


class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
