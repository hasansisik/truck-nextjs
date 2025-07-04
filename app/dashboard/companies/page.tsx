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
import { Plus, Edit, Trash2, X, Building, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Mock data
const companies = [
  { 
    id: 1, 
    name: "ABC Lojistik", 
    address: "İstanbul, Kadıköy", 
    phone: "0212 123 4567", 
    email: "info@abclojistik.com",
    status: "active" 
  },
  { 
    id: 2, 
    name: "XYZ Nakliyat", 
    address: "İstanbul, Beşiktaş", 
    phone: "0212 234 5678", 
    email: "info@xyznakliyat.com",
    status: "active" 
  },
  { 
    id: 3, 
    name: "DEF Taşımacılık", 
    address: "Ankara, Çankaya", 
    phone: "0312 345 6789", 
    email: "info@deftasima.com",
    status: "inactive" 
  },
];

export default function CompaniesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const handleEdit = (company: any) => {
    setSelectedCompany(company);
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bu firmayı silmek istediğinize emin misiniz?")) {
      console.log("Firma silindi:", id);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Firma Yönetimi</h1>
          <p className="text-gray-500">
            Çalıştığınız firmaları bu sayfadan yönetebilirsiniz.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Firma Ekle
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Firma Adı</TableHead>
              <TableHead>Adres</TableHead>
              <TableHead>İletişim</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Kayıt bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">{company.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{company.address}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>{company.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3" />
                        <span>{company.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                      {company.status === 'active' ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(company)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(company.id)}
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

      {/* Add Company Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Yeni Firma Ekle</SheetTitle>
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
                  <Label htmlFor="name">Firma Adı</Label>
                  <Input id="name" placeholder="ABC Lojistik" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="address">Adres</Label>
                  <Input id="address" placeholder="İstanbul, Kadıköy" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" placeholder="0212 123 4567" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" type="email" placeholder="info@firma.com" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="status">Durum</Label>
                  <select 
                    id="status" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full h-10">Kaydet</Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Company Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Firma Düzenle</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Kapat</span>
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          <div className="px-6 py-6 overflow-y-auto">
            {selectedCompany && (
              <form className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Firma Adı</Label>
                    <Input 
                      id="edit-name" 
                      defaultValue={selectedCompany.name} 
                      className="mt-1 h-10" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-address">Adres</Label>
                    <Input 
                      id="edit-address" 
                      defaultValue={selectedCompany.address} 
                      className="mt-1 h-10" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone">Telefon</Label>
                    <Input 
                      id="edit-phone" 
                      defaultValue={selectedCompany.phone} 
                      className="mt-1 h-10" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">E-posta</Label>
                    <Input 
                      id="edit-email" 
                      type="email" 
                      defaultValue={selectedCompany.email} 
                      className="mt-1 h-10" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Durum</Label>
                    <select 
                      id="edit-status" 
                      defaultValue={selectedCompany.status}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Pasif</option>
                    </select>
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