import { ItemView, WorkspaceLeaf, setIcon } from "obsidian";
import { Pet } from "./pet";
import { Ball } from "./ball";
import { PetSize } from "./types";
import { PetSuggestModal } from "./PetSuggestModal";
import { RemovePetModal } from "./RemovePetModal";
import { PET_NAMES } from './names';
import { THEME_FLOOR_MAP } from './themes';

export const PET_VIEW_TYPE = "pet-view";

export class PetView extends ItemView {
	private pets: Pet[] = [];
	private ball: Ball | null = null;
	private animationFrameId: number;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() { return PET_VIEW_TYPE; }
	getDisplayText() { return "Pet View"; }
	getIcon() { return "dog"; }

	private gameLoop = () => {
		const viewWidth = this.contentEl.offsetWidth;
		const viewHeight = this.contentEl.offsetHeight;

		const plugin = (this.app as any).plugins.plugins['obsidian-pets'];
		const theme = plugin.settings.theme;
		const petSize = plugin.settings.petSize as PetSize;
		const floorPercentString = THEME_FLOOR_MAP[theme]?.[petSize] ?? '0%';
		const floorPercent = parseFloat(floorPercentString);
		const floorY = viewHeight - (viewHeight * (floorPercent / 100));

		this.pets.forEach(pet => {
			// Pass the correct floorY to the pet's update method
			const event = pet.update(viewWidth, viewHeight, floorY, this.ball);
			if (event === 'caught_ball' && this.ball) {
				this.ball.remove();
				this.ball = null;
			}
		});

		if (this.ball) {
			this.ball.update(viewHeight, viewWidth, floorY);
		}

		this.animationFrameId = window.requestAnimationFrame(this.gameLoop);
	};


	getPets(): Pet[] {
		return this.pets;
	}

	removePetById(petId: number) {
		const petToRemove = this.pets.find(p => p.id === petId);
		if (petToRemove) {
			petToRemove.el.remove();
			this.pets = this.pets.filter(p => p.id !== petId);
		}
	}

	spawnPet(type: string, color: string, size: PetSize, name: string) {
		const plugin = (this.app as any).plugins.plugins['obsidian-pets'];
		const theme = plugin.settings.theme;
		const floor = THEME_FLOOR_MAP[theme]?.[size] ?? '0%';
		const newPet = new Pet(this.app, type, color, size, name, floor);
		this.pets.push(newPet);
		newPet.spawn(this.contentEl);
	}

	resetAndSpawnPet(type: string, color: string, size: PetSize) {
		this.clearAllPets();
		const randomName = PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)];
		this.spawnPet(type, color, size, randomName);
	}

	clearAllPets() {
		if (this.animationFrameId) {
			window.cancelAnimationFrame(this.animationFrameId);
		}
		this.pets.forEach(pet => {
			if (pet.el) pet.el.remove();
		});
		this.pets = [];
		this.animationFrameId = window.requestAnimationFrame(this.gameLoop);
	}

	throwBall() {
		if (this.ball) {
			this.ball.remove();
		}
		const plugin = (this.app as any).plugins.plugins['obsidian-pets'];
		const petSize = plugin.settings.petSize as PetSize;
		this.ball = new Ball(this.app, this.contentEl.offsetWidth / 2, this.contentEl.offsetHeight / 2, petSize);
		this.ball.spawn(this.contentEl);
	}

	applyTheme(theme: string) {
		this.contentEl.style.backgroundImage = '';
		if (theme !== 'none') {
			const isDarkMode = document.body.classList.contains('theme-dark');
			const themeKind = isDarkMode ? 'dark' : 'light';

			const viewWidth = this.contentEl.offsetWidth;
			let size: PetSize;
			if (viewWidth < 300) { size = PetSize.nano; }
			else if (viewWidth < 500) { size = PetSize.small; }
			else if (viewWidth < 800) { size = PetSize.medium; }
			else { size = PetSize.large; }

			const backgroundUrl = this.app.vault.adapter.getResourcePath(
				`${(this.app as any).plugins.plugins['obsidian-pets'].app.vault.configDir}/plugins/obsidian-pets/media/backgrounds/${theme}/background-${themeKind}-${size}.png`
			);

			this.contentEl.style.backgroundImage = `url('${backgroundUrl}')`;
			this.contentEl.style.backgroundSize = 'cover';
			this.contentEl.style.backgroundRepeat = 'no-repeat';
			this.contentEl.style.backgroundPosition = 'center';
		}

		// Update the floor position for all existing pets without recreating them
		this.pets.forEach(pet => {
			const newFloor = THEME_FLOOR_MAP[theme]?.[pet.petSize] ?? '0%';
			pet.setFloor(newFloor);
		});
	}

	async onOpen() {
		this.addAction('circle', 'Throw ball', () => this.throwBall());
		this.addAction('plus', 'Add a new pet', () => new PetSuggestModal(this.app, this).open());
		this.addAction('minus', 'Remove a pet', () => new RemovePetModal(this.app, this).open());

		this.contentEl.empty();
		this.contentEl.style.position = 'relative';
		this.contentEl.style.height = '100%';

		const buttonContainer = this.contentEl.createDiv({ cls: 'pet-view-button-container' });

		const removeButton = buttonContainer.createEl('button', { cls: 'pet-view-action-button' });
		removeButton.setAttribute('aria-label', 'Remove a pet');
		setIcon(removeButton, 'minus');
		removeButton.addEventListener('click', () => new RemovePetModal(this.app, this).open());

		const throwBallButton = buttonContainer.createEl('button', { cls: 'pet-view-action-button' });
		throwBallButton.setAttribute('aria-label', 'Throw ball');
		setIcon(throwBallButton, 'circle');
		throwBallButton.addEventListener('click', () => this.throwBall());

		const addButton = buttonContainer.createEl('button', { cls: 'pet-view-action-button' });
		addButton.setAttribute('aria-label', 'Add a new pet');
		setIcon(addButton, 'plus');
		addButton.addEventListener('click', () => new PetSuggestModal(this.app, this).open());

		const plugin = (this.app as any).plugins.plugins['obsidian-pets'];
		if (plugin) {
			this.applyTheme(plugin.settings.theme);
			if (this.pets.length === 0) {
				const randomName = PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)];
				this.spawnPet(plugin.settings.petType, plugin.settings.petColor, plugin.settings.petSize as PetSize, randomName);
			}
		}

		this.animationFrameId = window.requestAnimationFrame(this.gameLoop);
	}

	async onClose() {
		if (this.animationFrameId) {
			window.cancelAnimationFrame(this.animationFrameId);
		}
		if (this.ball) {
			this.ball.remove();
		}
	}
}
