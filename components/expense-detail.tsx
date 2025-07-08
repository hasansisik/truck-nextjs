"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeTR } from "@/lib/utils";

interface ExpenseDetailProps {
  expense: any;
}

export function ExpenseDetail({ expense }: ExpenseDetailProps) {
  if (!expense) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-muted/40 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Masraf Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Masraf Adı</p>
              <p className="text-sm font-medium mt-1">{expense.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Masraf Tutarı</p>
              <Badge variant="outline" className="mt-1 text-sm font-medium">
                {expense.amount.toFixed(2)} ₺
              </Badge>
            </div>
          </div>
        </div>

        <div className="bg-muted/40 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Tarih Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Masraf Tarihi</p>
              <p className="text-sm font-medium mt-1">
                {formatDateTimeTR(new Date(expense.date))}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Kayıt Tarihi</p>
              <p className="text-sm font-medium mt-1">
                {formatDateTimeTR(new Date(expense.createdAt))}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/40 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Masraf Açıklaması</h3>
        <div className="bg-white p-3 rounded-md border">
          <p className="text-sm leading-relaxed">
            {expense.description}
          </p>
        </div>
      </div>

      {expense.updatedAt && expense.updatedAt !== expense.createdAt && (
        <div className="bg-muted/40 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Güncelleme Bilgileri</h3>
          <div>
            <p className="text-xs font-medium text-gray-500">Son Güncelleme</p>
            <p className="text-sm font-medium mt-1">
              {formatDateTimeTR(new Date(expense.updatedAt))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 