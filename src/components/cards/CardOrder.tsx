import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PatientData, getTodayString } from "@/lib/storage";
import { ShoppingBag, CheckCircle2 } from "lucide-react";
import LockedOverlay from "./LockedOverlay";

interface Props {
  data: PatientData;
  updateData: (d: Partial<PatientData>) => void;
  unlocked: boolean;
}

export default function CardOrder({ data, updateData, unlocked }: Props) {
  const handleOrder = () => {
    updateData({ orderPlaced: true, orderDate: getTodayString(), treatmentStartDate: getTodayString() });
  };

  return (
    <Card className="relative overflow-hidden">
      {!unlocked && <LockedOverlay />}
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <span>طلب المنتج</span>
          {data.orderPlaced && <CheckCircle2 className="w-5 h-5 text-success mr-auto" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!data.orderPlaced ? (
          <Button onClick={handleOrder} size="lg" className="w-full text-base gap-2">
            <ShoppingBag className="w-5 h-5" />
            اطلب البومادة الآن
          </Button>
        ) : (
          <div className="text-center p-4 bg-accent rounded-lg">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-2" />
            <p className="font-semibold text-accent-foreground">✅ تم طلب المنتج بنجاح – جاري التوصيل</p>
            <p className="text-sm text-muted-foreground mt-1">تاريخ الطلب: {data.orderDate}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
