import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PatientData, getTodayString } from "@/lib/storage";
import { ShoppingBag, CheckCircle2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LockedOverlay from "./LockedOverlay";

interface Props {
  data: PatientData;
  updateData: (d: Partial<PatientData>) => void;
  unlocked: boolean;
}

export default function CardOrder({ data, updateData, unlocked }: Props) {
  const navigate = useNavigate();

  const handleAlreadyBought = () => {
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
          <div className="space-y-3">
            <Button
              onClick={handleAlreadyBought}
              variant="outline"
              size="lg"
              className="w-full text-base gap-2 border-secondary text-secondary hover:bg-secondary/10"
            >
              <CheckCircle2 className="w-5 h-5" />
              اشتريت المنتج مسبقاً – انتقل للمرحلة التالية
            </Button>
            <div className="text-center text-sm text-muted-foreground">أو</div>
            <Button
              onClick={() => navigate("/order")}
              size="lg"
              className="w-full text-base gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              لم أطلب بعد – اشترِ المنتج الآن
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
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
