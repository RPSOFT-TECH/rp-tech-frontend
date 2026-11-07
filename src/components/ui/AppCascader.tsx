"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ChevronRight, ChevronDown, Check, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CascaderOption {
    value: string | number;
    label: string;
    children?: CascaderOption[];
    loading?: boolean;
}

interface AppCascaderProps {
    value?: (string | number)[]; // Array de valores seleccionados [dept, prov, dist]
    onChange?: (values: (string | number)[], labels: string[]) => void;
    options: CascaderOption[];
    placeholder?: string;
    icon?: React.ElementType;
    hasError?: boolean;
    className?: string;
    disabled?: boolean;
    onLevelChange?: (level: number, parentValue: string | number) => void;
    labels?: string[]; // Labels actuales para mostrar en el trigger
    loading?: boolean[];
}

function CascaderColumn({
    opts,
    level,
    isLoading,
    selected,
    onSelect,
}: {
    opts: CascaderOption[];
    level: number;
    isLoading?: boolean;
    selected?: string | number;
    onSelect: (level: number, option: CascaderOption) => void;
}) {
    return (
        <div className="w-[180px] border-r border-border/40 last:border-0 h-[280px] overflow-y-auto p-1.5">
            {isLoading ? (
                <div className="flex items-center justify-center h-full opacity-50">
                    <Loader2 className="size-4 animate-spin text-primary" />
                </div>
            ) : opts.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[11px] text-muted-foreground italic">
                    {level === 0 ? "Sin datos" : "Seleccione nivel anterior"}
                </div>
            ) : (
                opts.map((opt) => {
                    const isSelected = selected === opt.value;
                    const hasChildren = Boolean(opt.children?.length) || level < 2;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onSelect(level, opt)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all text-left",
                                isSelected
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-foreground hover:bg-muted/60"
                            )}
                        >
                            <span className="truncate flex-1">{opt.label}</span>
                            {hasChildren ? (
                                <ChevronRight className={cn("size-3.5 opacity-40 shrink-0 ml-2", isSelected && "opacity-100")} />
                            ) : isSelected ? (
                                <Check className="size-3.5 shrink-0 ml-2 text-primary" />
                            ) : null}
                        </button>
                    );
                })
            )}
        </div>
    );
}

export function AppCascader({
    value = [],
    onChange,
    options,
    placeholder = "Seleccionar...",
    icon: LeftIcon = MapPin,
    hasError,
    className,
    disabled = false,
    onLevelChange,
    labels = [],
    loading = [false, false, false],
}: AppCascaderProps) {
    const [open, setOpen] = React.useState(false);
    const firma = `${value.join("|")}::${labels.join("|")}`;
    const [firmaPrev, setFirmaPrev] = React.useState(firma);
    const [tempValues, setTempValues] = React.useState<(string | number)[]>(value);
    const [tempLabels, setTempLabels] = React.useState<string[]>(labels);
    if (firma !== firmaPrev) {
        setFirmaPrev(firma);
        setTempValues(value);
        setTempLabels(labels);
    }

    const displayValue = tempLabels.length > 0 ? tempLabels.join(" / ") : "";

    const handleSelect = (level: number, option: CascaderOption) => {
        const newValues = [
            ...(level === 0 ? [] : tempValues.slice(0, level)),
            option.value
        ];
        const newLabels = [
            ...(level === 0 ? [] : tempLabels.slice(0, level)), 
            option.label
        ];
        
        setTempValues(newValues);
        setTempLabels(newLabels);

        if (option.children && option.children.length > 0) {
        } else if (onLevelChange && level < 2) {
            onLevelChange(level + 1, option.value);
        }

        if (level === 2) {
            onChange?.(newValues, newLabels);
            setOpen(false);
        }
    };

    const level0Options = options;
    const level1Options = tempValues[0] ? options.find(o => String(o.value) === String(tempValues[0]))?.children || [] : [];
    const level2Options = tempValues[1] ? level1Options.find(o => String(o.value) === String(tempValues[1]))?.children || [] : [];

    return (
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
            <PopoverPrimitive.Trigger asChild>
                <button
                    disabled={disabled}
                    className={cn(
                        "flex items-center gap-2.5 w-full h-12 px-4 rounded-xl transition-all duration-200",
                        "bg-muted/30 border text-[15px] font-semibold text-foreground outline-none text-left",
                        "hover:bg-muted/50",
                        "focus:border-primary/40 focus:ring-2 focus:ring-primary/10",
                        "select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                        hasError ? "border-destructive/60 focus:ring-destructive/10 focus:border-destructive/60" : "border-border/50",
                        className
                    )}
                >
                    {LeftIcon && <LeftIcon className="size-4 text-muted-foreground/50 shrink-0" strokeWidth={2} />}
                    <span className={cn("flex-1 truncate", !displayValue && "text-muted-foreground/45")}>
                        {displayValue || placeholder}
                    </span>
                    <ChevronDown className={cn("size-4 text-muted-foreground/50 shrink-0 transition-transform duration-200", open && "rotate-180")} />
                </button>
            </PopoverPrimitive.Trigger>

            <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content
                    align="start"
                    sideOffset={6}
                    className={cn(
                        "z-[99999999] flex bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden",
                        "animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
                    )}
                >
                    <CascaderColumn opts={level0Options} level={0} isLoading={loading[0]} selected={tempValues[0]} onSelect={handleSelect} />
                    <CascaderColumn opts={level1Options} level={1} isLoading={loading[1]} selected={tempValues[1]} onSelect={handleSelect} />
                    <CascaderColumn opts={level2Options} level={2} isLoading={loading[2]} selected={tempValues[2]} onSelect={handleSelect} />
                </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
    );
}
