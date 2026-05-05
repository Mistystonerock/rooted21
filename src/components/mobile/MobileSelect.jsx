import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { ChevronDown, Check } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

/**
 * Mobile-native single-select using a bottom-sheet Drawer.
 * Replaces <select> for consistent iOS feel.
 *
 * Props:
 *   value       — current selected value
 *   onChange    — (value) => void
 *   options     — [{ label, value }]
 *   label       — string shown in drawer title and trigger aria-label
 *   placeholder — string shown when no value selected
 *   disabled    — bool
 */
export default function MobileSelect({
  value,
  onChange,
  options = [],
  label = "Select",
  placeholder = "Select…",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      {/* Trigger — min 44px height */}
      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-label={label}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 rounded-xl px-4 text-sm font-medium"
        style={{
          minHeight: 44,
          border: `1.5px solid ${C.cream}`,
          background: disabled ? C.cream : C.offWhite,
          color: selected ? C.darkGreen : C.mutedText,
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={16} color={C.mutedText} aria-hidden="true" />
      </button>

      {/* Bottom sheet */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-base font-bold" style={{ color: C.darkGreen }}>
              {label}
            </DrawerTitle>
          </DrawerHeader>

          <div
            role="listbox"
            aria-label={label}
            className="px-4 pb-8 space-y-2 overflow-y-auto"
            style={{ maxHeight: "60vh" }}
          >
            {options.map((option) => {
              const isActive = option.value === value;
              return (
                <button
                  key={option.value}
                  role="option"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-4 text-sm font-medium transition-all"
                  style={{
                    minHeight: 48,
                    background: isActive ? C.darkGreen : C.white,
                    color: isActive ? C.cream : C.darkGreen,
                    border: `1.5px solid ${isActive ? C.darkGreen : C.cream}`,
                    cursor: "pointer",
                  }}
                >
                  <span>{option.label}</span>
                  {isActive && <Check size={16} color={C.cream} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}