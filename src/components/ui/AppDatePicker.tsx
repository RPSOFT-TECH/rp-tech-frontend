"use client";

import * as React from "react";
import { DatePicker, ConfigProvider } from "antd";
import es_ES from "antd/locale/es_ES";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

dayjs.locale("es");

interface IAppDatePickerProps {
    value?: string;
    onChange?: (e: { target: { value: string } }) => void;
    label?: string;
    hasError?: boolean;
    className?: string;
    disabled?: boolean;
    placeholder?: string;
    disabledDate?: (current: dayjs.Dayjs) => boolean;
}

export function AppDatePicker({
    value = "",
    onChange,
    label,
    hasError,
    className,
    disabled = false,
    placeholder = "Seleccionar fecha",
    disabledDate,
}: IAppDatePickerProps) {

    const dateValue = React.useMemo(() => {
        if (!value) return null;
        const d = dayjs(value, "YYYY-MM-DD");
        return d.isValid() ? d : null;
    }, [value]);

    const handleChange = (date: dayjs.Dayjs | null) => {
        if (date && date.isValid()) {
            const formatted = date.format("YYYY-MM-DD");
            onChange?.({ target: { value: formatted } });
        } else {
            onChange?.({ target: { value: "" } });
        }
    };

    return (
        <ConfigProvider
            locale={es_ES}
            theme={{
                token: {
                    colorPrimary: "var(--primary)",
                    borderRadius: 12,
                    fontFamily: "inherit",
                },
                components: {
                    DatePicker: {
                        controlHeight: 48,
                        activeBorderColor: "var(--primary)",
                        hoverBorderColor: "var(--primary)",
                        cellActiveWithRangeBg: "var(--accent)",
                    }
                }
            }}
        >
            <div className={cn("relative w-full group", className)}>
                {}
                {label && (
                    <span className={cn(
                        "absolute -top-2.5 left-3 px-1 bg-background z-10 text-[10px] uppercase tracking-wider font-bold transition-all duration-200",
                        hasError ? "text-destructive" : "text-muted-foreground/50 group-focus-within:text-primary"
                    )}>
                        {label}
                    </span>
                )}

                <DatePicker
                    value={dateValue}
                    onChange={handleChange}
                    disabled={disabled}
                    disabledDate={disabledDate}
                    placeholder={placeholder}
                    format="DD-MM-YYYY"
                    suffixIcon={<CalendarIcon className="size-4 text-muted-foreground/40" />}
                    className={cn(
                        "w-full h-12 rounded-xl bg-card border-border/50 font-medium text-[17px] transition-all",
                        "hover:border-primary/40 focus:border-primary shadow-sm",
                        hasError && "border-destructive/60 bg-destructive/5 hover:border-destructive/80",
                        disabled && "opacity-50 cursor-not-allowed bg-muted/20"
                    )}
                    allowClear={{
                        clearIcon: <span className="text-muted-foreground/40 hover:text-destructive">×</span>
                    }}
                />

                <style jsx global>{`
                    
                    .ant-picker-dropdown {
                        z-index: 99999999 !important;
                    }
                    .ant-picker-panel-container {
                        border-radius: 20px !important;
                        overflow: hidden !important;
                        box-shadow: 0 20px 50px -12px rgb(0 0 0 / 0.3) !important;
                        border: 1px solid color-mix(in srgb, var(--border) 40%, transparent) !important;
                        background: var(--card) !important;
                    }
                    .ant-picker-header {
                        border-bottom: 1px solid color-mix(in srgb, var(--border) 10%, transparent) !important;
                        padding: 12px 16px !important;
                    }
                    .ant-picker-header-view {
                        font-weight: 800 !important;
                        text-transform: capitalize;
                    }
                    .ant-picker-content th {
                        font-size: 11px !important;
                        font-weight: 800 !important;
                        color: var(--muted-foreground) !important;
                        opacity: 0.5;
                        text-transform: uppercase;
                        padding-bottom: 10px !important;
                    }
                    .ant-picker-cell-inner {
                        border-radius: 10px !important;
                        font-weight: 600 !important;
                        font-size: 13px !important;
                        transition: all 0.2s !important;
                    }
                    .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
                        border-radius: 10px !important;
                        border: 1px solid var(--primary) !important;
                    }
                    .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
                        background: var(--primary) !important;
                        color: white !important;
                        box-shadow: 0 8px 16px -4px color-mix(in srgb, var(--primary) 40%, transparent) !important;
                    }
                    
                    .dark .ant-picker-panel-container {
                        background: hsl(240 7% 12%) !important;
                        border-color: hsl(240 5% 20%) !important;
                    }
                    .dark .ant-picker-header {
                        color: hsl(0 0% 94%) !important;
                        border-bottom-color: hsl(240 5% 20%) !important;
                    }
                    .dark .ant-picker-header button {
                        color: hsl(0 0% 70%) !important;
                    }
                    .dark .ant-picker-header button:hover {
                        color: hsl(142 70% 45%) !important;
                    }
                    .dark .ant-picker-content th {
                        color: hsl(240 5% 60%) !important;
                    }
                    .dark .ant-picker-cell .ant-picker-cell-inner {
                        color: hsl(0 0% 85%) !important;
                    }
                    .dark .ant-picker-cell-disabled .ant-picker-cell-inner {
                        color: hsl(0 0% 40%) !important;
                    }
                    .dark .ant-picker-cell:not(.ant-picker-cell-in-view) .ant-picker-cell-inner {
                        color: hsl(0 0% 35%) !important;
                    }
                    .dark .ant-picker-footer {
                        border-top-color: hsl(240 5% 20%) !important;
                    }
                    .dark .ant-picker-today-btn {
                        color: hsl(142 70% 45%) !important;
                    }
                    .dark .ant-picker {
                        background: hsl(240 7% 12%) !important;
                        border-color: hsl(240 5% 20%) !important;
                        color: hsl(0 0% 90%) !important;
                    }
                    .dark .ant-picker input {
                        background: transparent !important;
                        color: hsl(0 0% 90%) !important;
                    }
                    .dark .ant-picker input::placeholder {
                        color: hsl(0 0% 50%) !important;
                    }
                `}</style>
            </div>
        </ConfigProvider>
    );
}
