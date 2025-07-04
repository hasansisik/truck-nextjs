"use client";

import { useEffect, useState } from "react";
import { TowTable } from "@/components/tow-table";
import { useAppDispatch } from "@/redux/hook";
import { getAllTows } from "@/redux/actions/towActions";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetClose 
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Truck, Users, Building, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { uploadImageToCloudinary } from "@/utils/cloudinary";
import { toast } from "sonner";

export default function TowTrucksPage() {
  const dispatch = useAppDispatch();
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isDriverOpen, setIsDriverOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  
  // Image upload states
  const [vehicleImage, setVehicleImage] = useState<string | null>(null);
  const [driverImage, setDriverImage] = useState<string | null>(null);
  const [companyImage, setCompanyImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<{[key: string]: boolean}>({
    vehicle: false,
    driver: false,
    company: false
  });

  useEffect(() => {
    dispatch(getAllTows());
  }, [dispatch]);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'vehicle' | 'driver' | 'company') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    try {
      // Check file size
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Dosya boyutu çok büyük (maksimum 10MB): ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        return;
      }
      
      setIsUploading(prev => ({ ...prev, [type]: true }));
      
      // Upload to Cloudinary
      const imageUrl = await uploadImageToCloudinary(file);
      
      // Update state based on type
      if (type === 'vehicle') setVehicleImage(imageUrl);
      else if (type === 'driver') setDriverImage(imageUrl);
      else if (type === 'company') setCompanyImage(imageUrl);
      
      toast.success('Fotoğraf başarıyla yüklendi');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Fotoğraf yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(prev => ({ ...prev, [type]: false }));
      // Clear input
      e.target.value = '';
    }
  };
  
  const handleFormReset = (type: 'vehicle' | 'driver' | 'company') => {
    if (type === 'vehicle') {
      setVehicleImage(null);
      setIsVehicleOpen(false);
    } else if (type === 'driver') {
      setDriverImage(null);
      setIsDriverOpen(false);
    } else if (type === 'company') {
      setCompanyImage(null);
      setIsCompanyOpen(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Çekici Yönetimi</h1>
        <p className="text-gray-500">
          Araç çekme işlemlerinizi bu sayfadan yönetebilirsiniz.
        </p>
        
        <div className="flex flex-wrap gap-3 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setIsVehicleOpen(true)}
          >
            <Truck className="h-4 w-4" />
            <span>Araç Ekle</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setIsDriverOpen(true)}
          >
            <Users className="h-4 w-4" />
            <span>Şoför Ekle</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setIsCompanyOpen(true)}
          >
            <Building className="h-4 w-4" />
            <span>Firma Ekle</span>
          </Button>
        </div>
      </div>
      
      <TowTable />
      
      {/* Quick Add Vehicle Sheet */}
      <Sheet 
        open={isVehicleOpen} 
        onOpenChange={(open) => {
          if (!open) handleFormReset('vehicle');
          else setIsVehicleOpen(true);
        }}
      >
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Hızlı Araç Ekle</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
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
                  <Label htmlFor="licensePlate">Plaka</Label>
                  <Input id="licensePlate" placeholder="34ABC123" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="vehicleImage">Araç Fotoğrafı</Label>
                  <div className="mt-2">
                    {vehicleImage ? (
                      <div className="relative w-full h-48 rounded-md overflow-hidden mb-2">
                        <Image
                          src={vehicleImage}
                          alt="Araç fotoğrafı"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => setVehicleImage(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-48 flex flex-col items-center justify-center border-dashed"
                        onClick={() => document.getElementById('vehicleImageInput')?.click()}
                        disabled={isUploading.vehicle}
                      >
                        {isUploading.vehicle ? (
                          <>
                            <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                            <span>Yükleniyor...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 mb-2" />
                            <span>Fotoğraf Yükle</span>
                          </>
                        )}
                      </Button>
                    )}
                    <input
                      id="vehicleImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'vehicle')}
                      disabled={isUploading.vehicle}
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-10">Kaydet</Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Quick Add Driver Sheet */}
      <Sheet 
        open={isDriverOpen} 
        onOpenChange={(open) => {
          if (!open) handleFormReset('driver');
          else setIsDriverOpen(true);
        }}
      >
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Hızlı Şoför Ekle</SheetTitle>
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
                  <Label htmlFor="driverName">Ad Soyad</Label>
                  <Input id="driverName" placeholder="Ahmet Yılmaz" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="driverPhone">Telefon</Label>
                  <Input id="driverPhone" placeholder="0532 123 4567" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="driverLicense">Ehliyet Sınıfı</Label>
                  <Input id="driverLicense" placeholder="E" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="driverImage">Şoför Fotoğrafı</Label>
                  <div className="mt-2">
                    {driverImage ? (
                      <div className="relative w-full h-48 rounded-md overflow-hidden mb-2">
                        <Image
                          src={driverImage}
                          alt="Şoför fotoğrafı"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => setDriverImage(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-48 flex flex-col items-center justify-center border-dashed"
                        onClick={() => document.getElementById('driverImageInput')?.click()}
                        disabled={isUploading.driver}
                      >
                        {isUploading.driver ? (
                          <>
                            <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                            <span>Yükleniyor...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 mb-2" />
                            <span>Fotoğraf Yükle</span>
                          </>
                        )}
                      </Button>
                    )}
                    <input
                      id="driverImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'driver')}
                      disabled={isUploading.driver}
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-10">Kaydet</Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Quick Add Company Sheet */}
      <Sheet 
        open={isCompanyOpen} 
        onOpenChange={(open) => {
          if (!open) handleFormReset('company');
          else setIsCompanyOpen(true);
        }}
      >
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Hızlı Firma Ekle</SheetTitle>
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
                  <Label htmlFor="companyName">Firma Adı</Label>
                  <Input id="companyName" placeholder="ABC Lojistik" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Telefon</Label>
                  <Input id="companyPhone" placeholder="0212 123 4567" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="companyAddress">Adres</Label>
                  <Input id="companyAddress" placeholder="İstanbul, Kadıköy" className="mt-1 h-10" />
                </div>
                <div>
                  <Label htmlFor="companyLogo">Firma Logosu</Label>
                  <div className="mt-2">
                    {companyImage ? (
                      <div className="relative w-full h-48 rounded-md overflow-hidden mb-2">
                        <Image
                          src={companyImage}
                          alt="Firma logosu"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => setCompanyImage(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-48 flex flex-col items-center justify-center border-dashed"
                        onClick={() => document.getElementById('companyImageInput')?.click()}
                        disabled={isUploading.company}
                      >
                        {isUploading.company ? (
                          <>
                            <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                            <span>Yükleniyor...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 mb-2" />
                            <span>Logo Yükle</span>
                          </>
                        )}
                      </Button>
                    )}
                    <input
                      id="companyImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'company')}
                      disabled={isUploading.company}
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-10">Kaydet</Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 