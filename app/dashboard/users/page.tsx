"use client";

import { useState, useEffect } from "react";
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
import { Plus, Edit, Trash2, X, Check, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { register, getAllUsers, editUser, deleteUser, clearError } from "@/redux/actions/userActions";
import DeleteConfirmation from "@/components/delete-confirmation";

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { loading, error, success, users } = useAppSelector((state) => state.user);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    status: "active"
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
        email: "",
        password: "",
        role: "user",
      });
      dispatch(clearError());
    }
  }, [isAddOpen, dispatch]);

  // Reset edit form data when modal closes
  useEffect(() => {
    if (!isEditOpen) {
      setEditFormData({
        name: "",
        email: "",
        password: "",
        role: "",
        status: "active"
      });
      dispatch(clearError());
    }
  }, [isEditOpen, dispatch]);

  // Set edit form data when a user is selected for editing
  useEffect(() => {
    if (selectedUser) {
      setEditFormData({
        name: selectedUser.name || "",
        email: selectedUser.email || "",
        password: "",
        role: selectedUser.role || "",
        status: selectedUser.status || "active"
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
    dispatch(register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const userData: any = {
      userId: selectedUser._id,
      name: editFormData.name,
      email: editFormData.email,
      role: editFormData.role,
      status: editFormData.status
    };

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
      case "user":
        return <Badge variant="secondary">Kullanıcı</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
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
              <TableHead>E-posta</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!users || users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Kayıt bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.status === "active" ? (
                        <>
                          <Check className="h-4 w-4 text-green-500" />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="h-4 w-4 text-amber-500" />
                          <span>Pasif</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DeleteConfirmation
                        onDelete={() => handleDelete(user._id)}
                        title="Kullanıcı Sil"
                        description="Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add User Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto" hideCloseButton>
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Yeni Kullanıcı Ekle</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Kapat</span>
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          <div className="px-6 py-6 overflow-y-auto">
            {error && (
              <div className="bg-destructive/15 p-3 rounded-md text-destructive mb-4 text-sm">
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleAddSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="Ahmet Yılmaz" 
                    className="mt-1 h-10" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="ahmet@example.com" 
                    className="mt-1 h-10" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Şifre</Label>
                  <Input 
                    id="password" 
                    name="password"
                    type="password" 
                    placeholder="••••••••" 
                    className="mt-1 h-10" 
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Rol</Label>
                  <select 
                    id="role" 
                    name="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="superadmin">Süper Admin</option>
                    <option value="admin">Admin</option>
                    <option value="user">Kullanıcı</option>
                  </select>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-10" 
                disabled={loading}
              >
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit User Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto" hideCloseButton>
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Kullanıcı Düzenle</SheetTitle>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Kapat</span>
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          <div className="px-6 py-6 overflow-y-auto">
            {error && (
              <div className="bg-destructive/15 p-3 rounded-md text-destructive mb-4 text-sm">
                {error}
              </div>
            )}
            
            {selectedUser && (
              <form className="space-y-6" onSubmit={handleEditSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Ad Soyad</Label>
                    <Input 
                      id="edit-name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      className="mt-1 h-10" 
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">E-posta</Label>
                    <Input 
                      id="edit-email"
                      name="email"
                      type="email" 
                      value={editFormData.email}
                      onChange={handleEditInputChange}
                      className="mt-1 h-10" 
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-password">Şifre (Boş bırakırsanız değişmez)</Label>
                    <Input 
                      id="edit-password"
                      name="password"
                      type="password" 
                      placeholder="••••••••" 
                      value={editFormData.password}
                      onChange={handleEditInputChange}
                      className="mt-1 h-10" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-role">Rol</Label>
                    <select 
                      id="edit-role"
                      name="role"
                      value={editFormData.role}
                      onChange={handleEditInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                      required
                    >
                      <option value="superadmin">Süper Admin</option>
                      <option value="admin">Admin</option>
                      <option value="user">Kullanıcı</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Durum</Label>
                    <select 
                      id="edit-status"
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                      required
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Pasif</option>
                    </select>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-10"
                  disabled={loading}
                >
                  {loading ? "Güncelleniyor..." : "Güncelle"}
                </Button>
              </form>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 