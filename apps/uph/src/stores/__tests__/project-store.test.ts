
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProjectStore } from '../project-store';
import { getDocs, addDoc } from 'firebase/firestore';

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getFirestore: jest.fn(),
  Timestamp: {
    now: jest.fn(() => new Date()),
    fromDate: jest.fn((date) => date),
  }
}));

// Mock Firebase config
jest.mock('@/lib/firebase', () => ({
  db: {},
  storage: {},
  auth: {}
}));

describe('Project Store', () => {
    const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        status: 'todo',
        completed: false
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset store state
        useProjectStore.setState({ 
            projects: [], 
            tasks: {}, 
            isLoading: false 
        });
    });

    it('should start with empty state', () => {
        const { result } = renderHook(() => useProjectStore());
        expect(result.current.projects).toEqual([]);
        expect(result.current.tasks).toEqual({});
    });

    it('should fetch project tasks successfully', async () => {
        // Mock getDocs return value
        (getDocs as jest.Mock).mockResolvedValue({
            docs: [
                {
                    id: mockTask.id,
                    data: () => ({ ...mockTask })
                }
            ]
        });

        const { result } = renderHook(() => useProjectStore());

        await act(async () => {
            await result.current.fetchProjectTasks('project-1');
        });

        expect(getDocs).toHaveBeenCalled();
        expect(result.current.tasks['project-1']).toHaveLength(1);
        expect(result.current.tasks['project-1'][0].title).toBe('Test Task');
    });

    it('should add a task', async () => {
        // Mock addDoc return value
        (addDoc as jest.Mock).mockResolvedValue({
            id: 'new-task-id'
        });
        
        // Mock getDocs to return the new task after re-fetch (if the store refetches)
        // OR if the store optimistically updates, we check that.
        // The current store implementation re-fetches after add.
        (getDocs as jest.Mock).mockResolvedValue({
             docs: [
                {
                    id: 'new-task-id',
                    data: () => ({ title: 'New Task', status: 'todo', completed: false })
                }
            ]
        });

        const { result } = renderHook(() => useProjectStore());

        await act(async () => {
            await result.current.addTask('project-1', { title: 'New Task', status: 'todo', completed: false });
        });

        expect(addDoc).toHaveBeenCalled();
        // Since it calls fetchProjectTasks internally, tasks should be updated
        expect(result.current.tasks['project-1']).toHaveLength(1);
        expect(result.current.tasks['project-1'][0].title).toBe('New Task');
    });
});
