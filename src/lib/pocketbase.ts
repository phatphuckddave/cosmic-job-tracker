import PocketBase from 'pocketbase';
import { TypedPocketBase } from './pbtypes';
import { POCKETBASE_SUPERUSER_EMAIL, POCKETBASE_SUPERUSER_PASSWORD } from './pocketbaseAdmin';

const pb = new PocketBase('https://evebase.site.quack-lab.dev') as TypedPocketBase;

// Track the login promise to avoid multiple concurrent login attempts
let loginPromise: Promise<void> | null = null;

async function adminLogin() {
	// If we're already logged in, no need to login again
	if (pb.authStore.isValid) {
		return Promise.resolve();
	}

	if (loginPromise) {
		return loginPromise;
	}

	loginPromise = pb.collection('_superusers')
		.authWithPassword(POCKETBASE_SUPERUSER_EMAIL, POCKETBASE_SUPERUSER_PASSWORD)
		.then(() => {
			console.log('Admin logged in');
		})
		.catch(error => {
			console.error('Admin login failed:', error);
			throw error;
		})
		.finally(() => {
			loginPromise = null;
		});

	return loginPromise;
}

// Wrap the PocketBase instance to ensure auth before any request
const wrappedPb = new Proxy(pb, {
	get(target, prop) {
		if (prop === 'collection') {
			// Return a function that creates a proxied collection
			return (collectionName: string) => {
				// Get the original collection
				const originalCollection = target.collection(collectionName);
				
				// Return a proxy for the collection that ensures auth
				return new Proxy(originalCollection, {
					get(collectionTarget, methodName) {
						const method = collectionTarget[methodName as keyof typeof collectionTarget];
						if (typeof method === 'function') {
							// Wrap methods to ensure auth before calling
							return async (...args: any[]) => {
								// Only try to login if we're not already logged in
								if (!pb.authStore.isValid) {
									await adminLogin();
								}
								return method.apply(collectionTarget, args);
							};
						}
						return method;
					}
				});
			};
		}
		
		return target[prop as keyof typeof target];
	}
});

export { wrappedPb as pb, adminLogin };
