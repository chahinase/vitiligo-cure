import { useState, useEffect } from "react";
import { User, getPatientData, savePatientData, setCurrentUser, getTodayString, type PatientData } from "@/lib/storage";
import { Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import CardOrder from "./cards/CardOrder";
import CardProfile from "./cards/CardProfile";
import CardCompliance from "./cards/CardCompliance";
import CardReminder from "./cards/CardReminder";
import CardPhotos from "./cards/CardPhotos";
import CardSummary from "./cards/CardSummary";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [data, setData] = useState<PatientData>(() => getPatientData(user.id));

  useEffect(() => {
    savePatientData(data);
  }, [data]);

  const updateData = (partial: Partial<PatientData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const completedSteps = (): number => {
    let steps = 0;
    if (data.orderPlaced) steps++;
    if (data.profile) steps++;
    if (data.complianceDays.length > 0) steps++;
    if (data.reminderConfirmed) steps++;
    if (data.weeklyPhotos.length > 0) steps++;
    // card 6 is always viewable if 5 is done
    return steps;
  };

  const isUnlocked = (cardIndex: number): boolean => {
    // Card 1 always unlocked, rest need previous completed
    if (cardIndex === 0) return true;
    if (cardIndex === 1) return !!data.orderPlaced;
    if (cardIndex === 2) return !!data.profile;
    // Cards 3-5 unlock after card 3 (compliance) has at least one entry
    if (cardIndex === 3) return data.complianceDays.length > 0;
    if (cardIndex === 4) return !!data.reminderConfirmed;
    if (cardIndex === 5) return data.weeklyPhotos.length > 0 || (!!data.reminderConfirmed && !!data.profile);
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
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
          <Button variant="ghost" size="icon" onClick={handleLogout} title="تسجيل الخروج">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Cards */}
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
