"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TSelectOption {
    value: string | number;
    label: string;
    icon?: React.ElementType;
    disabled?: boolean;
}

interface IAppSelectProps {
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (value: string) => void;
    options: TSelectOption[];
    placeholder?: string;
    icon?: React.ElementType;
    hasError?: boolean;
    className?: string;
    disabled?: boolean;
}

export function AppSelect({
    value,
    defaultValue,
    onChange,
    options,
    placeholder = "Seleccionar...",
    icon: LeftIcon,
    hasError,
    className,
    disabled = false,
}: IAppSelectProps) {
    const val = value !== undefined ? String(value) : undefined;
    const defVal = defaultValue !== undefined ? String(defaultValue) : undefined;

    return (
        <SelectPrimitive.Root
            value={val}
            defaultValue={defVal}
            onValueChange={onChange}
            disabled={disabled}
        >
            <SelectPrimitive.Trigger
                className={cn(
                    "flex items-center gap-2.5 w-full h-12 px-4 rounded-xl transition-all duration-200",
                    "bg-muted/30 border text-[15px] font-semibold text-foreground outline-none",
                    "hover:bg-muted/50",
                    "focus:border-primary/40 focus:ring-2 focus:ring-primary/10",
                    "data-[placeholder]:text-muted-foreground/45",
                    "select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                    hasError ? "border-destructive/60 focus:ring-destructive/10 focus:border-destructive/60" : "border-border/50",
                    className
                )}
            >
                {LeftIcon && (
                    <LeftIcon className="size-3.5 text-muted-foreground/50 shrink-0" strokeWidth={2} />
                )}
                <SelectPrimitive.Value placeholder={placeholder} className="flex-1 text-left truncate" />
                <SelectPrimitive.Icon asChild>
                    <ChevronDown className="size-3.5 text-muted-foreground/50 shrink-0 ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180" strokeWidth={2.5} />
                </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>

            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    position="popper"
                    sideOffset={6}
                    className={cn(
                        "z-[99999999] min-w-[var(--radix-select-trigger-width)] overflow-hidden",
                        "bg-card border border-border/50 rounded-xl shadow-xl shadow-black/10",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                        "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
                    )}
                >
                    <SelectPrimitive.Viewport className="p-1.5">
                        {options.map((opt) => (
                            <SelectPrimitive.Item
                                key={opt.value}
                                value={String(opt.value)}
                                disabled={opt.disabled}
                                className={cn(
                                    "relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium",
                                    "cursor-pointer select-none outline-none text-foreground",
                                    "data-[highlighted]:bg-muted/60 data-[highlighted]:text-foreground",
                                    "data-[state=checked]:text-primary data-[state=checked]:bg-primary/5",
                                    "transition-colors duration-100",
                                    opt.disabled && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {opt.icon && (
                                    <opt.icon
                                        className="size-3.5 text-muted-foreground data-[state=checked]:text-primary shrink-0"
                                        strokeWidth={2}
                                    />
                                )}
                                <SelectPrimitive.ItemText className="flex-1">{opt.label}</SelectPrimitive.ItemText>
                                <SelectPrimitive.ItemIndicator className="ml-auto">
                                    <Check className="size-3.5 text-primary" strokeWidth={2.5} />
                                </SelectPrimitive.ItemIndicator>
                            </SelectPrimitive.Item>
                        ))}
                    </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    );
}
