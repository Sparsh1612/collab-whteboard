import { create } from 'zustand';
import { ToolType, StyleDefaults, DEFAULT_STYLE } from '@whiteboard/shared';

export interface DevMetrics {
  fps: number;
  renderTimeMs: number;
  visibleCount: number;
  totalCount: number;
  wsLatencyMs: number;
}

interface UIState {
  activeTool: ToolType;
  selectedIds: string[];
  style: StyleDefaults;
  theme: 'dark' | 'light';
  snappingEnabled: boolean;
  isPanning: boolean;
  isSpacePressed: boolean;
  
  // Modals & Panels
  showShortcuts: boolean;
  showShare: boolean;
  showExport: boolean;
  showPerf: boolean;
  devMetrics: DevMetrics;

  // Actions
  setActiveTool: (tool: ToolType) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelectId: (id: string) => void;
  clearSelection: () => void;
  setStyle: (style: Partial<StyleDefaults>) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setSnappingEnabled: (enabled: boolean) => void;
  setIsPanning: (panning: boolean) => void;
  setIsSpacePressed: (pressed: boolean) => void;
  setShowShortcuts: (show: boolean) => void;
  setShowShare: (show: boolean) => void;
  setShowExport: (show: boolean) => void;
  setShowPerf: (show: boolean) => void;
  setDevMetrics: (metrics: Partial<DevMetrics>) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  activeTool: 'select',
  selectedIds: [],
  style: DEFAULT_STYLE,
  theme: 'dark',
  snappingEnabled: true,
  isPanning: false,
  isSpacePressed: false,
  
  showShortcuts: false,
  showShare: false,
  showExport: false,
  showPerf: false,
  devMetrics: {
    fps: 60,
    renderTimeMs: 1.2,
    visibleCount: 0,
    totalCount: 0,
    wsLatencyMs: 0,
  },

  setActiveTool: (activeTool) => {
    // If switching away from select tool, clear selection
    if (activeTool !== 'select') {
      set({ activeTool, selectedIds: [] });
    } else {
      set({ activeTool });
    }
  },

  setSelectedIds: (selectedIds) => set({ selectedIds }),

  toggleSelectId: (id) => {
    const current = get().selectedIds;
    if (current.includes(id)) {
      set({ selectedIds: current.filter((x) => x !== id) });
    } else {
      set({ selectedIds: [...current, id] });
    }
  },

  clearSelection: () => set({ selectedIds: [] }),

  setStyle: (styleUpdates) =>
    set({
      style: { ...get().style, ...styleUpdates },
    }),

  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  setSnappingEnabled: (snappingEnabled) => set({ snappingEnabled }),
  setIsPanning: (isPanning) => set({ isPanning }),
  setIsSpacePressed: (isSpacePressed) => set({ isSpacePressed }),

  setShowShortcuts: (showShortcuts) => set({ showShortcuts }),
  setShowShare: (showShare) => set({ showShare }),
  setShowExport: (showExport) => set({ showExport }),
  setShowPerf: (showPerf) => set({ showPerf }),

  setDevMetrics: (metrics) =>
    set({
      devMetrics: { ...get().devMetrics, ...metrics },
    }),
}));
