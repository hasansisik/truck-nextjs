"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getAllDrivers, register, clearError } from "@/redux/actions/userActions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { FileText, Clock, Car } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DriversPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { drivers, loading, error: userError, success: userSuccess } = useAppSelector((state) => state.user);
  
  const [isDriverOpen, setIsDriverOpen] = useState(false);
  const [driverForm, setDriverForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "driver",
    license: "",
    experience: 0,
  });
  
  useEffect(() => {
    dispatch(getAllDrivers());
  }, [dispatch]);

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
      // Refresh drivers list
      dispatch(getAllDrivers());
    }
  }, [userSuccess, isDriverOpen, dispatch]);

  const handleAddDriver = () => {
    setIsDriverOpen(true);
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
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aktif</Badge>;
      case "inactive":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Pasif</Badge>;
      case "onleave":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">İzinli</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEditDriver = (driverId: string) => {
    router.push(`/users?editDriver=${driverId}`);
  };

  return (
    <div className="container mx-auto px-2">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Şoförler</h1>
          <p className="text-gray-500">
            Şirketinize kayıtlı şoförleri görüntüleyin
          </p>
        </div>
        <Button onClick={handleAddDriver}>
          Yeni Şoför Ekle
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">Yükleniyor...</div>
      ) : drivers && drivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <Card key={driver._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center mb-4">
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {driver.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-center">{driver.name}</h3>
                  <p className="text-sm text-gray-500 text-center">{driver.username || driver.email || ""}</p>
                </div>
                
                <div className="space-y-3 mt-4 px-2">
                  <div className="flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
                    <span className="font-medium mr-2">Ehliyet:</span>
                    <span>{driver.driverInfo?.license || "-"}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
                    <span className="font-medium mr-2">Deneyim:</span>
                    <span>{driver.driverInfo?.experience !== undefined ? `${driver.driverInfo.experience} yıl` : "-"}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Car className="h-4 w-4 mr-3 text-gray-500 flex-shrink-0" />
                    <span className="font-medium mr-2">Durum:</span>
                    <span>{getStatusBadge(driver.status)}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="border-t ">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleEditDriver(driver._id)}
                >
                  Düzenle
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 border rounded-lg bg-gray-50">
          <div className="bg-gray-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
            <Car className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">Henüz şoför bulunmuyor</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Şirketinize ait şoför kaydı bulunmamaktadır. Yeni şoför eklemek için aşağıdaki butonu kullanabilirsiniz.
          </p>
          <Button onClick={handleAddDriver} className="px-6">
            Yeni Şoför Ekle
          </Button>
        </div>
      )}

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