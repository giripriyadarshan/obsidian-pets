import { App } from "obsidian";
import { PetState } from "./states";
import { Ball } from "./ball";
import { PetSize } from "./types";

export class Pet {
	id: number;
	el: HTMLImageElement;
	app: App;
	petType: string;
	petColor: string;
	petSize: PetSize;
	name: string;

	currentState: PetState = PetState.walk;
	private speed: number;
	private direction = 1;
	position: { x: number, y: number };
	private floor: string;
	private sizeInPixels: number;

	private stateChangeTimer = 0;

	constructor(app: App, petType: string, petColor: string, petSize: PetSize, name: string, floor: string) {
		this.id = Date.now() + Math.random();
		this.app = app;
		this.petType = petType;
		this.petColor = petColor;
		this.petSize = petSize;
		this.name = name;
		this.floor = floor;
		this.position = { x: 50, y: 0 };

		switch (this.petSize) {
			case PetSize.nano: this.speed = 1.0; break;
			case PetSize.small: this.speed = 1.5; break;
			case PetSize.large: this.speed = 2.5; break;
			case PetSize.medium: default: this.speed = 2.0; break;
		}

		this.el = document.createElement('img');
		this.el.addClass('obsidian-pet');
	}

	private getAssetPath(asset: string): string {
		const pluginId = 'vault-pets';
		const plugin = (this.app as any).plugins.getPlugin(pluginId);
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

		const currentSrcBase = this.el.src.split('?')[0];
		const newSrcBase = assetPath.split('?')[0];

		if (currentSrcBase !== newSrcBase) this.el.src = assetPath;

		this.el.style.transform = this.direction === -1 ? 'scaleX(-1)' : 'scaleX(1)';
	}

	update(viewWidth: number, viewHeight: number, floorY: number, ball: Ball | null): string | void {
		if (this.currentState !== PetState.chase && ball) {
			// Use the correct floorY to check if the ball is on the ground
			const ballSize = parseInt(ball.el.style.width);
			const ballIsOnFloor = ball.position.y >= floorY - (ballSize + 5); // Add 5px buffer
			if (ballIsOnFloor && Math.random() < 0.85) {
				this.currentState = PetState.chase;
			}
		} else if (this.currentState === PetState.chase && ball) {
			const chaseSpeed = this.speed * 1.5;
			const targetX = ball.position.x;
			const xDistance = Math.abs(this.position.x - targetX);

			if (xDistance > 10) {
				if (this.position.x < targetX) {
					this.direction = 1; this.position.x += chaseSpeed;
				} else {
					this.direction = -1; this.position.x -= chaseSpeed;
				}
			}

			// The catch logic must also use the correct floorY
			const ballSize = parseInt(ball.el.style.width);
			const ballIsOnFloor = ball.position.y >= floorY - (ballSize + 5);
			const canCatchOnFloor = ballIsOnFloor && xDistance < 25;
			const canCatchInAir = xDistance < 35 && Math.abs(ball.position.y - (floorY - this.sizeInPixels)) < 20;

			if (canCatchOnFloor || canCatchInAir) {
				this.currentState = PetState.idle;
				this.el.addClass('with-ball');
				return 'caught_ball';
			}
		} else {
			this.stateChangeTimer++;
			if (this.stateChangeTimer > 180) {
				if (this.el.hasClass('with-ball')) this.el.removeClass('with-ball');
				this.currentState = this.currentState === PetState.idle ? PetState.walk : PetState.idle;
				this.stateChangeTimer = 0;
			}

			if (this.currentState === PetState.walk) {
				this.position.x += this.speed * this.direction;
				if (this.position.x > viewWidth - this.sizeInPixels || this.position.x < 0) {
					this.direction *= -1;
				}
			}
		}

		this.updateSprite();
		this.el.style.left = `${this.position.x}px`;
	}

	spawn(container: HTMLElement) {
		const size = {
			[PetSize.nano]: 30,
			[PetSize.small]: 40,
			[PetSize.medium]: 50,
			[PetSize.large]: 65,
		}[this.petSize];

		this.sizeInPixels = size;

		this.el.style.position = 'absolute';
		this.el.style.bottom = this.floor;
		this.el.style.width = `${size}px`;
		this.el.style.height = `${size}px`;
		this.el.setAttribute('title', this.name);

		this.position.x = container.offsetWidth / 2;
		this.updateSprite();
		container.appendChild(this.el);
	}

	setFloor(newFloor: string) {
		this.floor = newFloor;
		this.el.style.bottom = this.floor;
	}
}
