"use client";

import { useState, useEffect } from "react";
import { TowTable } from "@/components/tow-table";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getAllTows } from "@/redux/actions/towActions";
import { createVehicle } from "@/redux/actions/vehicleActions";
import { createCompany } from "@/redux/actions/companyActions";
import { register, clearError } from "@/redux/actions/userActions";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck, Users, Building } from "lucide-react";
import { toast } from "sonner";
import { safeLocalStorage } from "@/lib/utils";
import axios from "axios";
import { server } from "@/config";
import { logout } from "@/redux/actions/userActions";
import { useRouter } from "next/navigation";

export default function TeklifCekiciPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, loading: userLoading, error: userError, success: userSuccess } = useAppSelector((state) => state.user);
  const { tows } = useAppSelector((state) => state.tow);

  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isDriverOpen, setIsDriverOpen] = useState(false);
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
  
  const [companyForm, setCompanyForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    status: "active",
  });

  const [driverForm, setDriverForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "driver",
    license: "",
    experience: 0,
  });

  // Redux states
  const { vehicles, loading: vehicleLoading, error: vehicleError } = useAppSelector(state => state.vehicle || {});
  const { companies, loading: companyLoading, error: companyError } = useAppSelector(state => state.company || {});

  // Filter tows to show only those without service fee
  const towsWithoutServiceFee = tows?.filter(tow => 
    !tow.serviceFee || tow.serviceFee === 0
  ) || [];

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

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch(createCompany(companyForm)).then(() => {
      setIsCompanyOpen(false);
      resetCompanyForm();
      dispatch(getAllTows());
    });
  };

  const resetDriverForm = () => {
    setDriverForm({
      name: "",
      email: "",
      username: "",
      password: "",
      role: "driver",
      license: "",
      experience: 0,
    });
    setIsDriverOpen(false);
  };

  // Reset driver form data when modal closes
  useEffect(() => {
    if (!isDriverOpen) {
      resetDriverForm();
      dispatch(clearError());
    }
  }, [isDriverOpen, dispatch]);

  // Handle driver form success
  useEffect(() => {
    if (userSuccess && isDriverOpen) {
      setIsDriverOpen(false);
      resetDriverForm();
      toast.success("Şoför başarıyla eklendi");
    }
  }, [userSuccess, isDriverOpen]);

  const handleDriverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDriverForm({ 
      ...driverForm, 
      [name]: name === 'experience' ? parseInt(value) || 0 : value 
    });
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least email or username is provided
    if (!driverForm.email && !driverForm.username) {
      toast.error("E-posta veya kullanıcı adı gereklidir.");
      return;
    }
    
    const driverInfo = driverForm.role === 'driver' ? {
      license: driverForm.license,
      experience: driverForm.experience
    } : undefined;
    
    dispatch(register({
      name: driverForm.name,
      email: driverForm.email,
      username: driverForm.username,
      password: driverForm.password,
      role: driverForm.role,
      ...(driverInfo && { license: driverInfo.license, experience: driverInfo.experience })
    }));
  };

  // Open driver form dialog
  const handleAddDriver = () => {
    setIsDriverOpen(true);
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

  // Check if user is a driver
  const isDriver = user?.role === 'driver';

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Teklif Bekleyen Çekimler</h1>
        <p className="text-gray-500">
          Hizmet bedeli belirtilmemiş çekme işlemlerini bu sayfadan görüntüleyebilirsiniz.
        </p>
        <div className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm inline-block">
          Toplam {towsWithoutServiceFee.length} adet teklif bekleyen çekim bulunmaktadır.
        </div>
        
        {/* Only show quick add buttons if user is not a driver */}
        {!isDriver && (
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
              onClick={handleAddDriver}
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
        )}
      </div>
      
      <TowTable filteredTows={towsWithoutServiceFee} />
      
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

      {/* Driver Registration Dialog */}
      <Dialog open={isDriverOpen} onOpenChange={setIsDriverOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Şoför Ekle</DialogTitle>
          </DialogHeader>
                     <form onSubmit={handleDriverSubmit} className="space-y-4 py-4">
             {userError && (
               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                 {userError}
               </div>
             )}
             <div className="space-y-2">
              <Label htmlFor="driverName">Ad Soyad</Label>
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
              <Label htmlFor="driverEmail">E-posta</Label>
              <Input
                id="driverEmail"
                name="email"
                type="email"
                value={driverForm.email}
                onChange={handleDriverInputChange}
                placeholder="Şoför e-posta adresini girin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverUsername">Kullanıcı Adı</Label>
              <Input
                id="driverUsername"
                name="username"
                value={driverForm.username}
                onChange={handleDriverInputChange}
                placeholder="Şoför kullanıcı adını girin"
                required
              />
            </div>
                         <div className="space-y-2">
               <Label htmlFor="driverPassword">Şifre</Label>
               <Input
                 id="driverPassword"
                 name="password"
                 type="password"
                 value={driverForm.password}
                 onChange={handleDriverInputChange}
                 placeholder="Şoför şifresini girin"
                 required
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="driverRole">Rol</Label>
               <Select onValueChange={(value) => setDriverForm({ ...driverForm, role: value })} value={driverForm.role} required>
                 <SelectTrigger className="w-full">
                   <SelectValue placeholder="Şoför rolünü seçin" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="driver">Şoför</SelectItem>
                   <SelectItem value="admin">Admin</SelectItem>
                   <SelectItem value="superadmin">Süper Admin</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             {driverForm.role === 'driver' && (
               <div className="space-y-4 border-l-2 border-gray-200 pl-4 mt-4">
                 <div className="space-y-2">
                   <Label htmlFor="driverLicense">Ehliyet No</Label>
                   <Input
                     id="driverLicense"
                     name="license"
                     value={driverForm.license}
                     onChange={handleDriverInputChange}
                     placeholder="Şoför ehliyet numarasını girin"
                     required={driverForm.role === 'driver'}
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="driverExperience">Deneyim (Yıl)</Label>
                   <Input
                     id="driverExperience"
                     name="experience"
                     type="number"
                     min="0"
                     value={driverForm.experience}
                     onChange={handleDriverInputChange}
                     placeholder="Şoför deneyimini girin"
                     required={driverForm.role === 'driver'}
                   />
                 </div>
               </div>
             )}
            <DialogFooter>
              <Button type="submit" className="w-full">Kaydet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
