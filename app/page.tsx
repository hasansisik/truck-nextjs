"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Truck, Users, Building, PlusCircle, Car, CalendarDays, BarChart3, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { safeLocalStorage } from "@/lib/utils";
import axios from "axios";
import { server } from "@/config";
import { logout } from "@/redux/actions/userActions";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TowForm } from "@/components/tow-form";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, loading: userLoading, error: userError, success: userSuccess } = useAppSelector((state) => state.user);
  const { tows, loading: towsLoading } = useAppSelector((state) => state.tow);

  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isTowOpen, setIsTowOpen] = useState(false);
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
    username: "",
    password: "",
    role: "driver",
    license: "",
    experience: 0,
  });

  // Redux states
  const { vehicles, loading: vehicleLoading, error: vehicleError } = useAppSelector(state => state.vehicle || {});
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
    
    // Validate that username is provided
    if (!driverForm.username) {
      toast.error("Kullanıcı adı gereklidir.");
      return;
    }
    
    const driverInfo = driverForm.role === 'driver' ? {
      license: driverForm.license,
      experience: driverForm.experience
    } : undefined;
    
    dispatch(register({
      name: driverForm.name,
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

  // Open tow form dialog
  const handleAddTow = () => {
    setIsTowOpen(true);
  };

  // Handle tow form success
  const handleTowSuccess = () => {
    setIsTowOpen(false);
    dispatch(getAllTows());
  };

  // Check if user is a driver
  const isDriver = user?.role === 'driver';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // Calculate today's date at midnight for filtering
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Dashboard statistics
  const dashboardStats = useMemo(() => {
    if (!tows) return { 
      todayTows: 0, 
      driverStats: [], 
      totalDrivers: 0, 
      vehicleStats: [],
      totalVehicles: 0,
      totalCompanies: 0
    };

    // Filter tows for today
    const todayTows = tows.filter((tow: any) => {
      const towDate = new Date(tow.towDate);
      towDate.setHours(0, 0, 0, 0);
      return towDate.getTime() === today.getTime();
    });

    // Get stats for current driver if user is a driver
    let driverStats: any[] = [];
    if (isDriver && user?.name) {
      const driverTows = todayTows.filter((tow: any) => tow.driver === user.name);
      
      // Group by vehicle
      const vehicleGroups: {[key: string]: number} = {};
      driverTows.forEach((tow: any) => {
        if (tow.towTruck) {
          vehicleGroups[tow.towTruck] = (vehicleGroups[tow.towTruck] || 0) + 1;
        }
      });
      
      driverStats = Object.keys(vehicleGroups).map(vehicle => ({
        vehicle,
        count: vehicleGroups[vehicle]
      }));
    }

    // Get stats for all drivers if user is admin/superadmin
    let allDriverStats: any[] = [];
    if (isAdmin) {
      const driverGroups: {[key: string]: {[key: string]: number}} = {};
      
      todayTows.forEach((tow: any) => {
        if (tow.driver && tow.towTruck) {
          if (!driverGroups[tow.driver]) {
            driverGroups[tow.driver] = {};
          }
          driverGroups[tow.driver][tow.towTruck] = (driverGroups[tow.driver][tow.towTruck] || 0) + 1;
        }
      });
      
      allDriverStats = Object.keys(driverGroups).map(driver => {
        const vehicles = Object.keys(driverGroups[driver]).map(vehicle => ({
          vehicle,
          count: driverGroups[driver][vehicle]
        }));
        
        return {
          driver,
          vehicles,
          totalTows: vehicles.reduce((sum, v) => sum + v.count, 0)
        };
      });
    }

    // Get vehicle statistics
    const vehicleGroups: {[key: string]: number} = {};
    todayTows.forEach((tow: any) => {
      if (tow.towTruck) {
        vehicleGroups[tow.towTruck] = (vehicleGroups[tow.towTruck] || 0) + 1;
      }
    });
    
    const vehicleStats = Object.keys(vehicleGroups).map(vehicle => ({
      vehicle,
      count: vehicleGroups[vehicle]
    }));

    // Get unique counts
    const uniqueDrivers = new Set(todayTows.map((tow: any) => tow.driver)).size;
    const uniqueVehicles = new Set(todayTows.map((tow: any) => tow.towTruck)).size;
    const uniqueCompanies = new Set(todayTows.map((tow: any) => tow.company)).size;

    return {
      todayTows: todayTows.length,
      driverStats,
      allDriverStats,
      totalDrivers: uniqueDrivers,
      vehicleStats,
      totalVehicles: uniqueVehicles,
      totalCompanies: uniqueCompanies
    };
  }, [tows, isDriver, isAdmin, user, today]);

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
      {/* Welcome Section */}
      <div className="mb-6 mt-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hoşgeldin, {user?.name}</h1>
            <p className="text-gray-500 mt-1">
              Çekici yönetim sistemine hoş geldiniz. Bugünün özeti aşağıda.
            </p>
            
            {/* User Role Badge */}
            <div className="mt-3">
              {user?.role === 'driver' && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Şoför</Badge>
              )}
              {user?.role === 'admin' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">Admin</Badge>
              )}
              {user?.role === 'superadmin' && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">Süper Admin</Badge>
              )}
            </div>
          </div>
          
            <div className="mt-4 md:mt-0">
              <Button 
                onClick={handleAddTow} 
                className="bg-primary hover:bg-primary/90"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Yeni Çekme Kaydı
              </Button>
            </div>
        </div>
      </div>
      
      {/* Quick Action Buttons - Moved to top */}
      {!isDriver && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <PlusCircle className="mr-2 h-5 w-5 text-primary" />
            Hızlı İşlemler
          </h2>
          
          <div className="flex flex-wrap gap-3">
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
        </div>
      )}
      
      {/* Dashboard Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-primary" />
          Bugünün İstatistikleri
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Today's Tows */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Bugünkü Çekimler</CardTitle>
              <CardDescription>Tüm şoförler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardStats.todayTows}</div>
              <p className="text-xs text-muted-foreground mt-1">Araç çekildi</p>
            </CardContent>
          </Card>
          
          {/* Active Drivers */}
          {isAdmin && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Aktif Şoförler</CardTitle>
                <CardDescription>Bugün çekim yapan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardStats.totalDrivers}</div>
                <p className="text-xs text-muted-foreground mt-1">Şoför görevde</p>
              </CardContent>
            </Card>
          )}
          
          {/* Vehicles Used */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Kullanılan Araçlar</CardTitle>
              <CardDescription>Bugün kullanılan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardStats.totalVehicles}</div>
              <p className="text-xs text-muted-foreground mt-1">Araç kullanımda</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Driver Statistics (for drivers) */}
      {isDriver && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            Bugünkü Performansınız
          </h2>
          
          {dashboardStats.driverStats.length > 0 ? (
            <div className="space-y-4">
              {dashboardStats.driverStats.map((stat, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Car className="h-8 w-8 text-primary mr-4" />
                      <div>
                        <h3 className="text-xl font-semibold">{stat.vehicle} ile {stat.count} adet araç çektiniz</h3>
                        <p className="text-muted-foreground text-sm mt-1">Bugün, {today.toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Total tows */}
              <Card className="bg-primary/5 border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CalendarDays className="h-8 w-8 text-primary mr-4" />
                    <div>
                      <h3 className="text-xl font-semibold">
                        Bugün toplam {dashboardStats.driverStats.reduce((sum, stat) => sum + stat.count, 0)} adet araç çektiniz
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">Tebrikler! Performansınız kaydedildi.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">Bugün henüz araç çekmediniz</h3>
                  <p className="text-muted-foreground mt-2">Çekme işlemi yaptığınızda burada görünecektir.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Admin/SuperAdmin Driver Statistics */}
      {isAdmin && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Çekici İşlemleri
          </h2>
          
          {dashboardStats.allDriverStats && dashboardStats.allDriverStats.length > 0 ? (
            <>
              {/* Total company performance */}
              <Card className="mb-6 bg-primary/5 border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Building className="h-8 w-8 text-primary mr-4" />
                    <div>
                      <h3 className="text-xl font-semibold">
                        Bugün firma toplam {dashboardStats.todayTows} adet araç çekti
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {dashboardStats.totalDrivers} şoför, {dashboardStats.totalVehicles} araç kullanıldı
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-4">
                {dashboardStats.allDriverStats.map((driver, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <Users className="h-8 w-8 text-blue-500 mr-4 mt-1" />
                        <div className="w-full">
                          <h3 className="text-xl font-semibold mb-2">{driver.driver}</h3>
                          
                          <div className="space-y-3 mt-4">
                            {driver.vehicles.map((v: any, i: number) => (
                              <div key={i} className="flex items-center">
                                <Car className="h-5 w-5 text-muted-foreground mr-3" />
                                <span className="text-lg">{v.vehicle} ile {v.count} adet araç çekti</span>
                              </div>
                            ))}
                            
                            <div className="flex items-center pt-2 mt-2 border-t">
                              <CalendarDays className="h-5 w-5 text-primary mr-3" />
                              <span className="text-lg font-medium">Toplam {driver.totalTows} adet araç çekti</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">Bugün henüz araç çekimi yapılmadı</h3>
                  <p className="text-muted-foreground mt-2">Şoförler çekme işlemi yaptığında burada görünecektir.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
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

      {/* Driver Form Dialog */}
      <Dialog open={isDriverOpen} onOpenChange={setIsDriverOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-md">
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

              {/* Tow Form Dialog */}
        <Dialog open={isTowOpen} onOpenChange={setIsTowOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Çekme Kaydı</DialogTitle>
            </DialogHeader>
            <TowForm onSuccess={handleTowSuccess} />
          </DialogContent>
        </Dialog>
    </div>
  );
}
