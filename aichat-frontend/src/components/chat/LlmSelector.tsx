"use client";
import { useLlmStore } from "@/stores/llmStore";

export default function LlmSelector() {
    const { selectedLlm, setSelectedLlm } = useLlmStore();

    return (
        <div className="flex items-center gap-2 p-2">
            <label className="text-sm font-medium">Model:</label>
            <select
                value={selectedLlm}
                onChange={(e) => setSelectedLlm(e.target.value)}
                className="border rounded-lg px-2 py-1"
            >
                <option value="openai">GPT-4o-mini</option>
                <option value="gemini">Gemini-2.0-flash</option>
            </select>
        </div>
    );
}
