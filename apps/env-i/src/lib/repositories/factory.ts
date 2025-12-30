
import { IInventoryRepository } from './interfaces';
import { FirebaseInventoryRepository } from './firebase/inventory-repo';

export class RepositoryFactory {
    private static inventoryRepo: IInventoryRepository | null = null;

    static getInventoryRepository(): IInventoryRepository {
        const strategy = process.env.NEXT_PUBLIC_DB_STRATEGY || 'firebase';

        if (this.inventoryRepo) return this.inventoryRepo;

        switch (strategy) {
            case 'firebase':
                this.inventoryRepo = new FirebaseInventoryRepository();
                break;
            case 'supabase':
                console.warn('Supabase strategy requested but not implemented yet. Falling back to Firebase.');
                this.inventoryRepo = new FirebaseInventoryRepository();
                break;
            default:
                this.inventoryRepo = new FirebaseInventoryRepository();
        }

        return this.inventoryRepo;
    }
}
