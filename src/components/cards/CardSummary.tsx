import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientData } from "@/lib/storage";
import { BarChart3, Calendar, TrendingUp, Activity } from "lucide-react";
import LockedOverlay from "./LockedOverlay";

interface Props {
  data: PatientData;
  unlocked: boolean;
}

export default function CardSummary({ data, unlocked }: Props) {
  const getDaysSinceStart = (): number => {
    if (!data.treatmentStartDate) return 0;
    const start = new Date(data.treatmentStartDate);
    const now = new Date();
    return Math.max(1, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  };

  const totalDays = getDaysSinceStart();
  const complianceRate = totalDays > 0 ? Math.round((data.complianceDays.length / totalDays) * 100) : 0;

  return (
    <Card className="relative overflow-hidden">
      {!unlocked && <LockedOverlay />}
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-primary" />
          <span>ملخص الحالة</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-accent rounded-lg text-center">
            <Calendar className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{totalDays}</p>
            <p className="text-xs text-muted-foreground">يوم منذ بدء العلاج</p>
          </div>
          <div className="p-4 bg-accent rounded-lg text-center">
            <TrendingUp className="w-6 h-6 text-success mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{complianceRate}%</p>
            <p className="text-xs text-muted-foreground">نسبة الالتزام</p>
          </div>
          <div className="p-4 bg-accent rounded-lg text-center">
            <Activity className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">جاري التقييم</p>
            <p className="text-xs text-muted-foreground">حالة التقدم</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
