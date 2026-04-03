import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface AppStateValues {
    activeTab: DiscoverTabs;
    filters: Record<string, unknown>;
    tickerTokens: Array<MergedBagsTokenWithPool>;
}

interface AppStateActions {
    createShareableLink: () => string;
    readShareableLink: () => void;
    setActiveTab: (tab: AppStateValues["activeTab"]) => void;
    setFilters: (filters: AppStateValues["filters"]) => void;
    setTickerTokens: (tokens: Array<MergedBagsTokenWithPool>) => void;
}

export type AppState = AppStateValues & AppStateActions;

export const useClientViewState = create<AppState>()(
    immer((set, get) => ({
        activeTab: "trending",
        filters: {},
        tickerTokens: [],

        createShareableLink() {
            const { activeTab, filters } = get();
            const params = btoa(JSON.stringify({ activeTab, filters }));
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

        setTickerTokens: (tokens) => set({ tickerTokens: tokens }),
    })),
);
