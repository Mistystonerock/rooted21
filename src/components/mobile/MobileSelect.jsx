import { useState } from "react";
import { C } from "@/lib/rooted-constants";
import { ChevronDown } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

/**
 * Native-style mobile select using custom bottom sheet (Drawer).
 * Replaces HTML <select> for consistent mobile UX.
 */
export default function MobileSelect({
  value,
  onChange,
  options, // [{ label: string, value: any }, ...]
  label = "",
  placeholder = "Select...",
  disabled = false,
  ariaLabel = null,
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className="w-full flex items-center justify-between rounded-lg px-3 py-3 text-left"
        style={{
          border: `1.5px solid ${C.cream}`,
          background: C.offWhite,
          color: C.darkGreen,
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.5 : 1,
        }}
        aria-label={ariaLabel || label}
        aria-haspopup="listbox"
      >
        <span className="text-sm font-medium">{selectedLabel}</span>
        <ChevronDown size={16} color={C.mutedText} />
      </button>

      {/* Bottom sheet drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-base" style={{ color: C.darkGreen }}>
              {label || "Select Option"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-2 max-h-96 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="w-full text-left py-3.5 px-3 rounded-lg font-medium transition-all"
                style={{
                  background: value === option.value ? C.darkGreen : C.white,
                  color: value === option.value ? C.cream : C.darkGreen,
                  border: `1px solid ${C.cream}`,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}