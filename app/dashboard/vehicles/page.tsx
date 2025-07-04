"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetClose 
} from "@/components/ui/sheet";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock data
const vehicles = [
  { id: 1, name: "Çekici 1", model: "Ford F-450", year: 2020, licensePlate: "34ABC123" },
  { id: 2, name: "Çekici 2", model: "Mercedes Actros", year: 2021, licensePlate: "34DEF456" },
  { id: 3, name: "Çekici 3", model: "MAN TGX", year: 2019, licensePlate: "34GHI789" },
];

export default function VehiclesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const handleEdit = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bu aracı silmek istediğinize emin misiniz?")) {
      console.log("Araç silindi:", id);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Araç Yönetimi</h1>
          <p className="text-gray-500">
            Çekici araçlarınızı bu sayfadan yönetebilirsiniz.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Araç Ekle
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Araç Adı</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Yıl</TableHead>
              <TableHead>Plaka</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Kayıt bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.name}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{vehicle.licensePlate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(vehicle)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(vehicle.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Vehicle Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Yeni Araç Ekle</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Kapat</span>
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          <div className="px-6 py-6 overflow-y-auto">
            <form className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Araç Adı</Label>
                  <Input id="name" placeholder="Çekici 1" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" placeholder="Ford F-450" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="year">Yıl</Label>
                  <Input id="year" type="number" placeholder="2023" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="licensePlate">Plaka</Label>
                  <Input id="licensePlate" placeholder="34ABC123" className="mt-1 h-10" />
                </div>
              </div>
              <Button type="submit" className="w-full h-10">Kaydet</Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Vehicle Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Araç Düzenle</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Kapat</span>
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          <div className="px-6 py-6 overflow-y-auto">
            {selectedVehicle && (
              <form className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Araç Adı</Label>
                    <Input 
                      id="edit-name" 
                      defaultValue={selectedVehicle.name} 
                      className="mt-1 h-10" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-model">Model</Label>
                    <Input 
                      id="edit-model" 
                      defaultValue={selectedVehicle.model} 
                      className="mt-1 h-10" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-year">Yıl</Label>
                    <Input 
                      id="edit-year" 
                      type="number" 
                      defaultValue={selectedVehicle.year} 
                      className="mt-1 h-10" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-licensePlate">Plaka</Label>
                    <Input 
                      id="edit-licensePlate" 
                      defaultValue={selectedVehicle.licensePlate} 
                      className="mt-1 h-10" 
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-10">Güncelle</Button>
              </form>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 