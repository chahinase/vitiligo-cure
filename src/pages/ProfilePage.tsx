import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, FileText, Save, Pencil, Upload } from "lucide-react";
import { getCurrentUser, getPatientData, savePatientData } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const VITILIGO_LOCATIONS = [
  "الوجه", "اليدين", "القدمين", "الذراعين", "الساقين",
  "الظهر", "البطن", "الرقبة", "فروة الرأس", "مناطق متعددة",
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();
  const patientData = user ? getPatientData(user.id) : null;
  const profile = patientData?.profile;

  const [editing, setEditing] = useState(!profile);
  const [age, setAge] = useState(profile?.age || "");
  const [location, setLocation] = useState(profile?.vitiligoLocation || "");
  const [duration, setDuration] = useState(profile?.duration || "");
  const [image, setImage] = useState<string | undefined>(profile?.beforeImage);

  if (!user || !patientData) {
    navigate("/");
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "خطأ", description: "حجم الصورة كبير جداً (الحد 5 ميغا)", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!age || !location || !duration) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }
    const data = getPatientData(user.id);
    data.profile = { age, vitiligoLocation: location, duration, beforeImage: image };
    savePatientData(data);
    setEditing(false);
    toast({ title: "تم!", description: "تم حفظ التعديلات بنجاح" });
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">الملف العلاجي</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" />
              <span>معلومات الملف العلاجي</span>
              {!editing && profile && (
                <Button variant="ghost" size="sm" className="mr-auto gap-1" onClick={() => setEditing(true)}>
                  <Pencil className="w-4 h-4" />
                  تعديل
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>العمر</Label>
                  <Input type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} placeholder="أدخل عمرك" />
                </div>
                <div className="space-y-2">
                  <Label>مكان البهاق</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger><SelectValue placeholder="اختر مكان البهاق" /></SelectTrigger>
                    <SelectContent>
                      {VITILIGO_LOCATIONS.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>مدة الإصابة</Label>
                  <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="مثال: سنتين" />
                </div>
                <div className="space-y-2">
                  <Label>صورة قبل العلاج (اختياري)</Label>
                  <label className="block cursor-pointer">
                    <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{image ? "تغيير الصورة" : "اختر صورة"}</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {image && (
                    <img src={image} alt="صورة قبل العلاج" className="w-24 h-24 object-cover rounded-lg border" />
                  )}
                </div>
                <Button onClick={handleSave} className="w-full gap-2">
                  <Save className="w-4 h-4" />
                  حفظ التعديلات
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-accent/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">العمر</p>
                    <p className="font-semibold text-foreground">{profile?.age} سنة</p>
                  </div>
                  <div className="bg-accent/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">مدة الإصابة</p>
                    <p className="font-semibold text-foreground">{profile?.duration}</p>
                  </div>
                </div>
                <div className="bg-accent/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">مكان البهاق</p>
                  <p className="font-semibold text-foreground">{profile?.vitiligoLocation}</p>
                </div>
                {profile?.beforeImage && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">صورة قبل العلاج</p>
                    <img src={profile.beforeImage} alt="صورة قبل العلاج" className="w-32 h-32 object-cover rounded-lg border" />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
