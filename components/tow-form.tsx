"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { createTow, updateTow } from "@/redux/actions/towActions";
import { getAllVehicles } from "@/redux/actions/vehicleActions";
import { getAllDrivers } from "@/redux/actions/driverActions";
import { getAllCompanies } from "@/redux/actions/companyActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ImageUpload } from "@/components/image-upload";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn, formatDateTR } from "@/lib/utils";
import { toast } from "sonner";

const formSchema = z.object({
  towTruck: z.string().min(1, { message: "Çeken araç bilgisi gereklidir" }),
  driver: z.string().min(1, { message: "Şoför bilgisi gereklidir" }),
  licensePlate: z.string().min(1, { message: "Plaka bilgisi gereklidir" }),
  towDate: z.date({ required_error: "Çekilme tarihi gereklidir" }),
  distance: z.coerce.number().min(0, { message: "Mesafe bilgisi gereklidir" }),
  company: z.string().min(1, { message: "Firma bilgisi gereklidir" }),
  images: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TowFormProps {
  tow?: any;
  onSuccess: () => void;
}

export function TowForm({ tow, onSuccess }: TowFormProps) {
  const dispatch = useAppDispatch();
  const { loading, success, error } = useAppSelector((state) => state.tow);
  const { vehicles } = useAppSelector((state) => state.vehicle);
  const { drivers } = useAppSelector((state) => state.driver);
  const { companies } = useAppSelector((state) => state.company);
  
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Fetch data if needed
  useEffect(() => {
    if (!vehicles?.length) {
      dispatch(getAllVehicles());
    }
    if (!drivers?.length) {
      dispatch(getAllDrivers());
    }
    if (!companies?.length) {
      dispatch(getAllCompanies());
    }
  }, [dispatch, vehicles, drivers, companies]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      towTruck: "",
      driver: "",
      licensePlate: "",
      towDate: new Date(),
      distance: 0,
      company: "",
      images: [],
    },
  });

  useEffect(() => {
    if (tow) {
      form.reset({
        towTruck: tow.towTruck || "",
        driver: tow.driver || "",
        licensePlate: tow.licensePlate || "",
        towDate: tow.towDate ? new Date(tow.towDate) : new Date(),
        distance: tow.distance || 0,
        company: tow.company || "",
        images: tow.images || [],
      });
      
      setImages(tow.images || []);
    }
  }, [tow, form]);

  useEffect(() => {
    if (success && isSubmitting) {
      setIsSubmitting(false);
      onSuccess();
      toast.success(tow ? "Kayıt başarıyla güncellendi" : "Yeni kayıt başarıyla oluşturuldu");
    }
  }, [success, onSuccess, tow, isSubmitting]);

  const handleImageChange = (newImages: string[]) => {
    setImages(newImages);
    setImageError(null);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setImageError(null);
      
      // Fotoğraf artık zorunlu değil
      
      if (tow) {
        await dispatch(updateTow({
          id: tow._id,
          ...data,
          towDate: data.towDate.toISOString(),
          images,
        }));
      } else {
        await dispatch(createTow({
          ...data,
          towDate: data.towDate.toISOString(),
          images,
        }));
      }
    } catch (error: any) {
      setIsSubmitting(false);
      console.error("Error submitting form:", error);
      if (error.message?.includes("404")) {
        toast.error("API sunucusu bulunamadı. Lütfen sunucunun çalıştığından emin olun.");
      } else {
        toast.error(error.message || "Kayıt sırasında bir hata oluştu");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-destructive/15 p-3 rounded-md text-destructive mb-4 text-sm">
            {error === "Request failed with status code 404" 
              ? "API sunucusu bulunamadı. Lütfen sunucunun çalıştığından emin olun."
              : error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="towTruck"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Çeken Araç</FormLabel>
                <Select 
                  disabled={loading || isSubmitting} 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Çekiciler</SelectLabel>
                      {vehicles && vehicles.map((vehicle) => (
                        <SelectItem key={vehicle._id} value={vehicle.name}>
                          {vehicle.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="driver"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Şoför</FormLabel>
                <Select 
                  disabled={loading || isSubmitting} 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Şoförler</SelectLabel>
                      {drivers && drivers.map((driver) => (
                        <SelectItem key={driver._id} value={driver.name}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="licensePlate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Plaka</FormLabel>
              <FormControl>
                <Input placeholder="34ABC123" {...field} disabled={loading || isSubmitting} className="w-full h-10" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="towDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-medium">Çekilme Tarihi</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-10 pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={loading || isSubmitting}
                      >
                        {field.value ? (
                          formatDateTR(field.value)
                        ) : (
                          <span>Tarih seçiniz</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(date);
                        }
                      }}
                      disabled={false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Mesafe (km)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    disabled={loading || isSubmitting}
                    className="w-full h-10"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Firma</FormLabel>
              <Select 
                disabled={loading || isSubmitting} 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Firmalar</SelectLabel>
                    {companies && companies.map((company) => (
                      <SelectItem key={company._id} value={company.name}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="space-y-3 mt-2">
          <Label className="text-sm font-medium">Fotoğraflar (İsteğe bağlı)</Label>
          <ImageUpload
            value={images}
            onChange={handleImageChange}
            disabled={loading || isSubmitting}
          />
          {imageError && (
            <div className="text-destructive text-xs mt-1">{imageError}</div>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={loading || isSubmitting} 
          className="w-full h-10 mt-6"
        >
          {loading || isSubmitting ? "Kaydediliyor..." : tow ? "Güncelle" : "Kaydet"}
        </Button>
      </form>
    </Form>
  );
} 