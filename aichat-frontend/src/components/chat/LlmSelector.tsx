"use client";
import { useLlmStore } from "@/stores/llmStore";

export default function LlmSelector() {
    const { selectedLlm, setSelectedLlm } = useLlmStore();

    return (
        <div className="flex items-center gap-2 p-2 text-white ">
            <select
                value={selectedLlm}
                onChange={(e) => setSelectedLlm(e.target.value)}
                className="rounded-lg px-2 py-1"
            >
                <option className="bg-[#1c4570]" value="openai">GPT-4o-mini</option>
                <option className="bg-[#1c4570]" value="gemini">Gemini-2.0-flash</option>
            </select>
        </div>
    );
}
