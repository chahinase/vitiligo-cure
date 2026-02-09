import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PatientData } from "@/lib/storage";
import { Bell, CheckCircle2, Mail, BellRing } from "lucide-react";
import LockedOverlay from "./LockedOverlay";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useCallback } from "react";

interface Props {
  data: PatientData;
  updateData: (d: Partial<PatientData>) => void;
  unlocked: boolean;
}

export default function CardReminder({ data, updateData, unlocked }: Props) {
  const { toast } = useToast();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendNotification = useCallback(() => {
    if (Notification.permission === "granted") {
      new Notification("إعلاج من البهاق 💊", {
        body: "حان وقت استخدام البومادة! لا تنسَ تسجيل التزامك اليوم.",
        icon: "/favicon.ico",
      });
    }
  }, []);

  // Check every minute if it's 20:00 and send notification
  useEffect(() => {
    if (!data.reminderConfirmed) return;

    const checkTime = () => {
      const now = new Date();
      if (now.getHours() === 20 && now.getMinutes() === 0) {
        sendNotification();
      }
    };

    intervalRef.current = setInterval(checkTime, 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [data.reminderConfirmed, sendNotification]);

  const handleConfirm = async () => {
    // Request browser notification permission
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        toast({
          title: "⚠️ تنبيه",
          description: "تم رفض إذن الإشعارات. يرجى تفعيلها من إعدادات المتصفح لتلقي التذكير.",
          variant: "destructive",
        });
        return;
      }
      if (permission === "granted") {
        // Send a test notification
        new Notification("إعلاج من البهاق ✅", {
          body: "تم تفعيل التذكير اليومي! سيتم تذكيرك كل يوم الساعة 20:00",
          icon: "/favicon.ico",
        });
      }
    }

    updateData({ reminderConfirmed: true });
    toast({ title: "تم!", description: "سيتم تذكيرك يومياً الساعة 20:00 عبر إشعار المتصفح" });
  };

  return (
    <Card className="relative overflow-hidden">
      {!unlocked && <LockedOverlay />}
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="w-5 h-5 text-primary" />
          <span>التذكير اليومي</span>
          {data.reminderConfirmed && <CheckCircle2 className="w-5 h-5 text-success mr-auto" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-accent rounded-lg">
          <BellRing className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-accent-foreground">
            سنذكّرك يومياً على الساعة <strong>20:00</strong> عبر إشعار المتصفح لاستخدام البومادة.
          </p>
        </div>
        {!data.reminderConfirmed ? (
          <Button onClick={handleConfirm} className="w-full gap-2" size="lg">
            <Bell className="w-4 h-4" />
            تأكيد استقبال التذكير
          </Button>
        ) : (
          <div className="text-center p-3 bg-accent rounded-lg">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-1" />
            <p className="text-sm font-medium text-accent-foreground">✅ تم تفعيل التذكير اليومي</p>
            <p className="text-xs text-muted-foreground mt-1">ستتلقى إشعاراً يومياً الساعة 20:00</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
