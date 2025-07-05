"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";

interface ConfirmationDialogProps {
  title: string;
  description: string;
  triggerText: string;
  triggerVariant?: "outline" | "destructive" | "ghost" | "link" | "default" | "secondary";
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function ConfirmationDialog({
  title,
  description,
  triggerText,
  triggerVariant = "destructive",
  confirmText = "Evet",
  cancelText = "Hayır",
  onConfirm,
  isLoading = false,
  isDisabled = false,
}: ConfirmationDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant={triggerVariant} 
          disabled={isDisabled || isLoading}
        >
          {isLoading ? "İşleniyor..." : triggerText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmationDialog; 