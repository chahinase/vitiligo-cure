import { useState, useEffect, useCallback } from "react";
import { getPatientData, savePatientData, getTodayString, type PatientData } from "@/lib/storage";
import { Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import CardOrder from "./cards/CardOrder";
import CardProfile from "./cards/CardProfile";
import CardCompliance from "./cards/CardCompliance";
import CardReminder from "./cards/CardReminder";
import CardPhotos from "./cards/CardPhotos";
import CardSummary from "./cards/CardSummary";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getPatientData(user.id).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [user]);

  const updateData = useCallback(async (partial: Partial<PatientData>) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      savePatientData(next); // fire and forget
      return next;
    });
  }, []);

  if (loading || !data || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const isUnlocked = (cardIndex: number): boolean => {
    if (cardIndex === 0) return true;
    if (cardIndex === 1) return !!data.orderPlaced;
    if (cardIndex === 2) return !!data.profile;
    if (cardIndex === 3) return data.complianceDays.length > 0;
    if (cardIndex === 4) return !!data.reminderConfirmed;
    if (cardIndex === 5) return data.weeklyPhotos.length > 0 || (!!data.reminderConfirmed && !!data.profile);
    return false;
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">إعلاج من البهاق</h1>
              <p className="text-xs text-muted-foreground">مرحباً، {user.fullName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} title="تسجيل الخروج">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-6 space-y-4">
        <CardOrder data={data} updateData={updateData} unlocked={isUnlocked(0)} />
        <CardProfile data={data} updateData={updateData} unlocked={isUnlocked(1)} />
        <CardCompliance data={data} updateData={updateData} unlocked={isUnlocked(2)} />
        <CardReminder data={data} updateData={updateData} unlocked={isUnlocked(3)} />
        <CardPhotos data={data} updateData={updateData} unlocked={isUnlocked(4)} />
        <CardSummary data={data} unlocked={isUnlocked(5)} />
      </main>
    </div>
  );
}
