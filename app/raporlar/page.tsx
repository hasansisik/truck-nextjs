"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getAllExpenses } from "@/redux/actions/expenseActions";
import { getAllTows } from "@/redux/actions/towActions";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/expense-form";
import { formatDateTimeTR } from "@/lib/utils";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

// Transform data for the existing DataTable component
const transformToTableData = (expenses: any[], tows: any[]) => {
  const data: Array<{
    id: number;
    header: string;
    type: string;
    status: string;
    target: string;
    limit: string;
    reviewer: string;
  }> = [];
  
  // Add expenses as table items
  expenses.forEach((expense, index) => {
    data.push({
      id: index + 1,
      header: expense.name,
      type: "Gider",
      status: "Tamamlandı",
      target: expense.amount?.toString() || "0",
      limit: formatDateTimeTR(new Date(expense.date)),
      reviewer: expense.description || "Açıklama yok",
    });
  });

  // Add tows as income items
  tows.forEach((tow, index) => {
    data.push({
      id: expenses.length + index + 1,
      header: `${tow.towTruck} - ${tow.licensePlate}`,
      type: "Gelir",
      status: "Tamamlandı",
      target: tow.serviceFee?.toString() || "0",
      limit: formatDateTimeTR(new Date(tow.towDate)),
      reviewer: `${tow.driver} - ${tow.company}`,
    });
  });

  return data;
};

export default function Page() {
  const dispatch = useAppDispatch();
  const { expenses, loading: expensesLoading } = useAppSelector((state) => state.expense);
  const { tows, loading: towsLoading } = useAppSelector((state) => state.tow);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    dispatch(getAllExpenses());
    dispatch(getAllTows());
  }, [dispatch]);

  // Calculate totals
  const totalExpenses = useMemo(() => {
    return expenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
  }, [expenses]);

  const totalIncome = useMemo(() => {
    return tows?.reduce((sum, tow) => sum + (tow.serviceFee || 0), 0) || 0;
  }, [tows]);

  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0;

  // Transform data for DataTable
  const allTableData = useMemo(() => {
    return transformToTableData(expenses || [], tows || []);
  }, [expenses, tows]);

  // Filter data based on active tab and search term
  const filteredTableData = useMemo(() => {
    let filtered = [...allTableData];

    // Filter by tab
    if (activeTab === "income") {
      filtered = filtered.filter(item => item.type === "Gelir");
    } else if (activeTab === "expenses") {
      filtered = filtered.filter(item => item.type === "Gider");
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item => {
        const searchableFields = [
          item.header,
          item.type,
          item.status,
          item.target,
          item.limit,
          item.reviewer,
        ];
        
        return searchableFields.some(field => 
          field && field.toString().toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [allTableData, activeTab, searchTerm]);

  const handleExpenseSuccess = () => {
    setIsExpenseDialogOpen(false);
    dispatch(getAllExpenses());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (expensesLoading || towsLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Finansal Raporlar</h1>
        <p className="text-gray-500">
          Gelir ve gider raporlarınızı bu sayfadan görüntüleyebilirsiniz.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalIncome.toFixed(2)} ₺</div>
            <p className="text-xs text-muted-foreground">
              {tows?.length || 0} çekici hizmeti
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <IconTrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalExpenses.toFixed(2)} ₺</div>
            <p className="text-xs text-muted-foreground">
              {expenses?.length || 0} gider kaydı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Kar</CardTitle>
            {netProfit >= 0 ? (
              <IconTrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <IconTrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netProfit.toFixed(2)} ₺
            </div>
            <p className="text-xs text-muted-foreground">
              Gelir - Gider
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kar Marjı</CardTitle>
            {profitMargin >= 0 ? (
              <IconTrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <IconTrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Kar / Gelir oranı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingDown className="h-5 w-5 text-red-500" />
              Son Giderler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gider</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses?.slice(0, 5).map((expense: any) => (
                    <TableRow key={expense._id}>
                      <TableCell className="font-medium">{expense.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTimeTR(new Date(expense.date))}
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        {expense.amount.toFixed(2)} ₺
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!expenses || expenses.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        Gider kaydı bulunamadı
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Income Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="h-5 w-5 text-green-500" />
              Son Gelirler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hizmet</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead className="text-right">Tutar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tows?.slice(0, 5).map((tow: any) => (
                    <TableRow key={tow._id}>
                      <TableCell className="font-medium">
                        {tow.towTruck} - {tow.licensePlate}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTimeTR(new Date(tow.towDate))}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {tow.serviceFee ? `${tow.serviceFee.toFixed(2)} ₺` : '0.00 ₺'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!tows || tows.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        Gelir kaydı bulunamadı
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Combined Data Table with Filtering */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Son İşlemler (Gider ve Gelir Detayları)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tüm finansal hareketlerinizi tek bir tabloda görüntüleyin
            </p>
          </div>
          <Button onClick={() => setIsExpenseDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Gider Ekle
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Başlık, tür, tutar, tarih veya açıklama ara..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={clearSearch}
                >
                  ×
                </Button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">
                Tümü ({allTableData.length})
              </TabsTrigger>
              <TabsTrigger value="income" className="text-green-600">
                Gelirler ({allTableData.filter(item => item.type === "Gelir").length})
              </TabsTrigger>
              <TabsTrigger value="expenses" className="text-red-600">
                Giderler ({allTableData.filter(item => item.type === "Gider").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <DataTable data={filteredTableData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl w-full mx-4 sm:mx-auto">
          <DialogHeader className="space-y-1 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Yeni Gider Ekle</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] py-2">
            <ExpenseForm onSuccess={handleExpenseSuccess} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}