import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { ChevronDown, X } from "lucide-react";

export default function DocumentSearchFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  allTags,
  selectedTags,
  onTagsChange,
}) {
  const [showTags, setShowTags] = useState(false);

  function toggleTag(tag) {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  }

  return (
    <div className="space-y-3">
      {/* Category filter */}
      <div className="rounded-2xl p-3" style={{ background: "#fff", border: `1px solid ${C.cream}` }}>
        <select
          value={selectedCategory}
          onChange={e => onCategoryChange(e.target.value)}
          className="w-full px-2 py-1.5 rounded-lg text-xs border outline-none"
          style={{ borderColor: C.cream, background: C.offWhite }}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div>
          <button
            onClick={() => setShowTags(!showTags)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl"
            style={{ background: "#fff", border: `1px solid ${C.cream}`, cursor: "pointer" }}
          >
            <p className="text-xs font-bold" style={{ color: C.darkGreen }}>
              Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
            </p>
            <ChevronDown size={14} color={C.mutedText} style={{ transform: showTags ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </button>

          {showTags && (
            <div className="mt-2 rounded-xl p-3 flex flex-wrap gap-1.5" style={{ background: C.offWhite, border: `1px solid ${C.cream}` }}>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold transition-all"
                  style={{
                    background: selectedTags.includes(tag) ? C.darkGreen : C.cream,
                    color: selectedTags.includes(tag) ? "#fff" : C.darkGreen,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active filters display */}
      {(selectedTags.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map(tag => (
            <div
              key={tag}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
              style={{ background: C.darkGreen + "22", color: C.darkGreen, border: `1px solid ${C.darkGreen}55` }}
            >
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="p-0 leading-none"
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit" }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}