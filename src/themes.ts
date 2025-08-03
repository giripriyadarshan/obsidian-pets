import { PetSize } from "./types";

export const THEME_FLOOR_MAP: Record<string, Record<PetSize, string>> = {
	'none': {
		[PetSize.nano]: '0%',
		[PetSize.small]: '0%',
		[PetSize.medium]: '0%',
		[PetSize.large]: '0%',
	},
	'castle': {
		[PetSize.nano]: '11.25%',
		[PetSize.small]: '15%',
		[PetSize.medium]: '20%',
		[PetSize.large]: '30%',
	},
	'forest': {
		[PetSize.nano]: '5.75%',
		[PetSize.small]: '7.5%',
		[PetSize.medium]: '10%',
		[PetSize.large]: '16.25%',
	},
	'beach': {
		[PetSize.nano]: '11.25%',
		[PetSize.small]: '15%',
		[PetSize.medium]: '20%',
		[PetSize.large]: '30%',
	},
	'winter': {
		[PetSize.nano]: '4.5%',
		[PetSize.small]: '5%',
		[PetSize.medium]: '7.5%',
		[PetSize.large]: '11.25%',
	},
};
