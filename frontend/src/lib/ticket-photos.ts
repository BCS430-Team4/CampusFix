// Browser storage for the demo until the ticket API supports attachments.
const storeName = 'tickets';
type TicketIdentity = { id: string; created: string };
interface PhotoRecord extends TicketIdentity {
	files: File[];
}

async function withStore<T>(
	mode: IDBTransactionMode,
	operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
	const db = await new Promise<IDBDatabase>((resolve, reject) => {
		const request = indexedDB.open('campusfix-report-photos', 1);
		request.onupgradeneeded = () => request.result.createObjectStore(storeName, { keyPath: 'id' });
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
	try {
		return await new Promise<T>((resolve, reject) => {
			const transaction = db.transaction(storeName, mode);
			const request = operation(transaction.objectStore(storeName));
			transaction.oncomplete = () => resolve(request.result);
			transaction.onabort = () => reject(transaction.error);
		});
	} finally {
		db.close();
	}
}

export async function getTicketPhotos({ id, created }: TicketIdentity): Promise<File[]> {
	const record: PhotoRecord | undefined = await withStore('readonly', (store) => store.get(id));
	return record?.created === created ? record.files : [];
}

export async function saveTicketPhotos(
	{ id, created }: TicketIdentity,
	files: File[]
): Promise<void> {
	await withStore('readwrite', (store) => store.put({ id, created, files } satisfies PhotoRecord));
}

export async function clearTicketPhotos(id?: string): Promise<void> {
	await withStore('readwrite', (store) => (id === undefined ? store.clear() : store.delete(id)));
}
