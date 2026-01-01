import { create } from 'zustand';
import { createProjectSlice, ProjectSlice } from './slices/project-slice';
import { createTaskSlice, TaskSlice } from './slices/task-slice';
import { createAssetSlice, AssetSlice } from './slices/asset-slice';

import { createRiskSlice, RiskSlice } from './slices/risk-slice';
import { createEVMSlice, EVMSlice } from './slices/evm-slice';

// Combined State Type
export type ProjectState = ProjectSlice & TaskSlice & AssetSlice & RiskSlice & EVMSlice;

// Use proper type composition with StateCreator generics
// The slices are designed to be composed - AssetSlice specifies its dependency on ProjectSlice
export const useProjectStore = create<ProjectState>()((...args) => ({
  ...createProjectSlice(...args),
  ...createTaskSlice(...args),
  ...createAssetSlice(...(args as Parameters<typeof createAssetSlice>)),
  ...createRiskSlice(...(args as Parameters<typeof createRiskSlice>)),
  ...createEVMSlice(...(args as Parameters<typeof createEVMSlice>)),
}));
