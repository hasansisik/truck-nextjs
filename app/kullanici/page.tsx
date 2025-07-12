"use client";

import { useState, useEffect, Suspense } from "react";
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
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Check, ShieldAlert, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { register, getAllUsers, editUser, deleteUser, clearError } from "@/redux/actions/userActions";
import DeleteConfirmation from "@/components/delete-confirmation";
import { DialogClose } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { useSearchParams } from 'next/navigation';

// Component that handles search params with Suspense
function SearchParamsHandler({ 
  users, 
  setFormData, 
  formData, 
  setIsAddOpen, 
  setSelectedUser, 
  setIsEditOpen 
}: {
  users: any[];
  setFormData: (data: any) => void;
  formData: any;
  setIsAddOpen: (open: boolean) => void;
  setSelectedUser: (user: any) => void;
  setIsEditOpen: (open: boolean) => void;
}) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const addDriver = searchParams.get('addDriver');
    const editDriver = searchParams.get('editDriver');
    
    if (addDriver === 'true') {
      setFormData({
        ...formData,
        role: 'driver'
      });
      setIsAddOpen(true);
    }
    
    if (editDriver) {
      const driver = users.find(user => user._id === editDriver);
      if (driver) {
        setSelectedUser(driver);
        setIsEditOpen(true);
      }
    }
  }, [searchParams, users, setFormData, formData, setIsAddOpen, setSelectedUser, setIsEditOpen]);
  
  return null;
}

