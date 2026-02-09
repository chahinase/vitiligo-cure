import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PatientData, getTodayString } from "@/lib/storage";
import { Camera, Upload, Image } from "lucide-react";
import LockedOverlay from "./LockedOverlay";
import { useToast } from "@/hooks/use-toast";

interface Props {
  data: PatientData;
  updateData: (d: Partial<PatientData>) => void;
  unlocked: boolean;
}

export default function CardPhotos({ data, updateData, unlocked }: Props) {
  const { toast } = useToast();

  const getCurrentWeek = (): number => {
    if (!data.treatmentStartDate) return 1;
    const start = new Date(data.treatmentStartDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
  };

  const currentWeek = getCurrentWeek();
  const hasPhotoForCurrentWeek = data.weeklyPhotos.some((p) => p.week === currentWeek);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "خطأ", description: "حجم الصورة كبير جداً (الحد 5 ميغا)", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const newPhoto = { week: currentWeek, image: reader.result as string, date: getTodayString() };
      updateData({ weeklyPhotos: [...data.weeklyPhotos, newPhoto] });
      toast({ title: "تم!", description: `تم رفع صورة الأسبوع ${currentWeek}` });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="relative overflow-hidden">
      {!unlocked && <LockedOverlay />}
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Camera className="w-5 h-5 text-primary" />
          <span>متابعة الصور الأسبوعية</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Before photo */}
        {data.profile?.beforeImage && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">صورة قبل العلاج</p>
            <img src={data.profile.beforeImage} alt="قبل العلاج" className="w-32 h-32 object-cover rounded-lg border" />
          </div>
        )}

        {/* Weekly photos grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {Array.from({ length: Math.max(currentWeek, 4) }, (_, i) => {
            const week = i + 1;
            const photo = data.weeklyPhotos.find((p) => p.week === week);
            return (
              <div key={week} className="text-center">
                <p className="text-xs text-muted-foreground mb-1">أسبوع {week}</p>
                {photo ? (
                  <img src={photo.image} alt={`أسبوع ${week}`} className="w-full aspect-square object-cover rounded-lg border" />
                ) : (
                  <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center border border-dashed">
                    <Image className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Upload button */}
        {!hasPhotoForCurrentWeek && (
          <label className="cursor-pointer">
            <Button asChild className="w-full gap-2">
              <div>
                <Upload className="w-4 h-4" />
                ارفع صورة الأسبوع {currentWeek}
              </div>
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
        )}
      </CardContent>
    </Card>
  );
}
