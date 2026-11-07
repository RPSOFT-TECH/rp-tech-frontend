"use client";

import * as React from "react";
import { Calendar } from "primereact/calendar";
import { addLocale } from "primereact/api";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import dayjs from "dayjs";

addLocale("es", {
    firstDayOfWeek: 1,
    dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
    monthNames: [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ],
    monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    today: "Hoy",
    clear: "Limpiar"
});

interface IAppDateRangePickerProps {
    startDate?: string; // YYYY-MM-DD
    endDate?: string;   // YYYY-MM-DD
    onChange?: (start: string, end: string) => void;
    className?: string;
}

export function AppDateRangePicker({
    startDate = "",
    endDate = "",
    onChange,
    className,
}: IAppDateRangePickerProps) {
    const firma = `${startDate}|${endDate}`;
    const [firmaPrev, setFirmaPrev] = React.useState(firma);
    const [dates, setDates] = React.useState<Date[] | null>(() => (
        startDate && endDate ? [dayjs(startDate).toDate(), dayjs(endDate).toDate()] : null
    ));
    if (firma !== firmaPrev) {
        setFirmaPrev(firma);
        setDates(startDate && endDate ? [dayjs(startDate).toDate(), dayjs(endDate).toDate()] : null);
    }
    const dialogo = typeof document === "undefined" ? null : document.querySelector("[role='dialog']");
    const mountNode: HTMLElement | undefined = typeof document === "undefined"
        ? undefined
        : dialogo instanceof HTMLElement
            ? dialogo
            : document.body;

    const handleChange = (event: { value?: (Date | null)[] | null }) => {
        const lista = Array.isArray(event.value)
            ? event.value.filter((item): item is Date => item instanceof Date)
            : [];
        setDates(lista.length > 0 ? lista : null);
        if (lista.length >= 2 && onChange) {
            onChange(
                dayjs(lista[0]).format("YYYY-MM-DD"),
                dayjs(lista[1]).format("YYYY-MM-DD")
            );
        }
    };

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            <Calendar
                value={dates}
                onChange={handleChange}
                selectionMode="range"
                locale="es"
                readOnlyInput
                hideOnRangeSelection
                numberOfMonths={2}
                appendTo={mountNode || "self"}
                placeholder="DD-MM-YYYY  →  DD-MM-YYYY"
                dateFormat="dd-mm-yy"
                className="w-full"
                showIcon
                icon={() => <CalendarIcon className="size-4.5 text-white" strokeWidth={2} />}
            />
            
            <style jsx global>{`
                .p-calendar.w-full {
                    width: 100%;
                }
                .p-calendar .p-inputtext {
                    font-family: inherit;
                    font-size: 13.5px;
                    padding-left: 14px;
                    padding-right: 14px;
                    border-radius: 8px 0 0 8px;
                    border: 1px solid rgba(0,0,0,0.1);
                    border-right: none;
                    background: transparent;
                    height: 38px;
                    cursor: pointer;
                    color: inherit;
                    width: 100%;
                    text-align: center;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                .dark .p-calendar .p-inputtext {
                    border-color: rgba(255,255,255,0.1);
                }
                .p-calendar .p-datepicker-trigger {
                    border-radius: 0 8px 8px 0;
                    width: 46px;
                    height: 38px;
                }
                 .p-calendar .p-datepicker-trigger:active,
                 .p-calendar .p-datepicker-trigger:focus {
                     box-shadow: none !important;
                     outline: none !important;
                 }
                
                .p-calendar .p-button {
                    background-color: var(--primary) !important;
                    border-color: var(--primary) !important;
                }
                .p-calendar .p-button:hover {
                    background-color: var(--primary) !important;
                    border-color: var(--primary) !important;
                }
                
                
                
                
                
                .p-datepicker {
                    pointer-events: auto !important;
                    z-index: 9999999 !important;
                    padding: 0.75rem !important;
                    background: white !important;
                    border-radius: 16px !important;
                    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.2) !important;
                    border: 1px solid rgba(0,0,0,0.05) !important;
                    font-family: inherit !important;
                }
                .dark .p-datepicker {
                    background: hsl(0 0% 12%) !important;
                    border-color: rgba(255,255,255,0.1) !important;
                }
                
                
                .p-datepicker-multiple-month .p-datepicker-group-container {
                    display: flex;
                    gap: 1.5rem;
                }
                
                .p-datepicker table {
                    font-size: 0.85rem !important;
                    margin: 0.25rem 0 !important;
                }
                .p-datepicker table th {
                    padding: 0.25rem !important;
                    color: #888 !important;
                    font-weight: 600 !important;
                }
                .p-datepicker table td {
                    padding: 0 !important;
                }
                
                
                .p-datepicker table td > span {
                    width: 2.2rem !important;
                    height: 2.2rem !important;
                    border-radius: 8px !important;
                    color: #444 !important;
                    transition: all 0.2s !important;
                    margin: 2px 0;
                }
                .dark .p-datepicker table td > span {
                    color: #ddd !important;
                }
                
                
                .p-datepicker table td > span.p-highlight {
                    background: var(--primary) !important;
                    color: white !important;
                    font-weight: 700 !important;
                    border-radius: 8px !important;
                }
                
                
                .p-datepicker table td:has(span.p-highlight.p-highlight-transition) {
                    background: color-mix(in oklch, var(--primary) 12%, transparent) !important; 
                }
                
                
                .p-datepicker table td span.p-highlight.p-highlight-transition {
                    background: transparent !important;
                    color: #333 !important;
                    font-weight: 500 !important;
                    border-radius: 0 !important; 
                    width: 100% !important;
                }
                .dark .p-datepicker table td span.p-highlight.p-highlight-transition {
                   color: #fff !important; 
                   background: color-mix(in oklch, var(--primary) 18%, transparent) !important;
                }

                .p-datepicker table td > span:hover:not(.p-highlight) {
                    background: rgba(0,0,0,0.05) !important;
                }
                .dark .p-datepicker table td > span:hover:not(.p-highlight) {
                    background: rgba(255,255,255,0.1) !important;
                }
                
            `}</style>
        </div>
    );
}
