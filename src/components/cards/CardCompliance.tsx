import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PatientData, getTodayString } from "@/lib/storage";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import LockedOverlay from "./LockedOverlay";
import { useToast } from "@/hooks/use-toast";

interface Props {
  data: PatientData;
  updateData: (d: Partial<PatientData>) => void;
  unlocked: boolean;
}

export default function CardCompliance({ data, updateData, unlocked }: Props) {
  const today = getTodayString();
  const alreadyLogged = data.complianceDays.includes(today);
  const { toast } = useToast();

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
    const isPast = new Date(dateStr) < new Date(today);
    const isToday = dateStr === today;
    return { day, dateStr, isCompliant, isPast, isToday };
  });

  const weekDays = ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];

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
        <p className="text-foreground font-medium">هل وضعت البومادة اليوم؟</p>
        <Button
          onClick={handleLog}
          disabled={alreadyLogged}
          size="lg"
          className="w-full gap-2"
          variant={alreadyLogged ? "secondary" : "default"}
        >
          {alreadyLogged ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              تم التسجيل لليوم ✅
            </>
          ) : (
            "نعم، استخدمتها اليوم"
          )}
        </Button>

        {/* Mini Calendar */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            تقويم الشهر الحالي
          </h4>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {weekDays.map((d) => (
              <div key={d} className="font-medium text-muted-foreground py-1">{d}</div>
            ))}
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {monthDays.map(({ day, isCompliant, isPast, isToday }) => (
              <div
                key={day}
                className={`py-1 rounded text-xs font-medium ${
                  isCompliant
                    ? "bg-success text-success-foreground"
                    : isPast && !isToday
                    ? "bg-destructive/20 text-destructive"
                    : isToday
                    ? "bg-primary/20 text-primary ring-1 ring-primary"
                    : "text-muted-foreground"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
