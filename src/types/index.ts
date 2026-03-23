export type WidgetType = 'kpi' | 'area' | 'bar' | 'table' | 'text' | 'gauge';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
  

}



export interface KPIConfig{
  value: string;
  label: string;
trend : string;
isPositive : boolean;
}

export interface ChartConfig {
  title: string;
  dataSourceUrl : string;
  xKey : string;
  yKey : string;
}

export interface TableConfig {
  title: string ;
  dataSourceUrl : string;
}

export interface TextConfig {
  content : string;
}

export interface GaugeConfig {
  value:number;
  label : string;
  max : number;
}

// ─── Discriminated union ────────────────────────

export type WidgetConfig = 
  | { type: 'kpi';   config: KPIConfig }
  | { type: 'area';  config: ChartConfig }
  | { type: 'bar';   config: ChartConfig }
  | { type: 'table'; config: TableConfig }
  | { type: 'text';  config: TextConfig }
  | { type: 'gauge'; config: GaugeConfig };


  // ─── Core Widget ─────────────────────────────────────────
   export type Widget ={
    id: string;
    title : string;
    position:Position;
    size: Size;
    aiGenerated?: boolean;
   } & WidgetConfig;

   // ─── Canvas state ─────────────────────────────────────────────────────────────

   export interface CanvasState {
    widgets: Widget[];
    selectedId : string | null;
   }

   // ─── History state ────────────────────────────────────────────────────────────
 export interface HistoryState {
  past : CanvasState[];
  present : CanvasState;
  future : CanvasState[];
 }


   // ─── Data binding ──────────────────────────────────────────
export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface DataBinding {
  widgetId: string;
  url: string;
  status: FetchStatus;
  data: unknown[];
  error: string | null;
}

export interface DataState {
  bindings: Record<string, DataBinding>;
}

   // ─── Sidebar catalog ─────────────
   export interface CatalogItem {
  type: WidgetType;
  label: string;
  icon: string;
  accentColor: string;
  defaultSize: Size;
}
