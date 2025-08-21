"use client";
import { useLlmStore } from "@/stores/llmStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LlmSelector() {
    const { selectedLlm, setSelectedLlm } = useLlmStore();

    return (
        <div className="flex items-center gap-2 p-2 text-white">
            <Select value={selectedLlm} onValueChange={setSelectedLlm}>
                <SelectTrigger className="w-38 rounded-lg border-accent-foreground">
                    <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="openai">GPT-4o-mini</SelectItem>
                    <SelectItem value="gemini">Gemini-2.0-flash</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}