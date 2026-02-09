import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PatientData, getTodayString } from "@/lib/storage";
import { CalendarCheck, CheckCircle2, Play } from "lucide-react";
import LockedOverlay from "./LockedOverlay";
import { useToast } from "@/hooks/use-toast";

const TREATMENT_DURATION = 15;

interface Props {
  data: PatientData;
  updateData: (d: Partial<PatientData>) => void;
  unlocked: boolean;
}

export default function CardCompliance({ data, updateData, unlocked }: Props) {
  const today = getTodayString();
  const alreadyLogged = data.complianceDays.includes(today);
  const { toast } = useToast();

  const treatmentStarted = !!data.treatmentStartDate;

  // Calculate the 15 treatment days
  const getTreatmentDates = (): string[] => {
    if (!data.treatmentStartDate) return [];
    const dates: string[] = [];
    const start = new Date(data.treatmentStartDate);
    for (let i = 0; i < TREATMENT_DURATION; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  };

  const treatmentDates = getTreatmentDates();

  const handleStartTreatment = () => {
    updateData({ treatmentStartDate: today });
    toast({ title: "🎉 تم بدء العلاج!", description: "حصلت على المنتج وبإمكانك البدء الآن. التزم يومياً لمدة 15 يوماً." });
  };

  const handleLog = () => {
    if (alreadyLogged) return;
    updateData({ complianceDays: [...data.complianceDays, today] });
    toast({ title: "أحسنت! 💪", description: "تم تسجيل التزامك لليوم" });
  };

  // Generate calendar for current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isCompliant = data.complianceDays.includes(dateStr);
    const isTreatmentDay = treatmentDates.includes(dateStr);
    const isPast = dateStr < today;
    const isToday = dateStr === today;
    return { day, dateStr, isCompliant, isTreatmentDay, isPast, isToday };
  });

  const weekDays = ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];

  // Progress
  const completedDays = treatmentDates.filter(d => data.complianceDays.includes(d)).length;

  return (
    <Card className="relative overflow-hidden">
      {!unlocked && <LockedOverlay />}
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarCheck className="w-5 h-5 text-primary" />
          <span>الالتزام اليومي</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!treatmentStarted ? (
          <div className="space-y-3">
            <div className="p-3 bg-accent rounded-lg border border-border">
              <p className="text-sm text-foreground font-medium">🎁 هل حصلت على المنتج؟</p>
              <p className="text-xs text-muted-foreground mt-1">
                إذا وصلك العلاج، يمكنك البدء من اليوم! مدة العلاج 15 يوماً.
              </p>
            </div>
            <Button onClick={handleStartTreatment} size="lg" className="w-full gap-2">
              <Play className="w-5 h-5" />
              نعم، حصلت على المنتج — أبدأ اليوم
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-foreground font-medium">هل وضعت البومادة اليوم؟</p>
              <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded-full">
                {completedDays}/{TREATMENT_DURATION} يوم
              </span>
            </div>
            <Button
              onClick={handleLog}
              disabled={alreadyLogged || !treatmentDates.includes(today)}
              size="lg"
              className="w-full gap-2"
              variant={alreadyLogged ? "secondary" : "default"}
            >
              {alreadyLogged ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  تم التسجيل لليوم ✅
                </>
              ) : !treatmentDates.includes(today) ? (
                "اليوم خارج فترة العلاج"
              ) : (
                "نعم، استخدمتها اليوم"
              )}
            </Button>
          </>
        )}

        {/* Mini Calendar */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            تقويم الشهر الحالي
          </h4>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {weekDays.map((d) => (
              <div key={d} className="font-medium text-muted-foreground py-1">{d}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {monthDays.map(({ day, isCompliant, isTreatmentDay, isPast, isToday }) => {
              let content: React.ReactNode = day;
              let classes = "py-1 rounded text-xs font-medium ";

              if (isTreatmentDay) {
                if (isCompliant) {
                  classes += "bg-success/20 text-success-foreground";
                  content = <span>✅</span>;
                } else if (isPast && !isToday) {
                  classes += "bg-destructive/20 text-destructive";
                  content = <span>❌</span>;
                } else if (isToday) {
                  classes += "bg-primary/30 text-primary ring-2 ring-primary";
                } else {
                  classes += "bg-primary/10 text-primary";
                }
              } else {
                classes += "text-muted-foreground/50";
              }

              return (
                <div key={day} className={classes}>
                  {content}
                </div>
              );
            })}
          </div>
          {treatmentStarted && (
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground justify-center">
              <span className="flex items-center gap-1">✅ تم</span>
              <span className="flex items-center gap-1">❌ فائت</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/10 inline-block" /> أيام العلاج</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
