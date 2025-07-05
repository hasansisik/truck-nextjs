"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getAllVehicles, createVehicle, updateVehicle, deleteVehicle } from "@/redux/actions/vehicleActions";
import { Vehicle } from "@/redux/reducers/vehicleReducer";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Pencil, X } from "lucide-react";
import DeleteConfirmation from "@/components/delete-confirmation";

export default function VehiclesPage() {
  const dispatch = useAppDispatch();
  const { vehicles, loading } = useAppSelector((state) => state.vehicle);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    year: "",
    licensePlate: "",
    status: "active",
  });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getAllVehicles());
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createVehicle({
      ...formData,
      year: parseInt(formData.year),
    })).then(() => {
      setIsAddOpen(false);
      resetForm();
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      dispatch(updateVehicle({
        id: editId,
        ...formData,
        year: parseInt(formData.year),
      })).then(() => {
        setIsEditOpen(false);
        resetForm();
      });
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setFormData({
      name: vehicle.name,
      model: vehicle.model,
      year: vehicle.year.toString(),
      licensePlate: vehicle.licensePlate,
      status: vehicle.status || "active",
    });
    setEditId(vehicle._id);
    setIsEditOpen(true);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteVehicle(id));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      model: "",
      year: "",
      licensePlate: "",
      status: "active",
    });
    setEditId(null);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Araçlar</h1>
        <Button onClick={() => setIsAddOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Yeni Araç Ekle
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Yükleniyor...</div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-10">Henüz araç bulunmuyor.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <div className="p-4">
                <h3 className="font-bold text-lg">{vehicle.name}</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-medium">Model:</span> {vehicle.model}</p>
                  <p><span className="font-medium">Yıl:</span> {vehicle.year}</p>
                  <p><span className="font-medium">Plaka:</span> {vehicle.licensePlate}</p>
                  <p>
                    <span className="font-medium">Durum:</span>{" "}
                    <span className={vehicle.status === "active" ? "text-green-600" : "text-red-600"}>
                      {vehicle.status === "active" ? "Aktif" : "Pasif"}
                    </span>
                  </p>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(vehicle)}>
                    <Pencil className="h-4 w-4 mr-1" /> Düzenle
                  </Button>
                  <DeleteConfirmation
                    title="Aracı Sil"
                    description={`${vehicle.name} aracını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
                    onDelete={() => handleDelete(vehicle._id)}
                    isLoading={loading}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent hideCloseButton={true}>
          <SheetHeader>
            <SheetTitle className="flex justify-between items-center">
              <span>Yeni Araç Ekle</span>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" onClick={() => resetForm()}>
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Araç Adı</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Yıl</Label>
              <Input
                id="year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licensePlate">Plaka</Label>
              <Input
                id="licensePlate"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                required
              />
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline" onClick={() => resetForm()}>
                  İptal
                </Button>
              </SheetClose>
              <Button type="submit" disabled={loading}>
                {loading ? "Ekleniyor..." : "Ekle"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Edit Vehicle Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent hideCloseButton={true}>
          <SheetHeader>
            <SheetTitle className="flex justify-between items-center">
              <span>Araç Düzenle</span>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" onClick={() => resetForm()}>
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Araç Adı</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-model">Model</Label>
              <Input
                id="edit-model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-year">Yıl</Label>
              <Input
                id="edit-year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-licensePlate">Plaka</Label>
              <Input
                id="edit-licensePlate"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                required
              />
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline" onClick={() => resetForm()}>
                  İptal
                </Button>
              </SheetClose>
              <Button type="submit" disabled={loading}>
                {loading ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
} 