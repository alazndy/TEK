import { apiClient } from '../lib/api-client';
import { AnalysisResult } from '../types';

export const saveAnalysis = async (analysis: AnalysisResult) => {
  try {
    const { data } = await apiClient.post('/analyses', analysis);
    return data;
  } catch (error) {
    console.error('Failed to save analysis:', error);
    throw error;
  }
};

export const getAllAnalyses = async (): Promise<AnalysisResult[]> => {
  try {
    const { data } = await apiClient.get('/analyses');
    return data;
  } catch (error) {
    console.error('Failed to fetch analyses:', error);
    return [];
  }
};

export const deleteAnalysis = async (id: string) => {
  try {
    await apiClient.delete(`/analyses/${id}`);
  } catch (error) {
    console.error('Failed to delete analysis:', error);
    throw error;
  }
};

export const getAnalysis = async (id: string) => {
  try {
    const { data } = await apiClient.get(`/analyses/${id}`);
    return data;
  } catch (error) {
    console.error('Failed to get analysis:', error);
    throw error;
  }
};

// Migration helper: Move legacy localStorage/IDB data to Core API
// Note: This is a one-time simplified migration from localStorage only for now
export const migrateFromLocalStorage = async () => {
  try {
    const raw = localStorage.getItem('techSpec_history');
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        console.log(`Migrating ${data.length} items to Core API...`);
        for (const item of data) {
          // Check if already exists? API doesn't check duplicates yet, but we can just push.
          // Or we rely on ID.
          try {
             const analysis = { ...item, id: item.id || Date.now().toString() + Math.random() };
             await saveAnalysis(analysis);
          } catch (e) {
             console.warn("Skipping item migration due to error", e);
          }
        }
      }
      localStorage.removeItem('techSpec_history'); // Clear after attempt
      console.log("Migration complete.");
    }
  } catch (e) {
    console.warn("Migration failed", e);
  }
};