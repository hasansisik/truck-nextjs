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
import { Plus, Search, Calendar, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/expense-form";
import { formatDateTimeTR } from "@/lib/utils";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

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
  // Set default date range to current month (1st to today)
  const getCurrentMonthRange = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      from: firstDayOfMonth,
      to: today
    };
  };

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>(getCurrentMonthRange());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    dispatch(getAllExpenses());
    dispatch(getAllTows());
  }, [dispatch]);

  // Filter data by date range
  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const from = dateRange.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate()) : null;
      const to = dateRange.to ? new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate(), 23, 59, 59) : null;
      
      if (from && to) {
        return expenseDate >= from && expenseDate <= to;
      } else if (from) {
        return expenseDate >= from;
      } else if (to) {
        return expenseDate <= to;
      }
      return true;
    });
  }, [expenses, dateRange]);

  const filteredTows = useMemo(() => {
    if (!tows) return [];
    
    return tows.filter((tow) => {
      const towDate = new Date(tow.towDate);
      const from = dateRange.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate()) : null;
      const to = dateRange.to ? new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate(), 23, 59, 59) : null;
      
      if (from && to) {
        return towDate >= from && towDate <= to;
      } else if (from) {
        return towDate >= from;
      } else if (to) {
        return towDate <= to;
      }
      return true;
    });
  }, [tows, dateRange]);

  // Calculate totals with filtered data
  const totalExpenses = useMemo(() => {
    return filteredExpenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
  }, [filteredExpenses]);

  const totalIncome = useMemo(() => {
    return filteredTows?.reduce((sum, tow) => sum + (tow.serviceFee || 0), 0) || 0;
  }, [filteredTows]);

  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0;

  // Transform data for DataTable with filtered data
  const allTableData = useMemo(() => {
    return transformToTableData(filteredExpenses || [], filteredTows || []);
  }, [filteredExpenses, filteredTows]);

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

  const clearDateRange = () => {
    setDateRange(getCurrentMonthRange());
  };

  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "dd MMM yyyy", { locale: tr })} - ${format(dateRange.to, "dd MMM yyyy", { locale: tr })}`;
    } else if (dateRange.from) {
      return `${format(dateRange.from, "dd MMM yyyy", { locale: tr })} - ...`;
    } else if (dateRange.to) {
      return `... - ${format(dateRange.to, "dd MMM yyyy", { locale: tr })}`;
    }
    return "Tarih seçin";
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Finansal Raporlar</h1>
          <p className="text-gray-500">
            Gelir ve gider raporlarınızı bu sayfadan görüntüleyebilirsiniz.
          </p>
        </div>
        
        {/* Date Range Picker */}
        <div className="flex items-center gap-2">
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
                             <Button
                 variant="outline"
                 className="w-[280px] justify-start text-left font-normal"
               >
                <Calendar className="mr-2 h-4 w-4" />
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange({
                    from: range?.from,
                    to: range?.to
                  });
                }}
                numberOfMonths={2}
                locale={tr}
              />
              <div className="p-3 border-t">
                                 <Button
                   variant="outline"
                   className="w-full"
                   onClick={clearDateRange}
                 >
                   Bu Aya Sıfırla
                 </Button>
              </div>
            </PopoverContent>
          </Popover>
          
                     <Button
             variant="ghost"
             size="icon"
             onClick={clearDateRange}
             className="h-10 w-10"
             title="Bu aya sıfırla"
           >
             <X className="h-4 w-4" />
           </Button>
        </div>
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
              {filteredTows?.length || 0} çekici hizmeti
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
              {filteredExpenses?.length || 0} gider kaydı
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
                  {filteredExpenses?.slice(0, 5).map((expense: any) => (
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
                  {(!filteredExpenses || filteredExpenses.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                                 Seçilen tarih aralığında gider kaydı bulunamadı
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
                  {filteredTows?.slice(0, 5).map((tow: any) => (
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
                  {(!filteredTows || filteredTows.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                                                 Seçilen tarih aralığında gelir kaydı bulunamadı
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