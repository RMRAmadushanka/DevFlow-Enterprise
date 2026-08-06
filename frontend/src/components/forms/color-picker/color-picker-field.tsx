"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FieldShell } from "@/components/forms/shared/field-shell";
import { useControllableState } from "@/components/forms/shared/hooks";
import { fieldControlSizeClassName } from "@/components/forms/shared/size";
import { hexToRgb, hslToRgb, isValidHex, rgbToHex, rgbToHsl } from "./color-utils";
import { useRecentColors } from "./use-recent-colors";
import type { ColorPickerFieldProps } from "./types";

const defaultPresets = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E",
  "#10B981", "#14B8A6", "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6",
  "#A855F7", "#D946EF", "#EC4899", "#64748B", "#000000", "#FFFFFF",
];

type ColorFormat = "hex" | "rgb" | "hsl";

/** Hex/RGB/HSL color entry — a native `<input type="color">` drives the visual picker, kept in sync with editable text fields for each format, plus preset and recently-used swatches. */
function ColorPickerField({
  label,
  required,
  disabled,
  error,
  helperText,
  successText,
  validationState,
  size = "md",
  className,
  id,
  name,
  value,
  defaultValue = "#3B82F6",
  onValueChange,
  presetColors = defaultPresets,
  showRecentColors = true,
}: ColorPickerFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [format, setFormat] = React.useState<ColorFormat>("hex");
  const { colors: recentColors, addColor } = useRecentColors();

  const [hex, setHex] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const hsl = rgbToHsl(rgb);

  function commit(nextHex: string) {
    if (!isValidHex(nextHex)) return;
    setHex(nextHex);
  }

  return (
    <FieldShell
      label={label}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      successText={successText}
      validationState={validationState}
      size={size}
      className={className}
      id={id}
    >
      {({ controlId, ariaDescribedBy, ariaInvalid }) => (
        <Popover
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next && isValidHex(hex)) addColor(hex);
          }}
        >
          <PopoverTrigger
            render={
              <Button
                id={controlId}
                type="button"
                variant="outline"
                disabled={disabled}
                aria-invalid={ariaInvalid}
                aria-describedby={ariaDescribedBy}
                className={cn("w-full justify-start gap-2 font-normal", fieldControlSizeClassName[size])}
              />
            }
          >
            <span
              className="size-4 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: isValidHex(hex) ? hex : undefined }}
              aria-hidden="true"
            />
            <span className="font-mono uppercase">{hex}</span>
          </PopoverTrigger>

          <PopoverContent className="w-64" align="start">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={isValidHex(hex) ? hex : "#000000"}
                onChange={(event) => commit(event.target.value)}
                aria-label="Pick a color"
                className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
              />
              <div className="flex flex-1 rounded-md border border-input p-0.5 text-xs">
                {(["hex", "rgb", "hsl"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormat(option)}
                    className={cn(
                      "flex-1 rounded-[calc(var(--radius-md)-2px)] py-1 uppercase text-muted-foreground transition-colors",
                      format === option && "bg-muted text-foreground"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3">
              {format === "hex" ? (
                <Input
                  name={name}
                  value={hex}
                  onChange={(event) => commit(event.target.value)}
                  className="font-mono uppercase"
                  maxLength={7}
                />
              ) : format === "rgb" ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {(["r", "g", "b"] as const).map((channel) => (
                    <Input
                      key={channel}
                      type="number"
                      min={0}
                      max={255}
                      value={rgb[channel]}
                      aria-label={channel.toUpperCase()}
                      onChange={(event) =>
                        commit(rgbToHex({ ...rgb, [channel]: Number(event.target.value) }))
                      }
                      className="text-center"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    ["h", 360],
                    ["s", 100],
                    ["l", 100],
                  ] as const).map(([channel, max]) => (
                    <Input
                      key={channel}
                      type="number"
                      min={0}
                      max={max}
                      value={hsl[channel]}
                      aria-label={channel.toUpperCase()}
                      onChange={(event) =>
                        commit(rgbToHex(hslToRgb({ ...hsl, [channel]: Number(event.target.value) })))
                      }
                      className="text-center"
                    />
                  ))}
                </div>
              )}
            </div>

            {presetColors.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {presetColors.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    aria-label={preset}
                    onClick={() => commit(preset)}
                    style={{ backgroundColor: preset }}
                    className={cn(
                      "size-5 rounded-full border border-border/50 transition-transform hover:scale-110",
                      hex.toLowerCase() === preset.toLowerCase() && "ring-2 ring-ring ring-offset-1 ring-offset-popover"
                    )}
                  />
                ))}
              </div>
            ) : null}

            {showRecentColors && recentColors.length > 0 ? (
              <div className="mt-3 border-t border-border pt-3">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Recent</p>
                <div className="flex flex-wrap gap-1.5">
                  {recentColors.map((recent) => (
                    <button
                      key={recent}
                      type="button"
                      aria-label={recent}
                      onClick={() => commit(recent)}
                      style={{ backgroundColor: recent }}
                      className="size-5 rounded-full border border-border/50 transition-transform hover:scale-110"
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </PopoverContent>
        </Popover>
      )}
    </FieldShell>
  );
}

export { ColorPickerField };
