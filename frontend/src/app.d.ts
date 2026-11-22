// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { DemoRole } from '$lib/demo-access';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			role?: DemoRole | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
