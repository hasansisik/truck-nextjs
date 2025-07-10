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
import { Edit, Eye, Plus, X, ImageIcon, Search, Filter, DollarSign } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { deleteTow, getAllTows, updateTow } from "@/redux/actions/towActions";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { TowForm } from "@/components/tow-form";
import { TowDetail } from "@/components/tow-detail";
import { format } from "date-fns";
import Image from "next/image";
import DeleteConfirmation from "./delete-confirmation";
import { formatDateTimeTR, formatDateTR } from "@/lib/utils";
import { Label } from "./ui/label";

export function TowTable() {
  const dispatch = useAppDispatch();
  const { tows, loading } = useAppSelector((state) => state.tow);
  const { user } = useAppSelector((state) => state.user);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isPriceUpdateOpen, setIsPriceUpdateOpen] = useState(false);
  const [selectedTow, setSelectedTow] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceValue, setPriceValue] = useState<number | string>("");
  
  // Filter states
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPlate, setSelectedPlate] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");

  useEffect(() => {
    dispatch(getAllTows());
  }, [dispatch]);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!tows) return { drivers: [], companies: [], plates: [], vehicles: [] };

    const drivers = [...new Set(tows.map((tow: any) => tow.driver).filter(Boolean))];
    const companies = [...new Set(tows.map((tow: any) => tow.company).filter(Boolean))];
    const plates = [...new Set(tows.map((tow: any) => tow.licensePlate).filter(Boolean))];
    const vehicles = [...new Set(tows.map((tow: any) => tow.towTruck).filter(Boolean))];

    return { drivers, companies, plates, vehicles };
  }, [tows]);

  // Filtered tows list
  const filteredTows = useMemo(() => {
    if (!tows) return [];

    let filtered = [...tows];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((tow: any) => {
        const searchableFields = [
          tow.towTruck,
          tow.driver,
          tow.licensePlate,
          tow.company,
          tow.distance?.toString(),
          tow.serviceFee?.toString(),
          formatDateTR(new Date(tow.towDate)),
          formatDateTimeTR(new Date(tow.towDate)),
          tow.towDate,
        ];

        return searchableFields.some(field => 
          field && field.toString().toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply dropdown filters
    if (selectedDriver) {
      filtered = filtered.filter((tow: any) => tow.driver === selectedDriver);
    }
    if (selectedCompany) {
      filtered = filtered.filter((tow: any) => tow.company === selectedCompany);
    }
    if (selectedPlate) {
      filtered = filtered.filter((tow: any) => tow.licensePlate === selectedPlate);
    }
    if (selectedVehicle) {
      filtered = filtered.filter((tow: any) => tow.towTruck === selectedVehicle);
    }

    return filtered;
  }, [tows, searchTerm, selectedDriver, selectedCompany, selectedPlate, selectedVehicle]);

  const handleEdit = (tow: any) => {
    setSelectedTow(tow);
    setIsEditOpen(true);
  };

  const handleView = (tow: any) => {
    setSelectedTow(tow);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteTow(id));
    dispatch(getAllTows());
  };

  const onCreateSuccess = () => {
    setIsCreateOpen(false);
    dispatch(getAllTows());
  };

  const onEditSuccess = () => {
    setIsEditOpen(false);
    dispatch(getAllTows());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedDriver("");
    setSelectedCompany("");
    setSelectedPlate("");
    setSelectedVehicle("");
  };

  const handlePriceUpdate = (tow: any) => {
    setSelectedTow(tow);
    setPriceValue(tow.serviceFee || "");
    setIsPriceUpdateOpen(true);
  };

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTow) {
      await dispatch(updateTow({
        id: selectedTow._id,
        serviceFee: Number(priceValue)
      }));
      
      setIsPriceUpdateOpen(false);
      dispatch(getAllTows());
    }
  };

  const hasActiveFilters = searchTerm || selectedDriver || selectedCompany || selectedPlate || selectedVehicle;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Çekici Kayıtları</h2>
        <Button onClick={() => setIsCreateOpen(true)} id="newTowButton">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kayıt
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Araç, şoför, plaka, firma, tarih, mesafe veya hizmet bedeli ara..."
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
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtrele:</span>
          </div>
          
          {/* Responsive Filter Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Şoför seç" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.drivers.map((driver) => (
                  <SelectItem key={driver} value={driver}>
                    {driver}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Firma seç" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPlate} onValueChange={setSelectedPlate}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Plaka seç" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.plates.map((plate) => (
                  <SelectItem key={plate} value={plate}>
                    {plate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Araç seç" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.vehicles.map((vehicle) => (
                  <SelectItem key={vehicle} value={vehicle}>
                    {vehicle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Filtreleri Temizle
              </Button>
            </div>
          )}
        </div>

        {/* Results Info */}
        {(searchTerm || hasActiveFilters) && (
          <p className="text-sm text-muted-foreground">
            {filteredTows.length} kayıt bulundu
            {searchTerm && ` "${searchTerm}" araması için`}
            {hasActiveFilters && " aktif filtreler ile"}
          </p>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fotoğraf</TableHead>
              <TableHead>Çeken Araç</TableHead>
              <TableHead>Şoför</TableHead>
              <TableHead>Plaka</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Mesafe (km)</TableHead>
              <TableHead>Hizmet Bedeli (₺)</TableHead>
              <TableHead>Firma</TableHead>
              {(user?.role === 'admin' || user?.role === 'superadmin') && (
                <TableHead>Oluşturan</TableHead>
              )}
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={user?.role === 'admin' || user?.role === 'superadmin' ? 10 : 9} className="text-center py-4">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : filteredTows?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={user?.role === 'admin' || user?.role === 'superadmin' ? 10 : 9} className="text-center py-4">
                  {hasActiveFilters ? "Arama ve filtre kriterlerinize uygun kayıt bulunamadı" : "Kayıt bulunamadı"}
                </TableCell>
              </TableRow>
            ) : (
              filteredTows?.map((tow: any) => (
                <TableRow key={tow._id}>
                  <TableCell>
                    {tow.images && tow.images.length > 0 ? (
                      <div className="relative w-12 h-12 rounded-md overflow-hidden">
                        <Image
                          src={tow.images[0]}
                          alt="Çekici fotoğrafı"
                          fill
                          className="object-cover"
                        />
                        {tow.images.length > 1 && (
                          <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl-md">
                            +{tow.images.length - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-muted flex items-center justify-center rounded-md">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{tow.towTruck}</TableCell>
                  <TableCell>{tow.driver}</TableCell>
                  <TableCell>{tow.licensePlate}</TableCell>
                  <TableCell>
                    {formatDateTimeTR(new Date(tow.towDate))}
                  </TableCell>
                  <TableCell>{tow.distance}</TableCell>
                  <TableCell>{tow.serviceFee ? `${tow.serviceFee.toFixed(2)} ₺` : '-'}</TableCell>
                  <TableCell>{tow.company}</TableCell>
                  {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <TableCell>{tow.userId?.name || 'Bilinmiyor'}</TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(tow)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(tow)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePriceUpdate(tow)}
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      {/* Only superadmin can delete */}
                      {user?.role === 'superadmin' && (
                        <DeleteConfirmation
                          onDelete={() => handleDelete(tow._id)}
                          title="Çekme Kaydını Sil"
                          description="Bu çekme kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Form */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Yeni Çekme Kaydı</DialogTitle>
          </DialogHeader>
          <div className="py-4 overflow-y-auto">
            <TowForm onSuccess={onCreateSuccess} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Form */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Çekme Kaydı Düzenle</DialogTitle>
          </DialogHeader>
          <div className="py-4 overflow-y-auto">
            {selectedTow && (
              <TowForm tow={selectedTow} onSuccess={onEditSuccess} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Çekme Kaydı Detayları</DialogTitle>
          </DialogHeader>
          <div className="py-4 overflow-y-auto">
            {selectedTow && <TowDetail tow={selectedTow} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Price Update Dialog */}
      <Dialog open={isPriceUpdateOpen} onOpenChange={setIsPriceUpdateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hizmet Bedeli Güncelle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePriceSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="serviceFee">Hizmet Bedeli (₺)</Label>
              <Input
                id="serviceFee"
                type="number"
                step="0.01"
                min="0"
                value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
                placeholder="Hizmet bedeli girin"
                required
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsPriceUpdateOpen(false)}
              >
                İptal
              </Button>
              <Button type="submit">Güncelle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 