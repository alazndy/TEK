
import { IProjectRepository } from './interfaces';
import { FirebaseProjectRepository } from './firebase/project-repo';

export class RepositoryFactory {
    private static projectRepo: IProjectRepository | null = null;

    static getProjectRepository(): IProjectRepository {
        const strategy = process.env.NEXT_PUBLIC_DB_STRATEGY || 'firebase';

        if (this.projectRepo) return this.projectRepo;

        switch (strategy) {
            case 'firebase':
                this.projectRepo = new FirebaseProjectRepository();
                break;
            case 'supabase':
                // Will be implemented later
                console.warn('Supabase strategy requested but not implemented yet. Falling back to Firebase.');
                this.projectRepo = new FirebaseProjectRepository();
                break;
            default:
                this.projectRepo = new FirebaseProjectRepository();
        }

        return this.projectRepo;
    }
}
