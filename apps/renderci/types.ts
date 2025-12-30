
export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; width: number; height: number };
export type SelectionTool = 'box' | 'lasso';

export type Layer = {
    id: string;
    prompt: string;
    selectionRects: Rect[];
    lassoPaths: Point[][];
};

export type StylePreset = 'realistic' | 'sketch' | 'site_plan' | 'section';
export type Resolution = '1K' | '2K' | '4K';
export type NavigationDirection = 'forward' | 'backward' | 'left' | 'right' | 'up' | 'down';

export type SavedPrompt = {
    id: number;
    title: string;
    content: string;
    createdAt: number;
};
