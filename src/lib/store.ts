import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface AppStateValues {
    activeTab: DiscoverTabs;
    isAuthenticated: boolean;
}

interface AppStateActions {
    setActiveTab: (tab: AppStateValues["activeTab"]) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
}

type AppState = AppStateValues & AppStateActions;

export const useClientViewState = create<AppState>()(
    immer((set) => ({
        activeTab: "trending",
        isAuthenticated: false,

        setActiveTab(tab) {
            set({ activeTab: tab });
        },

        setIsAuthenticated(isAuthenticated) {
            set({ isAuthenticated });
        },
    })),
);

type ModalViews = "deploy" | "search" | "tokenDetails" | "watchlist";

interface ModalViewStateValues {
    isOpen: boolean;
    content: ModalViews | null;
}

interface ModalViewStateActions {
    openModal: (content: ModalViews) => void;
    closeModal: () => void;
}

type ModalViewState = ModalViewStateValues & ModalViewStateActions;

export const useModalViewStore = create<ModalViewState>()(
    immer((set) => ({
        content: null,
        isOpen: false,

        closeModal() {
            set({ isOpen: false, content: null });
        },

        openModal(content) {
            set({ isOpen: true, content });
        },
    })),
);
