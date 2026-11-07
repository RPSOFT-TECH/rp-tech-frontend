"use client";

import * as React from "react";
import { FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";

interface IDataTableEmptyProps {
    title?: string;
    description?: string;
    
    action?: React.ReactNode;
    className?: string;
}

export function DataTableEmpty({
    title = "Sin registros",
    description = "No hay datos para mostrar en este momento.",
    action,
    className,
}: IDataTableEmptyProps): React.ReactElement {
    return (
        <div
            className={cn(
                "w-full flex flex-col items-center justify-center gap-4",
                "py-16 px-6 rounded-2xl border border-dashed border-border/60 bg-card/50",
                className
            )}
        >
            {}
            <div className="size-16 rounded-2xl bg-muted/60 flex items-center justify-center shadow-inner">
                <FileSearch className="size-7 text-muted-foreground/40" strokeWidth={1.5} />
            </div>

            <div className="text-center space-y-1.5 max-w-xs">
                <p className="text-[14.5px] font-bold text-foreground">{title}</p>
                <p className="text-[12.5px] text-muted-foreground/70 leading-relaxed">
                    {description}
                </p>
            </div>

            {action && <div className="mt-1">{action}</div>}
        </div>
    );
}
