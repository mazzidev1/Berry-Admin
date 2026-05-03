import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SurveyQuestion {
  type: "text" | "radio" | "checkbox" | "scale";
  prompt: string;
  required: boolean;
  options?: string[];
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  category: string;
  reward: number;
  completions: number;
  targetLimit: number | null;
  status: 'active' | 'draft' | 'closed';
  createdAt: string;
  questions: SurveyQuestion[];
}

interface SurveyState {
  surveys: Survey[];
  isLoading: boolean;
  fetchSurveys: () => Promise<void>;
  addSurvey: (survey: Omit<Survey, 'id' | 'createdAt' | 'completions'>) => void;
  updateSurvey: (id: string, updates: Partial<Survey>) => void;
  deleteSurvey: (id: string) => void;
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set) => ({
      surveys: [],
      isLoading: false,
      fetchSurveys: async () => {
        set({ isLoading: true });
        // Simulate initial data if empty
        await new Promise(r => setTimeout(r, 500));
        set((state) => {
          if (state.surveys.length > 0) return { isLoading: false };
          
          const initialSurveys: Survey[] = [
            {
              id: 'srv-1',
              title: "Financial Habits 2026",
              category: "Finance",
              reward: 250,
              completions: 1240,
              targetLimit: 5000,
              status: 'active',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
              questions: [{ type: 'text', prompt: 'How much do you save monthly?', required: true }]
            },
            {
              id: 'srv-2',
              title: "Tech Stack Preference",
              category: "Tech",
              reward: 150,
              completions: 850,
              targetLimit: 1000,
              status: 'active',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
              questions: [{ type: 'radio', prompt: 'Preferred Framework?', required: true, options: ['React', 'Vue', 'Next.js'] }]
            }
          ];
          return { surveys: initialSurveys, isLoading: false };
        });
      },
      addSurvey: (surveyData) => {
        const newSurvey: Survey = {
          ...surveyData,
          id: `srv-${Date.now()}`,
          createdAt: new Date().toISOString(),
          completions: 0,
        };
        set((state) => ({ surveys: [newSurvey, ...state.surveys] }));
      },
      updateSurvey: (id, updates) => {
        set((state) => ({
          surveys: state.surveys.map(s => s.id === id ? { ...s, ...updates } : s)
        }));
      },
      deleteSurvey: (id) => {
        set((state) => ({
          surveys: state.surveys.filter(s => s.id !== id)
        }));
      }
    }),
    {
      name: 'survey-storage',
    }
  )
);
