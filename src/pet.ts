// src/pet.ts

import { App } from "obsidian";
import { PetState } from "./states";
import { Ball } from "./ball";

export class Pet {
	el: HTMLImageElement; // The element is now specifically an Image
	app: App;
	petType: string;
	petColor: string;

	currentState: PetState = PetState.idle;
	private speed = 2;
	private direction = 1;
	position: { x: number, y: number };

	private stateChangeTimer = 0;

	constructor(app: App, petType = 'dog', petColor = 'brown') {
		this.app = app;
		this.petType = petType;
		this.petColor = petColor;
		this.position = { x: 50, y: 0 };

		// Create an <img> element instead of a <div>
		this.el = document.createElement('img');
		this.el.addClass('obsidian-pet');
	}

	private getAssetPath(asset: string): string {
		const pluginId = 'obsidian-pets';
		const plugin = this.app.plugins.getPlugin(pluginId);
		if (!plugin) return '';
		return this.app.vault.adapter.getResourcePath(
			`${plugin.app.vault.configDir}/plugins/${pluginId}/media/${asset}`
		);
	}

	private updateSprite() {
		let stateSprite = "idle";

		switch(this.currentState) {
			case PetState.walk: stateSprite = "walk"; break;
			case PetState.run: case PetState.chase: stateSprite = "run"; break;
		}

		if (this.currentState === PetState.idle && this.el.hasClass('with-ball')) {
			stateSprite = "with_ball";
		}

		const assetPath = this.getAssetPath(`${this.petType}/${this.petColor}_${stateSprite}_8fps.gif`);

		// --- THE ANIMATION FIX ---
		// Get the base URLs by removing the cache-busting query string
		const currentSrcBase = this.el.src.split('?')[0];
		const newSrcBase = assetPath.split('?')[0];

		// Only update the image source if the base GIF file has actually changed.
		// This prevents the animation from being reset on every frame.
		if (currentSrcBase !== newSrcBase) {
			this.el.src = assetPath;
		}
		// --- END OF FIX ---

		this.el.style.transform = this.direction === -1 ? 'scaleX(-1)' : 'scaleX(1)';
	}

	// in src/pet.ts

	update(viewWidth: number, viewHeight: number, ball: Ball | null): string | void {
		// 1. AI: Decide if it's time to chase the ball
		if (this.currentState !== PetState.chase && ball) {
			const ballIsOnFloor = ball.position.y >= viewHeight - 25;
			if (ballIsOnFloor && Math.random() < 0.8) {
				this.currentState = PetState.chase;
			}
		} else if (this.currentState === PetState.chase && ball) {
			// Logic for actively chasing the ball
			const speed = 4;
			const targetX = ball.position.x;
			const xDistance = Math.abs(this.position.x - targetX);

			// --- THE AI FIX: "Dead Zone" ---
			// If the pet is already close to being under the ball, stop moving and wait.
			if (xDistance > 10) {
				// Only move if not in the "dead zone"
				if (this.position.x < targetX) {
					this.direction = 1; this.position.x += speed;
				} else {
					this.direction = -1; this.position.x -= speed;
				}
			}
			// --- END OF FIX ---

			// Improved collision detection
			const ballIsOnFloor = ball.position.y >= viewHeight - 25;
			const canCatchOnFloor = ballIsOnFloor && xDistance < 25;

			// Allow catching the ball if it lands near the pet's head
			const canCatchInAir = xDistance < 35 && Math.abs(ball.position.y - (viewHeight - 40)) < 20;

			if (canCatchOnFloor || canCatchInAir) {
				this.currentState = PetState.idle;
				this.el.addClass('with-ball');
				return 'caught_ball';
			}
		} else {
			// Normal Idle/Walk Behavior
			this.stateChangeTimer++;
			if (this.stateChangeTimer > 180) {
				if (this.el.hasClass('with-ball')) this.el.removeClass('with-ball');
				this.currentState = this.currentState === PetState.idle ? PetState.walk : PetState.idle;
				this.stateChangeTimer = 0;
			}

			if (this.currentState === PetState.walk) {
				this.position.x += this.speed * this.direction;
				if (this.position.x > viewWidth - 50 || this.position.x < 0) this.direction *= -1;
			}
		}

		this.updateSprite();
		this.el.style.left = `${this.position.x}px`;
	}

	spawn(container: HTMLElement) {
		this.el.style.position = 'absolute';
		this.el.style.bottom = '0px';
		this.el.style.width = '50px';
		this.el.style.height = '50px';

		this.position.x = container.offsetWidth / 2;
		this.updateSprite();
		container.appendChild(this.el);
	}
}
