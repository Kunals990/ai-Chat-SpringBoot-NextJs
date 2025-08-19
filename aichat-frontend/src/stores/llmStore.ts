import { create } from "zustand";

interface LlmStore {
    selectedLlm: string;
    setSelectedLlm: (llm: string) => void;
}

export const useLlmStore = create<LlmStore>((set) => ({
    selectedLlm: "gemini", // default
    setSelectedLlm: (llm) => set({ selectedLlm: llm }),
}));