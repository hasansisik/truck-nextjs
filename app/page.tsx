"use client";

import { useEffect, useState } from "react";
import { TowTable } from "@/components/tow-table";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getAllTows } from "@/redux/actions/towActions";
import { createVehicle } from "@/redux/actions/vehicleActions";
import { createDriver } from "@/redux/actions/driverActions";
import { createCompany } from "@/redux/actions/companyActions";
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
import { Truck, Users, Building } from "lucide-react";
import { toast } from "sonner";
import { safeLocalStorage } from "@/lib/utils";
import axios from "axios";
import { server } from "@/config";
import { logout } from "@/redux/actions/userActions";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);

  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isDriverOpen, setIsDriverOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  
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
    const checkAuth = async () => {
      setIsAuthChecking(true);
      const token = safeLocalStorage.getItem("accessToken");
      
      // If no token, redirect to login
      if (!token) {
        // Direct browser navigation instead of Next.js router
        window.location.href = "/login";
        return;
      }
      
      // Check if token is valid by making a request to the server
      try {
        await axios.get(`${server}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // If request is successful, token is valid
        setIsTokenValid(true);
        setIsAuthChecking(false);
        dispatch(getAllTows());
      } catch (error) {
        // If token is expired or invalid, logout and redirect to login
        console.error("Token validation error:", error);
        dispatch(logout());
        safeLocalStorage.removeItem("accessToken");
        setIsTokenValid(false);
        setIsAuthChecking(false);
        
        // Direct browser navigation instead of Next.js router
        window.location.href = "/login";
        toast.error("Oturum süreniz doldu. Lütfen tekrar giriş yapın.", {
          duration: 5000,
        });
      }
    };
    
    checkAuth();
    // Only run this effect once on component mount
  }, []);
  
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

  // Show loading or redirect based on auth check
  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }
  
  // If token is invalid, don't render anything (redirect happens in useEffect)
  if (!isTokenValid) {
    return null;
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Çekici Yönetimi</h1>
        <p className="text-gray-500">
          Araç çekme işlemlerinizi bu sayfadan yönetebilirsiniz.
        </p>
        {user?.role === 'user' && (
          <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm inline-block">
            Kullanıcı: Sadece kendi kayıtlarınızı görüntüleyebilirsiniz
          </div>
        )}
        {user?.role === 'admin' && (
          <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm inline-block">
            Admin: Şirket içi tüm kayıtları görüntüleyebilirsiniz
          </div>
        )}
        {user?.role === 'superadmin' && (
          <div className="mt-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-md text-sm inline-block">
            Süper Admin: Tüm yetkilere sahipsiniz
          </div>
        )}
        
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
      
      {/* Quick Add Vehicle Dialog */}
      <Dialog open={isVehicleOpen} onOpenChange={setIsVehicleOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Araç Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVehicleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Araç Adı</Label>
              <Input
                id="name"
                name="name"
                value={vehicleForm.name}
                onChange={handleVehicleInputChange}
                placeholder="Araç adını girin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                value={vehicleForm.model}
                onChange={handleVehicleInputChange}
                placeholder="Araç modelini girin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Yıl</Label>
              <Input
                id="year"
                name="year"
                type="number"
                value={vehicleForm.year}
                onChange={handleVehicleInputChange}
                placeholder="Üretim yılını girin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licensePlate">Plaka</Label>
              <Input
                id="licensePlate"
                name="licensePlate"
                value={vehicleForm.licensePlate}
                onChange={handleVehicleInputChange}
                placeholder="Plaka numarasını girin"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Kaydet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Quick Add Driver Dialog */}
      <Dialog open={isDriverOpen} onOpenChange={setIsDriverOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Şoför Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDriverSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="driverName">Şoför Adı</Label>
              <Input
                id="driverName"
                name="name"
                value={driverForm.name}
                onChange={handleDriverInputChange}
                placeholder="Şoför adını girin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                value={driverForm.phone}
                onChange={handleDriverInputChange}
                placeholder="Telefon numarasını girin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">Ehliyet</Label>
              <Input
                id="license"
                name="license"
                value={driverForm.license}
                onChange={handleDriverInputChange}
                placeholder="Ehliyet bilgisini girin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Tecrübe (Yıl)</Label>
              <Input
                id="experience"
                name="experience"
                type="number"
                value={driverForm.experience}
                onChange={handleDriverInputChange}
                placeholder="Tecrübe yılını girin"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Kaydet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Quick Add Company Dialog */}
      <Dialog open={isCompanyOpen} onOpenChange={setIsCompanyOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Firma Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCompanySubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Firma Adı</Label>
              <Input
                id="companyName"
                name="name"
                value={companyForm.name}
                onChange={handleCompanyInputChange}
                placeholder="Firma adını girin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Input
                id="address"
                name="address"
                value={companyForm.address}
                onChange={handleCompanyInputChange}
                placeholder="Firma adresini girin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyPhone">Telefon</Label>
              <Input
                id="companyPhone"
                name="phone"
                value={companyForm.phone}
                onChange={handleCompanyInputChange}
                placeholder="Telefon numarasını girin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={companyForm.email}
                onChange={handleCompanyInputChange}
                placeholder="E-posta adresini girin"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Kaydet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
