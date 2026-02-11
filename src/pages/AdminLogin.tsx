import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAdminEmail } from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "خطأ", description: "يرجى إدخال البريد وكلمة المرور", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const isAdmin = await isAdminEmail(email);
      if (!isAdmin) {
        toast({ title: "غير مصرح", description: "هذا البريد ليس لديه صلاحيات المسؤول", variant: "destructive" });
        setSubmitting(false);
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (err: any) {
      const msg =
        err.code === "auth/invalid-credential"
          ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
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
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground">تسجيل دخول المسؤول</p>
        </div>

        <Card className="shadow-lg border-primary/10">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">دخول المسؤول</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">البريد الإلكتروني</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vitiligo-cure.com"
                  dir="ltr"
                  className="text-left"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">كلمة المرور</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="text-left"
                />
              </div>
              <Button type="submit" className="w-full gap-2" size="lg" disabled={submitting}>
                <LogIn className="w-4 h-4" />
                {submitting ? "جارٍ..." : "دخول"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
