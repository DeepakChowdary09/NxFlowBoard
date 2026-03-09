import { CanvasState, HistoryState, Widget } from '@/types';


// ─── Default canvas state ─────────────────────────────────────────────────────

const defaultCanvas: CanvasState = {
  widgets: [],
  selectedId: null,
};

// ─── Canvas + History actions ─────────────────────────────────────────────────

interface CanvasActions {
  // Selection
  selectWidget: (id: string | null) => void;

  // Widget CRUD
  addWidget: (widget: Widget) => void;
  moveWidget: (id: string, x: number, y: number) => void;
  resizeWidget: (id: string, width: number, height: number) => void;
  updateWidget: (id: string, patch: Partial<Widget>) => void;
  deleteWidget: (id: string) => void;

  // History
  undo: () => void;
  redo: () => void;

  // Bulk
  loadWidgets: (widgets: Widget[]) => void;
  clearCanvas: () => void;
}

interface CanvasStore extends HistoryState, CanvasActions {}


// ─── Pure reducer ─────────────────────────────────────────────────────────────

function applyAction(
  state: CanvasState,
  action: { type: string; payload: unknown }
): CanvasState {
  switch (action.type) {
    case 'SELECT':
      return { ...state, selectedId: action.payload as string | null };

    case 'ADD': {
      const widget = action.payload as Widget;
      return {
        ...state,
        widgets: [...state.widgets, widget],
        selectedId: widget.id,
      };
    }

    case 'MOVE': {
      const { id, x, y } = action.payload as { id: string; x: number; y: number };
      return {
        ...state,
        widgets: state.widgets.map(w =>
          w.id === id
            ? { ...w, position: { x: Math.max(0, x), y: Math.max(0, y) } }
            : w
        ),
      };
    }

    case 'RESIZE': {
      const { id, width, height } = action.payload as { id: string; width: number; height: number };
      return {
        ...state,
        widgets: state.widgets.map(w =>
          w.id === id
            ? { ...w, size: { width: Math.max(80, width), height: Math.max(60, height) } }
            : w
        ),
      };
    }

    case 'UPDATE': {
      const { id, patch } = action.payload as { id: string; patch: Partial<Widget> };
      return {
        ...state,
        widgets: state.widgets.map(w => (w.id === id ? { ...w, ...patch }  as Widget : w)),
      };
    }

    case 'DELETE':
      return {
        ...state,
        widgets: state.widgets.filter(w => w.id !== (action.payload as string)),
        selectedId:
          state.selectedId === (action.payload as string) ? null : state.selectedId,
      };

    case 'LOAD':
      return { widgets: action.payload as Widget[], selectedId: null };

    case 'CLEAR':
      return defaultCanvas;

    default:
      return state;
  }
}

// ─── Zustand canvas store ─────────────────────────────────────────────────────

export const useCanvasStore = create<CanvasStore>()(set => ({
  // Initial state
  past: [],
  present: defaultCanvas,
  future: [],

  // Selection — never goes into history
 selectWidget: (id: string | null) =>
    set((s) => ({
      present: applyAction(s.present, { type: 'SELECT', payload: id }),
    })),

  // Add — pushes to history
 addWidget: (widget: Widget) =>
    set((s) => ({
      past: [...s.past.slice(-30), s.present],
      present: applyAction(s.present, { type: 'ADD', payload: widget }),
      future: [],
    })),

  // Move — pushes to history
 moveWidget: (id: string, x: number, y: number) =>
    set((s) => ({
      past: [...s.past.slice(-30), s.present],
      present: applyAction(s.present, { type: 'MOVE', payload: { id, x, y } }),
      future: [],
    })),

  // Resize — pushes to history
  resizeWidget: (id: string, width: number, height: number) =>
    set((s) => ({
      past: [...s.past.slice(-30), s.present],
      present: applyAction(s.present, { type: 'RESIZE', payload: { id, width, height } }),
      future: [],
    })),

  // Update — pushes to history
 updateWidget: (id: string, patch: Partial<Widget>) =>
    set((s) => ({
      past: [...s.past.slice(-30), s.present],
      present: applyAction(s.present, { type: 'UPDATE', payload: { id, patch } }),
      future: [],
    })),

  // Delete — pushes to history
 deleteWidget: (id: string) =>
    set((s) => ({
      past: [...s.past.slice(-30), s.present],
      present: applyAction(s.present, { type: 'DELETE', payload: id }),
      future: [],
    })),

  // Undo
  undo: () =>
    set((s) => {
      if (s.past.length === 0) return s;
      const previous = s.past[s.past.length - 1];
      return {
        past: s.past.slice(0, -1),
        present: previous,
        future: [s.present, ...s.future],
      };
    }),

  // Redo
  redo: () =>
    set((s) => {
      if (s.future.length === 0) return s;
      const next = s.future[0];
      return {
        past: [...s.past, s.present],
        present: next,
        future: s.future.slice(1),
      };
    }),

  // Load saved layout
  loadWidgets: (widgets: Widget[]) =>
    set((s) => ({
      past: [...s.past.slice(-30), s.present],
      present: applyAction(s.present, { type: 'LOAD', payload: widgets }),
      future: [],
    })),

  // Clear canvas
  clearCanvas: () =>
    set((s) => ({
      past: [...s.past.slice(-30), s.present],
      present: defaultCanvas,
      future: [],
    })),
}));