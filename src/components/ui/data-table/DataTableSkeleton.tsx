"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface IDataTableSkeletonProps {
    
    rows?: number;
    
    columns?: number;
    
    columnWidths?: string[];
    
    columnAligns?: ("left" | "center" | "right")[];
    
    actionButtonsCount?: number;
    className?: string;
}

export function DataTableSkeleton({
    rows = 17,
    columns = 5,
    columnWidths,
    columnAligns,
    actionButtonsCount = 3,
    className,
}: IDataTableSkeletonProps): React.ReactElement {
    return (
        <div className={cn("w-full overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm flex flex-col h-full", className)}>
            <div className="flex-1 overflow-hidden">
                <table className="w-full text-sm border-collapse">
                    {}
                    <thead className="sticky top-0 z-20">
                        <tr className="border-b border-border/40 bg-muted/90 backdrop-blur-sm">
                            {Array.from({ length: columns }).map((_, i) => (
                                <th key={i} className="px-4 py-3.5" style={{ width: columnWidths?.[i] }}>
                                    <Skeleton className="h-3.5 w-24 rounded-md bg-muted-foreground/15" />
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {}
                    <tbody className="divide-y divide-border/10">
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={rowIndex % 2 === 0 ? "bg-card" : "bg-muted/5"}
                            >
                                {Array.from({ length: columns }).map((_, colIndex) => {
                                    const isLast = colIndex === columns - 1;
                                    const isFirst = colIndex === 0;
                                    const align = columnAligns?.[colIndex] || "left";

                                    if (isLast && actionButtonsCount > 0) {
                                        return (
                                            <td 
                                                key={colIndex} 
                                                className="px-4 py-2.5"
                                                style={{ textAlign: align }}
                                            >
                                                <div className={cn(
                                                    "flex items-center gap-1.5",
                                                    align === "center" && "justify-center",
                                                    align === "right" && "justify-end"
                                                )}>
                                                    {Array.from({ length: actionButtonsCount }).map((_, btnIdx) => (
                                                        <Skeleton 
                                                            key={btnIdx} 
                                                            className={cn(
                                                                "h-8 rounded-md bg-muted/60",
                                                                btnIdx % 3 === 0 ? "w-[68px]" : btnIdx % 3 === 1 ? "w-[84px]" : "w-[72px]"
                                                            )} 
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td 
                                            key={colIndex} 
                                            className="px-4 py-3"
                                            style={{ textAlign: align }}
                                        >
                                            {isFirst ? (
                                                <Skeleton className={cn(
                                                    "h-4 w-20 rounded-md bg-muted/50",
                                                    align === "center" && "mx-auto",
                                                    align === "right" && "ml-auto"
                                                )} />
                                            ) : (
                                                <Skeleton
                                                    className={cn(
                                                        "h-3.5 rounded-full bg-muted/40",
                                                        align === "center" && "mx-auto",
                                                        align === "right" && "ml-auto"
                                                    )}
                                                    style={{
                                                        width: `${60 + Math.abs((rowIndex * 7 + colIndex * 13) % 40)}%`,
                                                        maxWidth: "160px"
                                                    }}
                                                />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
