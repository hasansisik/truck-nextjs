"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Plus, X, ImageIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { deleteTow, getAllTows } from "@/redux/actions/towActions";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetClose,
  SheetFooter
} from "@/components/ui/sheet";
import { TowForm } from "@/components/tow-form";
import { TowDetail } from "@/components/tow-detail";
import { format } from "date-fns";
import Image from "next/image";
import DeleteConfirmation from "./delete-confirmation";

export function TowTable() {
  const dispatch = useAppDispatch();
  const { tows, loading } = useAppSelector((state) => state.tow);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTow, setSelectedTow] = useState<any>(null);

  useEffect(() => {
    dispatch(getAllTows());
  }, [dispatch]);

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

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Çekici Kayıtları</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kayıt
        </Button>
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
              <TableHead>Firma</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : tows?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Kayıt bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              tows?.map((tow: any) => (
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
                    {format(new Date(tow.towDate), "dd.MM.yyyy")}
                  </TableCell>
                  <TableCell>{tow.distance}</TableCell>
                  <TableCell>{tow.company}</TableCell>
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
                      <DeleteConfirmation
                        onDelete={() => handleDelete(tow._id)}
                        title="Çekme Kaydını Sil"
                        description="Bu çekme kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Form */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent hideCloseButton={true}>
          <SheetHeader>
            <SheetTitle className="flex justify-between items-center">
              <span>Yeni Çekme Kaydı</span>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </SheetTitle>
          </SheetHeader>
          <div className="py-4 overflow-y-auto">
            <TowForm onSuccess={onCreateSuccess} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Form */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent hideCloseButton={true}>
          <SheetHeader>
            <SheetTitle className="flex justify-between items-center">
              <span>Çekme Kaydı Düzenle</span>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </SheetTitle>
          </SheetHeader>
          <div className="py-4 overflow-y-auto">
            {selectedTow && (
              <TowForm tow={selectedTow} onSuccess={onEditSuccess} />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* View Details */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent hideCloseButton={true}>
          <SheetHeader>
            <SheetTitle className="flex justify-between items-center">
              <span>Çekme Kaydı Detayları</span>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </SheetTitle>
          </SheetHeader>
          <div className="py-4 overflow-y-auto">
            {selectedTow && <TowDetail tow={selectedTow} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 