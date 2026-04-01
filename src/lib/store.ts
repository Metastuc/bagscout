import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface AppStateValues {
    activeTab: NavigationTab;
    filters: Record<string, unknown>;
    tablePageIndex: number;
    tablePageSize: number;
    tickerTokens: Array<MergedBagsTokenWithPool>;
}

interface AppStateActions {
    createShareableLink: () => string;
    readShareableLink: () => void;
    setActiveTab: (tab: AppStateValues["activeTab"]) => void;
    setFilters: (filters: AppStateValues["filters"]) => void;
    setTablePageIndex: (index: number) => void;
    setTablePageSize: (size: number) => void;
    setTickerTokens: (tokens: Array<MergedBagsTokenWithPool>) => void;
}

export type AppState = AppStateValues & AppStateActions;

export const useClientViewState = create<AppState>()(
    immer((set, get) => ({
        activeTab: "trending",
        filters: {},
        tablePageIndex: 0,
        tablePageSize: 20,
        tickerTokens: [...Array(20)],

        createShareableLink() {
            const { activeTab, filters, tablePageIndex } = get();
            const params = btoa(JSON.stringify({ activeTab, filters, tablePageIndex }));
            return `${window.location.origin}?state=${params}`;
        },

        readShareableLink() {
            const urlParams = new URLSearchParams(window.location.search);
            const stateParam = urlParams.get("state");
            if (!stateParam) return;
            const state = JSON.parse(atob(stateParam));
            set(state);
        },

        setActiveTab: (tab) => set({ activeTab: tab }),

        setFilters: (filters) => set({ filters }),

        setTablePageIndex: (index) => set({ tablePageIndex: index }),

        setTablePageSize: (size) => set({ tablePageSize: size }),

        setTickerTokens: (tokens) => set({ tickerTokens: tokens }),
    })),
);
