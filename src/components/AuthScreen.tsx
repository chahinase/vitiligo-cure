import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Heart, UserPlus, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "register") {
        if (!fullName || !phone || !email || !password) {
          toast({ title: "خطأ", description: "يرجى ملء جميع الحقول", variant: "destructive" });
          setSubmitting(false);
          return;
        }
        await register(fullName, phone, email, password);
        toast({ title: "مرحباً!", description: "تم إنشاء حسابك بنجاح" });
      } else {
        if (!email || !password) {
          toast({ title: "خطأ", description: "يرجى إدخال البريد وكلمة المرور", variant: "destructive" });
          setSubmitting(false);
          return;
        }
        await login(email, password);
      }
    } catch (err: any) {
      const msg = err.code === "auth/email-already-in-use"
        ? "البريد الإلكتروني مسجل مسبقاً"
        : err.code === "auth/invalid-credential"
        ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
        : err.code === "auth/weak-password"
        ? "كلمة المرور ضعيفة (6 أحرف على الأقل)"
        : err.message;
      toast({ title: "خطأ", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">إعلاج من البهاق</h1>
          <p className="text-muted-foreground">منصتك للعلاج والمتابعة اليومية</p>
        </div>

        <Card className="shadow-lg border-primary/10">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">
              {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">الاسم الكامل</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="أدخل اسمك الكامل" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" dir="ltr" className="text-left" />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" dir="ltr" className="text-left" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" className="text-left" />
              </div>
              <Button type="submit" className="w-full gap-2" size="lg" disabled={submitting}>
                {mode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {submitting ? "جارٍ..." : mode === "login" ? "دخول" : "إنشاء حساب"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-sm text-primary hover:underline"
              >
                {mode === "login" ? "ليس لديك حساب؟ أنشئ حساباً جديداً" : "لديك حساب؟ سجّل الدخول"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
