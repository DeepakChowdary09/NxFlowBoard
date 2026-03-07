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