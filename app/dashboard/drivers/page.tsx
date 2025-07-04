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
import { Plus, Edit, Trash2, X, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data
const drivers = [
  { id: 1, name: "Ahmet Yılmaz", phone: "0532 123 4567", license: "B", experience: 5, avatar: "" },
  { id: 2, name: "Mehmet Demir", phone: "0533 234 5678", license: "E", experience: 8, avatar: "" },
  { id: 3, name: "Ali Kaya", phone: "0535 345 6789", license: "E", experience: 3, avatar: "" },
];

export default function DriversPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  const handleEdit = (driver: any) => {
    setSelectedDriver(driver);
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bu şoförü silmek istediğinize emin misiniz?")) {
      console.log("Şoför silindi:", id);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Şoför Yönetimi</h1>
          <p className="text-gray-500">
            Çekici şoförlerinizi bu sayfadan yönetebilirsiniz.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Şoför Ekle
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Şoför</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Ehliyet Sınıfı</TableHead>
              <TableHead>Deneyim (Yıl)</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Kayıt bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={driver.avatar} />
                        <AvatarFallback>{driver.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{driver.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{driver.phone}</TableCell>
                  <TableCell>{driver.license}</TableCell>
                  <TableCell>{driver.experience}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(driver)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(driver.id)}
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

      {/* Add Driver Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Yeni Şoför Ekle</SheetTitle>
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
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input id="name" placeholder="Ahmet Yılmaz" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" placeholder="0532 123 4567" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="license">Ehliyet Sınıfı</Label>
                  <Input id="license" placeholder="E" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="experience">Deneyim (Yıl)</Label>
                  <Input id="experience" type="number" placeholder="5" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="avatar">Profil Fotoğrafı (URL)</Label>
                  <Input id="avatar" placeholder="https://example.com/avatar.jpg" className="mt-1 h-10" />
                </div>
              </div>
              <Button type="submit" className="w-full h-10">Kaydet</Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Driver Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Şoför Düzenle</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Kapat</span>
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          <div className="px-6 py-6 overflow-y-auto">
            {selectedDriver && (
              <form className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Ad Soyad</Label>
                    <Input 
                      id="edit-name" 
                      defaultValue={selectedDriver.name} 
                      className="mt-1 h-10" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone">Telefon</Label>
                    <Input 
                      id="edit-phone" 
                      defaultValue={selectedDriver.phone} 
                      className="mt-1 h-10" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-license">Ehliyet Sınıfı</Label>
                    <Input 
                      id="edit-license" 
                      defaultValue={selectedDriver.license} 
                      className="mt-1 h-10" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-experience">Deneyim (Yıl)</Label>
                    <Input 
                      id="edit-experience" 
                      type="number" 
                      defaultValue={selectedDriver.experience} 
                      className="mt-1 h-10" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-avatar">Profil Fotoğrafı (URL)</Label>
                    <Input 
                      id="edit-avatar" 
                      defaultValue={selectedDriver.avatar} 
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