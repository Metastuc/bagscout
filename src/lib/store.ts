import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface AppStateValues {
    activeTab: "trending" | "explore" | "collections" | "profile";
    filters: Record<string, unknown>;
    tablePageIndex: number;
    tablePageSize: number;
}

interface AppStateActions {
    setActiveTab: (tab: AppStateValues["activeTab"]) => void;
    setFilters: (filters: AppStateValues["filters"]) => void;
    setTablePageIndex: (index: number) => void;
    setTablePageSize: (size: number) => void;
    createShareableLink: () => string;
}

export type AppState = AppStateValues & AppStateActions;

export const clientAppState = create<AppState>()(
    immer((set, get) => ({
        activeTab: "trending",
        filters: {},
        tablePageIndex: 0,
        tablePageSize: 10,

        setActiveTab: (tab) => set({ activeTab: tab }),

        setFilters: (filters) => set({ filters }),

        setTablePageIndex: (index) => set({ tablePageIndex: index }),

        setTablePageSize: (size) => set({ tablePageSize: size }),

        createShareableLink() {
            const { activeTab, filters, tablePageIndex } = get();
            const params = btoa(JSON.stringify({ activeTab, filters, tablePageIndex }));
            return `${window.location.origin}?state=${params}`;
        }
    }))
);
