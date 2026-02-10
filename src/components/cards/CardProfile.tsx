import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PatientData } from "@/lib/storage";
import { FileText, CheckCircle2, Upload, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LockedOverlay from "./LockedOverlay";
import { useToast } from "@/hooks/use-toast";
import { uploadToCloudinary } from "@/lib/cloudinary";

const VITILIGO_LOCATIONS = [
  "الوجه", "اليدين", "القدمين", "الذراعين", "الساقين",
  "الظهر", "البطن", "الرقبة", "فروة الرأس", "مناطق متعددة",
];

interface Props {
  data: PatientData;
  updateData: (d: Partial<PatientData>) => void;
  unlocked: boolean;
}

export default function CardProfile({ data, updateData, unlocked }: Props) {
  const [age, setAge] = useState(data.profile?.age || "");
  const [location, setLocation] = useState(data.profile?.vitiligoLocation || "");
  const [duration, setDuration] = useState(data.profile?.duration || "");
  const [image, setImage] = useState<string | undefined>(data.profile?.beforeImage);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "خطأ", description: "حجم الصورة كبير جداً (الحد 5 ميغا)", variant: "destructive" });
      return;
    }
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setImage(url);
    } catch {
      toast({ title: "خطأ", description: "فشل رفع الصورة، حاول مرة أخرى", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!age || !location || !duration) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }
    updateData({
      profile: { age, vitiligoLocation: location, duration, beforeImage: image },
    });
    toast({ title: "تم!", description: "تم حفظ ملفك العلاجي بنجاح" });
  };

  if (data.profile) {
    return (
      <Card className="relative overflow-hidden">
        {!unlocked && <LockedOverlay />}
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            <span>الملف العلاجي</span>
            <CheckCircle2 className="w-5 h-5 text-success mr-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center p-4 bg-accent rounded-lg">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-2" />
            <p className="font-semibold text-accent-foreground">✅ تم إنشاء ملفك العلاجي</p>
          </div>
          <Button
            onClick={() => navigate("/profile")}
            variant="outline"
            size="sm"
            className="w-full gap-2"
          >
            <Eye className="w-4 h-4" />
            عرض وتعديل الملف العلاجي
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      {!unlocked && <LockedOverlay />}
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-primary" />
          <span>إنشاء الملف العلاجي</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <div className="flex items-center gap-2">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {uploading ? "جارٍ الرفع..." : image ? "تم اختيار صورة" : "اختر صورة"}
                </span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
          {image && (
            <img src={image} alt="صورة قبل العلاج" className="w-24 h-24 object-cover rounded-lg border" />
          )}
        </div>
        <Button onClick={handleSave} className="w-full gap-2" disabled={uploading}>
          <FileText className="w-4 h-4" />
          حفظ الملف
        </Button>
      </CardContent>
    </Card>
  );
}
