import { Lock } from "lucide-react";

export default function LockedOverlay() {
  return (
    <div className="absolute inset-0 bg-muted/70 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center z-10 cursor-not-allowed">
      <Lock className="w-8 h-8 text-muted-foreground mb-2" />
      <span className="text-sm text-muted-foreground font-medium">أكمل البطاقة السابقة أولاً</span>
    </div>
  );
}
