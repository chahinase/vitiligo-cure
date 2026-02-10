import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientData, getTodayString } from "@/lib/storage";
import { Camera, Upload, Lock } from "lucide-react";
import LockedOverlay from "./LockedOverlay";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

const PHOTO_INTERVAL = 5;
const TREATMENT_DURATION = 15;

interface Props {
  data: PatientData;
  updateData: (d: Partial<PatientData>) => void;
  unlocked: boolean;
}

export default function CardPhotos({ data, updateData, unlocked }: Props) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingPeriodRef = useRef<number>(0);
  const [uploading, setUploading] = useState(false);

  const getPhotoPeriods = () => {
    const periods: { period: number; label: string; dayRequired: number }[] = [];
    const totalPeriods = Math.floor(TREATMENT_DURATION / PHOTO_INTERVAL);
    for (let i = 1; i <= totalPeriods; i++) {
      periods.push({
        period: i,
        label: `اليوم ${i * PHOTO_INTERVAL}`,
        dayRequired: i * PHOTO_INTERVAL,
      });
    }
    return periods;
  };

  const periods = getPhotoPeriods();

  const getDaysSinceStart = (): number => {
    if (!data.treatmentStartDate) return 0;
    const start = new Date(data.treatmentStartDate);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const currentDay = getDaysSinceStart();

  const handleSlotClick = (period: number, dayRequired: number) => {
    if (data.weeklyPhotos.some((p) => p.week === period)) return;
    if (uploading) return;

    if (currentDay < dayRequired) {
      const remaining = dayRequired - currentDay;
      toast({
        title: "⏳ لم يحن الوقت بعد",
        description: `يجب أن تمر ${remaining} ${remaining === 1 ? "يوم" : "أيام"} أخرى لرفع هذه الصورة`,
        variant: "destructive",
      });
      return;
    }

    pendingPeriodRef.current = period;
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "خطأ", description: "حجم الصورة كبير جداً (الحد 5 ميغا)", variant: "destructive" });
      return;
    }

    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      const period = pendingPeriodRef.current;
      const newPhoto = { week: period, image: url, date: getTodayString() };
      updateData({ weeklyPhotos: [...data.weeklyPhotos, newPhoto] });
      toast({ title: "تم!", description: `تم رفع صورة اليوم ${period * PHOTO_INTERVAL}` });
    } catch {
      toast({ title: "خطأ", description: "فشل رفع الصورة، حاول مرة أخرى", variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Card className="relative overflow-hidden">
      {!unlocked && <LockedOverlay />}
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Camera className="w-5 h-5 text-primary" />
          <span>متابعة الصور</span>
          <span className="text-xs text-muted-foreground font-normal mr-auto">كل {PHOTO_INTERVAL} أيام</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.profile?.beforeImage && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">صورة قبل العلاج</p>
            <img src={data.profile.beforeImage} alt="قبل العلاج" className="w-32 h-32 object-cover rounded-lg border" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {periods.map(({ period, label, dayRequired }) => {
            const photo = data.weeklyPhotos.find((p) => p.week === period);
            const isAvailable = currentDay >= dayRequired;

            return (
              <div
                key={period}
                className="text-center cursor-pointer group"
                onClick={() => !photo && handleSlotClick(period, dayRequired)}
              >
                <p className="text-xs text-muted-foreground mb-1 font-medium">{label}</p>
                {photo ? (
                  <img
                    src={photo.image}
                    alt={label}
                    className="w-full aspect-square object-cover rounded-lg border-2 border-success"
                  />
                ) : (
                  <div
                    className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center border-2 border-dashed transition-colors ${
                      isAvailable
                        ? "border-primary bg-primary/5 group-hover:bg-primary/10"
                        : "border-muted bg-muted/30"
                    }`}
                  >
                    {isAvailable ? (
                      <>
                        <Upload className="w-6 h-6 text-primary mb-1" />
                        <span className="text-[10px] text-primary font-medium">
                          {uploading ? "جارٍ..." : "ارفع صورة"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 text-muted-foreground/40 mb-1" />
                        <span className="text-[10px] text-muted-foreground/60">غير متاح</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </CardContent>
    </Card>
  );
}
