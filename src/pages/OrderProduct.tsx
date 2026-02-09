import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ShoppingBag, CheckCircle2, Package, Truck, Star } from "lucide-react";
import { getCurrentUser, getPatientData, savePatientData, getTodayString } from "@/lib/storage";
import productImage from "@/assets/product-cream.jpg";
import { useToast } from "@/hooks/use-toast";

export default function OrderProduct() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const user = getCurrentUser();
  const existingData = user ? getPatientData(user.id) : null;
  const existingOrder = existingData?.orderDetails;

  const [form, setForm] = useState({
    fullName: existingOrder?.fullName || "",
    phone: existingOrder?.phone || "",
    address: existingOrder?.address || "",
    city: existingOrder?.city || "",
    quantity: existingOrder?.quantity || "1",
  });

  const isEditing = !!existingOrder;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.address || !form.city) {
      toast({ title: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }

    if (user) {
      const data = getPatientData(user.id);
      data.orderPlaced = true;
      data.orderDate = data.orderDate || getTodayString();
      data.treatmentStartDate = data.treatmentStartDate || getTodayString();
      data.orderDetails = { ...form };
      savePatientData(data);
    }

    setOrderSubmitted(true);
    toast({ title: isEditing ? "✅ تم تعديل طلبك بنجاح!" : "✅ تم تسجيل طلبك بنجاح!" });
  };

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">
              {isEditing ? "تم تعديل طلبك بنجاح!" : "تم تسجيل طلبك بنجاح!"}
            </h2>
            <p className="text-muted-foreground">
              سيتم التواصل معك قريباً لتأكيد الطلب والتوصيل.
              يمكنك الآن متابعة بقية المراحل بعد أن يصل إليك العلاج.
            </p>
            <Button onClick={() => navigate("/")} className="w-full gap-2 mt-4" size="lg">
              <ArrowRight className="w-5 h-5" />
              العودة إلى المنصة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">
            {isEditing ? "تعديل الطلب" : "طلب المنتج"}
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5 text-primary" />
              معلومات المنتج
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-accent/50 rounded-xl p-4 flex gap-4 items-start">
              <img src={productImage} alt="بومادة علاج البهاق" className="w-24 h-24 rounded-xl object-cover shrink-0 border border-border shadow-sm" />
              <div className="space-y-1">
                <h3 className="font-bold text-foreground text-base">بومادة علاج البهاق</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  كريم طبيعي 100% مصنوع من أعشاب طبية متخصصة لعلاج البهاق. يعمل على تحفيز إنتاج الميلانين واستعادة لون البشرة الطبيعي. نتائج ملحوظة خلال 15 يوماً من الاستخدام المنتظم.
                </p>
                <div className="flex items-center gap-1 pt-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  <span className="text-xs text-muted-foreground mr-1">+200 مستخدم</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between bg-muted rounded-lg p-3">
              <span className="text-muted-foreground">السعر:</span>
              <span className="text-xl font-bold text-primary">1000 د.ج</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="w-4 h-4" />
              <span>التوصيل متاح لجميع الولايات – الدفع عند الاستلام</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingBag className="w-5 h-5 text-primary" />
              {isEditing ? "تعديل بيانات الطلب" : "نموذج الطلب"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input id="fullName" value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} placeholder="أدخل اسمك الكامل" maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="أدخل رقم هاتفك" type="tel" maxLength={20} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">المدينة</Label>
                <Input id="city" value={form.city} onChange={(e) => handleChange("city", e.target.value)} placeholder="أدخل مدينتك" maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">العنوان بالتفصيل</Label>
                <Input id="address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} placeholder="أدخل عنوانك بالتفصيل" maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">الكمية</Label>
                <Select value={form.quantity} onValueChange={(v) => handleChange("quantity", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 علبة</SelectItem>
                    <SelectItem value="2">2 علبة</SelectItem>
                    <SelectItem value="3">3 علب</SelectItem>
                    <SelectItem value="4">4 علب</SelectItem>
                    <SelectItem value="5">5 علب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" size="lg" className="w-full text-base gap-2 mt-2">
                <ShoppingBag className="w-5 h-5" />
                {isEditing ? "حفظ التعديلات" : "تأكيد الطلب"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
