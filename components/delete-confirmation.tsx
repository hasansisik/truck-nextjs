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
import { Trash2 } from "lucide-react";

interface DeleteConfirmationProps {
  title: string;
  description: string;
  onDelete: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "outline" | "destructive" | "ghost" | "link" | "default" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const DeleteConfirmation = ({
  title,
  description,
  onDelete,
  isLoading = false,
  disabled = false,
  variant = "destructive",
  size = "default",
}: DeleteConfirmationProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} disabled={isLoading || disabled}>
          <Trash2 className="h-4 w-4 mr-1" /> 
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} disabled={isLoading}>
            {isLoading ? "Siliniyor..." : "Sil"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmation; 