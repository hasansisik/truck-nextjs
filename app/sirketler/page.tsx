"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getAllCompanies, createCompany, updateCompany, deleteCompany } from "@/redux/actions/companyActions";
import { Company } from "@/redux/reducers/companyReducer";
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

export default function CompaniesPage() {
  const dispatch = useAppDispatch();
  const { companies, loading } = useAppSelector((state) => state.company);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    status: "active",
  });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getAllCompanies());
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createCompany(formData)).then(() => {
      setIsAddOpen(false);
      resetForm();
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      dispatch(updateCompany({
        id: editId,
        ...formData,
      })).then(() => {
        setIsEditOpen(false);
        resetForm();
      });
    }
  };

  const handleEdit = (company: Company) => {
    setFormData({
      name: company.name,
      address: company.address,
      phone: company.phone,
      email: company.email,
      status: company.status || "active",
    });
    setEditId(company._id);
    setIsEditOpen(true);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteCompany(id));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      status: "active",
    });
    setEditId(null);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Firmalar</h1>
        <Button onClick={() => setIsAddOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Yeni Firma Ekle
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Yükleniyor...</div>
      ) : companies.length === 0 ? (
        <div className="text-center py-10">Henüz firma bulunmuyor.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <div
              key={company._id}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <div className="p-4">
                <h3 className="font-bold text-lg">{company.name}</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-medium">Adres:</span> {company.address}</p>
                  <p><span className="font-medium">Telefon:</span> {company.phone}</p>
                  <p><span className="font-medium">E-posta:</span> {company.email}</p>
                  <p>
                    <span className="font-medium">Durum:</span>{" "}
                    <span className={company.status === "active" ? "text-green-600" : "text-red-600"}>
                      {company.status === "active" ? "Aktif" : "Pasif"}
                    </span>
                  </p>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(company)}>
                    <Pencil className="h-4 w-4 mr-1" /> Düzenle
                  </Button>
                  <DeleteConfirmation
                    title="Firmayı Sil"
                    description={`${company.name} adlı firmayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
                    onDelete={() => handleDelete(company._id)}
                    isLoading={loading}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Company Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Firma Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Firma Adı</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
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
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
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

      {/* Edit Company Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Firma Düzenle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Firma Adı</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Adres</Label>
              <Input
                id="edit-address"
                name="address"
                value={formData.address}
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
              <Label htmlFor="edit-email">E-posta</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
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