function UsersPageContent() {
  const dispatch = useAppDispatch();
  const { loading, error, success, users } = useAppSelector((state) => state.user);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "driver",
    license: "",
    experience: 0,
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "",
    status: "active",
    license: "",
    experience: 0
  });

  // Fetch users on component mount
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // Reset form data when modal closes
  useEffect(() => {
    if (!isAddOpen) {
      setFormData({
        name: "",
        username: "",
        password: "",
        role: "driver",
        license: "",
        experience: 0,
      });
      dispatch(clearError());
    }
  }, [isAddOpen, dispatch]);

  // Reset edit form data when modal closes
  useEffect(() => {
    if (!isEditOpen) {
      setEditFormData({
        name: "",
        username: "",
        password: "",
        role: "",
        status: "active",
        license: "",
        experience: 0
      });
      dispatch(clearError());
    }
  }, [isEditOpen, dispatch]);

  // Set edit form data when a user is selected for editing
  useEffect(() => {
    if (selectedUser) {
      setEditFormData({
        name: selectedUser.name || "",
        username: selectedUser.username || "",
        password: "",
        role: selectedUser.role || "",
        status: selectedUser.status || "active",
        license: selectedUser.driverInfo?.license || "",
        experience: selectedUser.driverInfo?.experience || 0
      });
    }
  }, [selectedUser]);

  // Refresh users list after successful operations
  useEffect(() => {
    if (success) {
      dispatch(getAllUsers());
      if (isAddOpen) setIsAddOpen(false);
      if (isEditOpen) setIsEditOpen(false);
    }
  }, [success, dispatch, isAddOpen, isEditOpen]);



  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleDelete = (userId: string) => {
    dispatch(deleteUser(userId));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };
  
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that username is provided
    if (!formData.username) {
      toast.error("Kullanıcı adı gereklidir.");
      return;
    }
    
    // Validate username format
    if (formData.username.length < 3) {
      toast.error("Kullanıcı adı en az 3 karakter olmalıdır.");
      return;
    }
    
    const driverInfo = formData.role === 'driver' ? {
      license: formData.license,
      experience: formData.experience
    } : undefined;
    
    dispatch(register({
      name: formData.name,
      username: formData.username,
      password: formData.password,
      role: formData.role,
      ...(driverInfo && { license: driverInfo.license, experience: driverInfo.experience })
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    // Validate that username is provided
    if (!editFormData.username) {
      toast.error("Kullanıcı adı gereklidir.");
      return;
    }
    
    // Validate username format
    if (editFormData.username.length < 3) {
      toast.error("Kullanıcı adı en az 3 karakter olmalıdır.");
      return;
    }

    const userData: any = {
      userId: selectedUser._id,
      name: editFormData.name,
      username: editFormData.username,
      role: editFormData.role,
      status: editFormData.status
    };
    
    // Add driver info if role is driver
    if (editFormData.role === 'driver') {
      userData.license = editFormData.license;
      userData.experience = parseInt(editFormData.experience.toString());
    }

    // Only include password if it's provided
    if (editFormData.password) {
      userData.password = editFormData.password;
    }

    dispatch(editUser(userData));
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "superadmin":
        return <Badge variant="destructive">Süper Admin</Badge>;
      case "admin":
        return <Badge variant="default">Admin</Badge>;
      case "driver":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Şoför</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="container mx-auto">
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsHandler
          users={users}
          setFormData={setFormData}
          formData={formData}
          setIsAddOpen={setIsAddOpen}
          setSelectedUser={setSelectedUser}
          setIsEditOpen={setIsEditOpen}
        />
      </Suspense>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-gray-500">
            Sistem kullanıcılarını bu sayfadan yönetebilirsiniz.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kullanıcı
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kullanıcı</TableHead>
              <TableHead>Kullanıcı Adı</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        {user.role === "superadmin" && (
                          <div className="text-xs flex items-center text-red-600">
                            <ShieldAlert className="h-3 w-3 mr-1" /> Süper Yönetici
                          </div>
                        )}
                        {user.role === "driver" && (
                          <div className="text-xs flex items-center text-green-600">
                            <Car className="h-3 w-3 mr-1" /> Şoför
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.username || "-"}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    {user.status === "active" ? (
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                        <span>Aktif</span>
                      </div>
                    ) : user.status === "onleave" ? (
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 mr-2"></div>
                        <span>İzinli</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></div>
                        <span>Pasif</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                        disabled={user.role === "superadmin"}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DeleteConfirmation
                        title="Kullanıcıyı Sil"
                        description={`${user.name} kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
                        onDelete={() => handleDelete(user._id)}
                        isLoading={loading}
                        disabled={user.role === "superadmin"}
                        size="icon"
                        variant="ghost"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Henüz kullanıcı bulunmuyor.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add User Sheet */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı <span className="text-red-500">*</span></Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Benzersiz kullanıcı adı girin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Rol seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver">Şoför</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Süper Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.role === 'driver' && (
              <div className="space-y-4 border-l-2 border-gray-200 pl-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="license">Ehliyet Numarası</Label>
                  <Input
                    id="license"
                    name="license"
                    value={formData.license}
                    onChange={handleInputChange}
                    required={formData.role === 'driver'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Deneyim (Yıl)</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required={formData.role === 'driver'}
                  />
                </div>
              </div>
            )}
            
            <div className="pt-4 flex justify-end space-x-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  İptal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Sheet */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kullanıcı Düzenle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Ad Soyad</Label>
              <Input
                id="edit-name"
                name="name"
                value={editFormData.name}
                onChange={handleEditInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">Kullanıcı Adı <span className="text-red-500">*</span></Label>
              <Input
                id="edit-username"
                name="username"
                value={editFormData.username}
                onChange={handleEditInputChange}
                required
                placeholder="Benzersiz kullanıcı adı girin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Şifre (Boş bırakırsanız değişmez)</Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={editFormData.password}
                onChange={handleEditInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol</Label>
              <Select value={editFormData.role} onValueChange={(value) => setEditFormData({...editFormData, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Rol seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver">Şoför</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Süper Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {editFormData.role === 'driver' && (
              <div className="space-y-4 border-l-2 border-gray-200 pl-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-license">Ehliyet Numarası</Label>
                  <Input
                    id="edit-license"
                    name="license"
                    value={editFormData.license}
                    onChange={handleEditInputChange}
                    required={editFormData.role === 'driver'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-experience">Deneyim (Yıl)</Label>
                  <Input
                    id="edit-experience"
                    name="experience"
                    type="number"
                    min="0"
                    value={editFormData.experience}
                    onChange={handleEditInputChange}
                    required={editFormData.role === 'driver'}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="edit-status">Durum</Label>
              <Select value={editFormData.status} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                  <SelectItem value="onleave">İzinli</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4 flex justify-end space-x-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  İptal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UsersPageContent />
    </Suspense>
  );
}