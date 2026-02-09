import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, registerUser, loginUser, setCurrentUser } from "@/lib/storage";
import { Heart, UserPlus, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "register") {
        if (!fullName || !phone || !email || !password) {
          toast({ title: "خطأ", description: "يرجى ملء جميع الحقول", variant: "destructive" });
          return;
        }
        const user = registerUser({ fullName, phone, email, password });
        setCurrentUser(user);
        onLogin(user);
        toast({ title: "مرحباً!", description: "تم إنشاء حسابك بنجاح" });
      } else {
        if (!email || !password) {
          toast({ title: "خطأ", description: "يرجى إدخال البريد وكلمة المرور", variant: "destructive" });
          return;
        }
        const user = loginUser(email, password);
        setCurrentUser(user);
        onLogin(user);
      }
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Title */}
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
              <Button type="submit" className="w-full gap-2" size="lg">
                {mode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {mode === "login" ? "دخول" : "إنشاء حساب"}
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
