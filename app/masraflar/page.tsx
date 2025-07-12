"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Eye, Plus, X, Search, Filter, Download } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { deleteExpense, getAllExpenses } from "@/redux/actions/expenseActions";
import * as XLSX from 'xlsx';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import DeleteConfirmation from "@/components/delete-confirmation";
import { formatDateTimeTR, formatDateTR } from "@/lib/utils";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseDetail } from "@/components/expense-detail";
import { toast } from "sonner";


export default function ExpensesPage() {
  const dispatch = useAppDispatch();
  const { expenses, loading } = useAppSelector((state) => state.expense);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter states
  const [selectedName, setSelectedName] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("");

  useEffect(() => {
    dispatch(getAllExpenses());
  }, [dispatch]);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!expenses) return { names: [] };

    const names = [...new Set(expenses.map((expense: any) => expense.name).filter(Boolean))];

    return { names };
  }, [expenses]);

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];

    let filtered = [...expenses];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((expense: any) => {
        const searchableFields = [
          expense.name,
          expense.description,
          expense.amount?.toString(),
          formatDateTR(new Date(expense.date)),
          formatDateTimeTR(new Date(expense.date)),
          expense.date,
        ];

        return searchableFields.some(field => 
          field && field.toString().toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply dropdown filters
    if (selectedName) {
      filtered = filtered.filter((expense: any) => expense.name === selectedName);
    }

    // Apply date range filter
    if (selectedDateRange) {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter((expense: any) => {
        const expenseDate = new Date(expense.date);
        
        switch (selectedDateRange) {
          case "today":
            return expenseDate >= startOfToday;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return expenseDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return expenseDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [expenses, searchTerm, selectedName, selectedDateRange]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0);
  }, [filteredExpenses]);

  const handleEdit = (expense: any) => {
    setSelectedExpense(expense);
    setIsEditOpen(true);
  };

  const handleView = (expense: any) => {
    setSelectedExpense(expense);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteExpense(id));
    dispatch(getAllExpenses());
  };

  const onCreateSuccess = () => {
    setIsCreateOpen(false);
    dispatch(getAllExpenses());
  };

  const onEditSuccess = () => {
    setIsEditOpen(false);
    dispatch(getAllExpenses());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedName("");
    setSelectedDateRange("");
  };

  const hasActiveFilters = searchTerm || selectedName || selectedDateRange;

  // Export to Excel function
  const handleExportToExcel = () => {
    if (!filteredExpenses || filteredExpenses.length === 0) {
      toast.error("Dışa aktarılacak veri bulunamadı");
      return;
    }

    try {
      // Prepare data for Excel export
      const exportData = filteredExpenses.map((expense: any, index: number) => ({
        'Sıra No': index + 1,
        'Masraf Adı': expense.name || '',
        'Açıklama': expense.description || '',
        'Tarih': expense.date ? new Date(expense.date).toLocaleDateString('tr-TR') : '',
        'Saat': expense.date ? new Date(expense.date).toLocaleTimeString('tr-TR') : '',
        'Tutar (₺)': expense.amount || 0,
        'Oluşturan': expense.userId?.name || 'Bilinmiyor',
        'Kayıt Tarihi': expense.createdAt ? new Date(expense.createdAt).toLocaleDateString('tr-TR') : ''
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Masraf Kayıtları');
      
      // Auto-size columns
      const colWidths = [
        { wch: 8 },  // Sıra No
        { wch: 25 }, // Masraf Adı
        { wch: 40 }, // Açıklama
        { wch: 15 }, // Tarih
        { wch: 15 }, // Saat
        { wch: 15 }, // Tutar
        { wch: 20 }, // Oluşturan
        { wch: 15 }  // Kayıt Tarihi
      ];
      ws['!cols'] = colWidths;
      
      // Generate filename with current date
      const currentDate = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
      const filename = `masraf-kayitlari-${currentDate}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, filename);
      
      toast.success("Excel dosyası başarıyla indirildi");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Excel dosyası oluşturulurken bir hata oluştu");
    }
  };

  return (
    <div className="container mx-auto ">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Masraf Yönetimi</h1>
          <p className="text-gray-500">
            Masraf kayıtlarınızı bu sayfadan yönetebilirsiniz.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportToExcel}
            disabled={!filteredExpenses || filteredExpenses.length === 0 || loading}
          >
            <Download className="mr-2 h-4 w-4" />
            Excel'e Aktar
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Masraf
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Masraf adı, açıklama, tutar veya tarih ara..."
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
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtrele:</span>
          </div>
          
          <Select value={selectedName} onValueChange={setSelectedName}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Masraf adı seç" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.names.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tarih aralığı" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Bugün</SelectItem>
              <SelectItem value="week">Son 7 gün</SelectItem>
              <SelectItem value="month">Son 30 gün</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="ml-2"
            >
              <X className="h-4 w-4 mr-1" />
              Filtreleri Temizle
            </Button>
          )}
        </div>

        {/* Summary */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Toplam {filteredExpenses.length} masraf kaydı
            </span>
            <span className="text-lg font-semibold">
              Toplam Tutar: {totalAmount.toFixed(2)} ₺
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Masraf Adı</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Tutar (₺)</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : filteredExpenses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  {hasActiveFilters ? "Arama ve filtre kriterlerinize uygun kayıt bulunamadı" : "Masraf kaydı bulunamadı"}
                </TableCell>
              </TableRow>
            ) :
              filteredExpenses?.map((expense: any) => (
                <TableRow key={expense._id}>
                  <TableCell className="font-medium">{expense.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                  <TableCell>
                    {formatDateTimeTR(new Date(expense.date))}
                  </TableCell>
                  <TableCell className="font-medium">
                    {expense.amount.toFixed(2)} ₺
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(expense)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(expense)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DeleteConfirmation
                        onDelete={() => handleDelete(expense._id)}
                        title="Masraf Kaydını Sil"
                        description="Bu masraf kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            }

          </TableBody>
        </Table>
      </div>

      {/* Create Form */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl w-full mx-4 sm:mx-auto">
          <DialogHeader className="space-y-1 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Yeni Masraf Kaydı</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] py-2">
            <ExpenseForm onSuccess={onCreateSuccess} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Form */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl w-full mx-4 sm:mx-auto">
          <DialogHeader className="space-y-1 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Masraf Kaydı Düzenle</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] py-2">
            {selectedExpense && (
              <ExpenseForm expense={selectedExpense} onSuccess={onEditSuccess} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl w-full mx-4 sm:mx-auto">
          <DialogHeader className="space-y-1 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Masraf Kaydı Detayları</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] py-2">
            {selectedExpense && <ExpenseDetail expense={selectedExpense} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 