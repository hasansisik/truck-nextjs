"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getAllDrivers, createDriver, updateDriver, deleteDriver } from "@/redux/actions/driverActions";
import { Driver } from "@/redux/reducers/driverReducer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Pencil } from "lucide-react";
import DeleteConfirmation from "@/components/delete-confirmation";

export default function DriversPage() {
  const dispatch = useAppDispatch();
  const { drivers, loading } = useAppSelector((state) => state.driver);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    license: "",
    experience: "",
    status: "active",
  });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getAllDrivers());
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createDriver({
      ...formData,
      experience: parseInt(formData.experience),
    })).then(() => {
      setIsAddOpen(false);
      resetForm();
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      dispatch(updateDriver({
        id: editId,
        ...formData,
        experience: parseInt(formData.experience),
      })).then(() => {
        setIsEditOpen(false);
        resetForm();
      });
    }
  };

  const handleEdit = (driver: Driver) => {
    setFormData({
      name: driver.name,
      phone: driver.phone,
      license: driver.license,
      experience: driver.experience.toString(),
      status: driver.status || "active",
    });
    setEditId(driver._id);
    setIsEditOpen(true);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteDriver(id));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      license: "",
      experience: "",
      status: "active",
    });
    setEditId(null);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Şoförler</h1>
        <Button onClick={() => setIsAddOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Yeni Şoför Ekle
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Yükleniyor...</div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-10">Henüz şoför bulunmuyor.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((driver) => (
            <div
              key={driver._id}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <div className="p-4">
                <h3 className="font-bold text-lg">{driver.name}</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-medium">Telefon:</span> {driver.phone}</p>
                  <p><span className="font-medium">Ehliyet:</span> {driver.license}</p>
                  <p><span className="font-medium">Deneyim:</span> {driver.experience} yıl</p>
                  <p>
                    <span className="font-medium">Durum:</span>{" "}
                    <span className={driver.status === "active" ? "text-green-600" : "text-red-600"}>
                      {driver.status === "active" ? "Aktif" : "Pasif"}
                    </span>
                  </p>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(driver)}>
                    <Pencil className="h-4 w-4 mr-1" /> Düzenle
                  </Button>
                  <DeleteConfirmation
                    title="Şoförü Sil"
                    description={`${driver.name} adlı şoförü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
                    onDelete={() => handleDelete(driver._id)}
                    isLoading={loading}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Driver Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Şoför Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">Ehliyet Sınıfı</Label>
              <Input
                id="license"
                name="license"
                value={formData.license}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Deneyim (Yıl)</Label>
              <Input
                id="experience"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleInputChange}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Driver Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Şoför Düzenle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Ad Soyad</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefon</Label>
              <Input
                id="edit-phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-license">Ehliyet Sınıfı</Label>
              <Input
                id="edit-license"
                name="license"
                value={formData.license}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-experience">Deneyim (Yıl)</Label>
              <Input
                id="edit-experience"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleInputChange}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 