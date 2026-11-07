"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface IDataTablePaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
    onPageChange: (page: number) => void;
    className?: string;
    disabled?: boolean;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | "...")[] = [];
    const DELTA = 1; // páginas a cada lado del actual

    const left = Math.max(2, current - DELTA);
    const right = Math.min(total - 1, current + DELTA);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push("...");
    pages.push(total);

    return pages;
}

export function DataTablePagination({
    currentPage,
    totalPages,
    totalItems,
    perPage,
    onPageChange,
    className,
    disabled = false,
}: IDataTablePaginationProps): React.ReactElement {
    const startItem = Math.min((currentPage - 1) * perPage + 1, totalItems);
    const endItem = Math.min(currentPage * perPage, totalItems);
    const pages = getPageNumbers(currentPage, totalPages);

    const btnBase =
        "h-8 min-w-8 px-2 flex items-center justify-center rounded-lg text-[12.5px] font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed";

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-3", className)}>

            {}
            <p className="text-[12px] text-muted-foreground/60 font-medium shrink-0">
                Mostrando{" "}
                <span className="font-bold text-foreground">{startItem}</span>
                {" – "}
                <span className="font-bold text-foreground">{endItem}</span>
                {" de "}
                <span className="font-bold text-foreground">{totalItems}</span>
                {" registros"}
            </p>

            {}
            {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    {}
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={disabled || currentPage === 1}
                        aria-label="Página anterior"
                        className={cn(btnBase, "text-muted-foreground hover:bg-muted hover:text-foreground")}
                    >
                        <ChevronLeft className="size-4" strokeWidth={2.5} />
                    </button>

                    {}
                    {pages.map((page, index) =>
                        page === "..." ? (
                            <span
                                key={`ellipsis-${index}`}
                                className="h-8 w-6 flex items-center justify-center text-[12px] text-muted-foreground/50 font-bold"
                            >
                                ···
                            </span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                disabled={disabled}
                                aria-label={`Ir a página ${page}`}
                                aria-current={page === currentPage ? "page" : undefined}
                                className={cn(
                                    btnBase,
                                    page === currentPage
                                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {page}
                            </button>
                        )
                    )}

                    {}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={disabled || currentPage === totalPages}
                        aria-label="Página siguiente"
                        className={cn(btnBase, "text-muted-foreground hover:bg-muted hover:text-foreground")}
                    >
                        <ChevronRight className="size-4" strokeWidth={2.5} />
                    </button>
                </div>
            )}
        </div>
    );
}
