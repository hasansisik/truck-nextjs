"use client";

import { useEffect, useState } from "react";
import { TowTable } from "@/components/tow-table";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getAllTows } from "@/redux/actions/towActions";
import { createVehicle } from "@/redux/actions/vehicleActions";
import { createDriver } from "@/redux/actions/driverActions";
import { createCompany } from "@/redux/actions/companyActions";
import { getMyProfile } from "@/redux/actions/userActions";
import { getAllVehicles } from "@/redux/actions/vehicleActions";
import { getAllDrivers } from "@/redux/actions/driverActions";
import { getAllCompanies } from "@/redux/actions/companyActions";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetClose,
  SheetFooter 
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Pencil, X, Truck, Users, Building } from "lucide-react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { safeLocalStorage } from "@/lib/utils";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isDriverOpen, setIsDriverOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  
  // Form states
  const [vehicleForm, setVehicleForm] = useState({
    name: "",
    model: "",
    year: "",
    licensePlate: "",
    status: "active",
  });
  
  const [driverForm, setDriverForm] = useState({
    name: "",
    phone: "",
    license: "",
    experience: "",
    status: "active",
  });
  
  const [companyForm, setCompanyForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    status: "active",
  });

  // Redux states
  const { vehicles, loading: vehicleLoading, error: vehicleError } = useAppSelector(state => state.vehicle || {});
  const { drivers, loading: driverLoading, error: driverError } = useAppSelector(state => state.driver || {});
  const { companies, loading: companyLoading, error: companyError } = useAppSelector(state => state.company || {});

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated && !safeLocalStorage.getItem("accessToken")) {
      router.push("/login");
      return;
    }

    dispatch(getMyProfile());
    dispatch(getAllVehicles());
    dispatch(getAllDrivers());
    dispatch(getAllCompanies());
    dispatch(getAllTows());
  }, [dispatch, isAuthenticated, router]);
  
  const handleVehicleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicleForm({ ...vehicleForm, [name]: value });
  };
  
  const handleDriverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDriverForm({ ...driverForm, [name]: value });
  };
  
  const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyForm({ ...companyForm, [name]: value });
  };
  
  const resetVehicleForm = () => {
    setVehicleForm({
      name: "",
      model: "",
      year: "",
      licensePlate: "",
      status: "active",
    });
    setIsVehicleOpen(false);
  };
  
  const resetDriverForm = () => {
    setDriverForm({
      name: "",
      phone: "",
      license: "",
      experience: "",
      status: "active",
    });
    setIsDriverOpen(false);
  };
  
  const resetCompanyForm = () => {
    setCompanyForm({
      name: "",
      address: "",
      phone: "",
      email: "",
      status: "active",
    });
    setIsCompanyOpen(false);
  };

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch(createVehicle({
      ...vehicleForm,
      year: parseInt(vehicleForm.year) || new Date().getFullYear(),
      plateNumber: vehicleForm.licensePlate
    })).then(() => {
      setIsVehicleOpen(false);
      resetVehicleForm();
      dispatch(getAllTows());
    });
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch(createDriver({
      ...driverForm,
      experience: parseInt(driverForm.experience) || 0,
    })).then(() => {
      setIsDriverOpen(false);
      resetDriverForm();
      dispatch(getAllTows());
    });
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch(createCompany(companyForm)).then(() => {
      setIsCompanyOpen(false);
      resetCompanyForm();
      dispatch(getAllTows());
    });
  };

  // If not authenticated, return null (will redirect in useEffect)
  if (!isAuthenticated && !safeLocalStorage.getItem("accessToken")) {
    return null;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
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
                <Sheet open={isVehicleOpen} onOpenChange={setIsVehicleOpen}>
                  <SheetContent hideCloseButton={true}>
                    <SheetHeader>
                      <SheetTitle className="flex justify-between items-center">
                        <span>Yeni Araç Ekle</span>
                        <SheetClose asChild>
                          <Button variant="ghost" size="icon" onClick={() => resetVehicleForm()}>
                            <X className="h-4 w-4" />
                          </Button>
                        </SheetClose>
                      </SheetTitle>
                    </SheetHeader>
                    <form onSubmit={handleVehicleSubmit} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Araç Adı</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Çekici 1"
                          value={vehicleForm.name}
                          onChange={handleVehicleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model">Model</Label>
                        <Input
                          id="model"
                          name="model"
                          placeholder="Ford F-450"
                          value={vehicleForm.model}
                          onChange={handleVehicleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Yıl</Label>
                        <Input
                          id="year"
                          name="year"
                          placeholder="2023"
                          value={vehicleForm.year}
                          onChange={handleVehicleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="licensePlate">Plaka</Label>
                        <Input
                          id="licensePlate"
                          name="licensePlate"
                          placeholder="34ABC123"
                          value={vehicleForm.licensePlate}
                          onChange={handleVehicleInputChange}
                          required
                        />
                      </div>
                      <SheetFooter>
                        <Button type="submit" disabled={vehicleLoading}>
                          {vehicleLoading ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                      </SheetFooter>
                    </form>
                  </SheetContent>
                </Sheet>
                
                {/* Quick Add Driver Sheet */}
                <Sheet open={isDriverOpen} onOpenChange={setIsDriverOpen}>
                  <SheetContent hideCloseButton={true}>
                    <SheetHeader>
                      <SheetTitle className="flex justify-between items-center">
                        <span>Yeni Şoför Ekle</span>
                        <SheetClose asChild>
                          <Button variant="ghost" size="icon" onClick={() => resetDriverForm()}>
                            <X className="h-4 w-4" />
                          </Button>
                        </SheetClose>
                      </SheetTitle>
                    </SheetHeader>
                    <form onSubmit={handleDriverSubmit} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Ad Soyad</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Ahmet Yılmaz"
                          value={driverForm.name}
                          onChange={handleDriverInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="0555 123 4567"
                          value={driverForm.phone}
                          onChange={handleDriverInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="license">Ehliyet No</Label>
                        <Input
                          id="license"
                          name="license"
                          placeholder="123456789"
                          value={driverForm.license}
                          onChange={handleDriverInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Deneyim (Yıl)</Label>
                        <Input
                          id="experience"
                          name="experience"
                          placeholder="5"
                          value={driverForm.experience}
                          onChange={handleDriverInputChange}
                          required
                        />
                      </div>
                      <SheetFooter>
                        <Button type="submit" disabled={driverLoading}>
                          {driverLoading ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                      </SheetFooter>
                    </form>
                  </SheetContent>
                </Sheet>
                
                {/* Quick Add Company Sheet */}
                <Sheet open={isCompanyOpen} onOpenChange={setIsCompanyOpen}>
                  <SheetContent hideCloseButton={true}>
                    <SheetHeader>
                      <SheetTitle className="flex justify-between items-center">
                        <span>Yeni Firma Ekle</span>
                        <SheetClose asChild>
                          <Button variant="ghost" size="icon" onClick={() => resetCompanyForm()}>
                            <X className="h-4 w-4" />
                          </Button>
                        </SheetClose>
                      </SheetTitle>
                    </SheetHeader>
                    <form onSubmit={handleCompanySubmit} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Firma Adı</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="ABC Çekici Hizmetleri"
                          value={companyForm.name}
                          onChange={handleCompanyInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Adres</Label>
                        <Input
                          id="address"
                          name="address"
                          placeholder="İstanbul, Türkiye"
                          value={companyForm.address}
                          onChange={handleCompanyInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="0212 123 4567"
                          value={companyForm.phone}
                          onChange={handleCompanyInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-posta</Label>
                        <Input
                          id="email"
                          name="email"
                          placeholder="info@abccekici.com"
                          value={companyForm.email}
                          onChange={handleCompanyInputChange}
                          required
                        />
                      </div>
                      <SheetFooter>
                        <Button type="submit" disabled={companyLoading}>
                          {companyLoading ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                      </SheetFooter>
                    </form>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
