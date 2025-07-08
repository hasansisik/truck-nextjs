"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { createExpense, updateExpense } from "@/redux/actions/expenseActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form,
  FormControl,
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
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  name: z.string().min(1, { message: "Masraf adı gereklidir" }),
  description: z.string().min(1, { message: "Masraf açıklaması gereklidir" }),
  date: z.date({ required_error: "Masraf tarihi gereklidir" }),
  amount: z.coerce.number().min(0, { message: "Masraf tutarı gereklidir ve negatif olamaz" }),
});

type FormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  expense?: any;
  onSuccess: () => void;
}

export function ExpenseForm({ expense, onSuccess }: ExpenseFormProps) {
  const dispatch = useAppDispatch();
  const { loading, success, error } = useAppSelector((state) => state.expense);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      date: new Date(),
      amount: 0,
    },
  });

  useEffect(() => {
    if (expense) {
      // Reset form with proper values
      form.reset({
        name: expense.name || "",
        description: expense.description || "",
        date: expense.date ? new Date(expense.date) : new Date(),
        amount: expense.amount || 0,
      });
    }
  }, [expense, form]);

  useEffect(() => {
    if (success && isSubmitting) {
      setIsSubmitting(false);
      onSuccess();
      toast.success(expense ? "Masraf kaydı başarıyla güncellendi" : "Yeni masraf kaydı başarıyla oluşturuldu");
    }
  }, [success, onSuccess, expense, isSubmitting]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      if (expense) {
        await dispatch(updateExpense({
          id: expense._id,
          ...data,
          date: data.date.toISOString(),
        }));
      } else {
        await dispatch(createExpense({
          ...data,
          date: data.date.toISOString(),
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
    <div className="w-full max-w-2xl mx-auto p-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-destructive/15 p-3 rounded-md text-destructive mb-4 text-sm">
              {error === "Request failed with status code 404" 
                ? "API sunucusu bulunamadı. Lütfen sunucunun çalıştığından emin olun."
                : error}
            </div>
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Masraf Adı</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Masraf adını girin" 
                    {...field} 
                    disabled={loading || isSubmitting} 
                    className="w-full h-10" 
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Masraf Açıklaması</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Masraf açıklamasını girin" 
                    {...field} 
                    disabled={loading || isSubmitting} 
                    className="w-full min-h-[80px] resize-none"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium">Masraf Tarihi</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full h-10 pl-3 text-left font-normal justify-start",
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
              name="amount"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium">Masraf Tutarı (₺)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      disabled={loading || isSubmitting}
                      className="w-full h-10"
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4 border-t">
            <Button 
              type="submit" 
              disabled={loading || isSubmitting} 
              className="w-full h-10"
            >
              {loading || isSubmitting ? "Kaydediliyor..." : expense ? "Güncelle" : "Kaydet"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 