"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, Info, Trash2, Scale, FileX2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "destructive" | "warning" | "info" | "question" | "violet" | "orange";
    loading?: boolean;
    
    isLoading?: boolean;
}

const VARIANT_CONFIG = {
    destructive: {
        Icon: Trash2,
        iconBg: "bg-destructive/10",
        iconColor: "text-destructive",
        btnClass: "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-md shadow-destructive/20",
        cancelBtnClass: "",
        label: "Eliminar",
    },
    warning: {
        Icon: FileX2,
        iconBg: "bg-chart-3/15",
        iconColor: "text-chart-3",
        btnClass: "bg-chart-3 text-foreground shadow-md",
        cancelBtnClass: "",
        label: "Confirmar",
    },
    info: {
        Icon: Info,
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
        btnClass: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20",
        cancelBtnClass: "",
        label: "Guardar",
    },
    question: {
        Icon: Scale,
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
        btnClass: "bg-primary text-primary-foreground shadow-md shadow-primary/20",
        cancelBtnClass: "border-primary text-primary hover:bg-primary/5 border-2",
        label: "Guardar",
    },
    violet: {
        Icon: Scale,
        iconBg: "bg-chart-2/15",
        iconColor: "text-chart-2",
        btnClass: "bg-chart-2 text-foreground shadow-md",
        cancelBtnClass: "border-primary text-primary hover:bg-primary/5 text-[13px] font-semibold",
        label: "Entendido",
    },
    orange: {
        Icon: AlertTriangle,
        iconBg: "bg-chart-3/15",
        iconColor: "text-chart-3",
        btnClass: "bg-chart-3 text-foreground shadow-md",
        cancelBtnClass: "border-chart-3 text-chart-3 hover:bg-chart-3/10",
        label: "Entendido",
    },
};

export function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel,
    cancelLabel = "Cancelar",
    variant = "destructive",
    loading = false,
    isLoading = false,
}: IConfirmModalProps): React.ReactElement {
    const { Icon, iconBg, iconColor, btnClass, cancelBtnClass, label } = VARIANT_CONFIG[variant as keyof typeof VARIANT_CONFIG] || VARIANT_CONFIG.destructive;
    const finalLabel = confirmLabel ?? label;
    const isProcessing = loading || isLoading;

    const handleConfirm = async (): Promise<void> => {
        await onConfirm();
    };

    return (
        <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay
                    className={cn(
                        "fixed inset-0 z-50 bg-black/45 backdrop-blur-sm",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                    )}
                />

                <Dialog.Content
                    className={cn(
                        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
                        "w-[calc(100vw-2rem)] max-w-[400px]",
                        "bg-card text-card-foreground border border-border rounded-[2.5rem] shadow-xl",
                        "p-8 flex flex-col items-center text-center gap-6",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out",
                        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                        "duration-300 ease-out"
                    )}
                >
                    {}
                    <div className={cn("size-20 rounded-full flex items-center justify-center relative overflow-hidden", iconBg)}>
                        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white to-transparent" />
                        <Icon className={cn("size-10 relative z-10", iconColor)} strokeWidth={2.5} />
                    </div>

                    {}
                    <div className="space-y-3">
                        <Dialog.Title className="text-[22px] font-bold text-foreground tracking-tight leading-tight">
                            {title}
                        </Dialog.Title>
                        {description && (
                            <Dialog.Description className="text-[15px] text-muted-foreground leading-relaxed font-medium px-2">
                                {description}
                            </Dialog.Description>
                        )}
                    </div>

                    {}
                    <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isProcessing}
                            className={cn(
                                "flex-1 h-14 rounded-2xl text-[14px] font-semibold border-2 transition-all active:scale-[0.96]",
                                cancelBtnClass
                            )}
                        >
                            {cancelLabel}
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={isProcessing}
                            className={cn(
                                "flex-1 h-14 rounded-2xl text-[14px] font-semibold tracking-wide transition-all active:scale-[0.96] shadow-lg shadow-primary/20",
                                btnClass
                            )}
                        >
                            {isProcessing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin size-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                </span>
                            ) : finalLabel}
                        </Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
