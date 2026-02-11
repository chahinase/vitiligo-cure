import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAdminEmail, getAllUsers, getAllPatients, getAdminStats, type AdminUser, type AdminStats } from "@/lib/admin";
import type { PatientData } from "@/lib/storage";
import { Shield, LogOut, Users, ShoppingCart, Activity, Camera, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { signOut } from "firebase/auth";

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PatientDetails({ patient, userName }: { patient: PatientData; userName: string }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="font-semibold text-foreground">المستخدم: {userName}</p>
      </div>
      {patient.orderDetails && (
        <div className="space-y-1">
          <p className="font-semibold text-foreground">بيانات الطلب:</p>
          <p>الاسم: {patient.orderDetails.fullName}</p>
          <p>الهاتف: {patient.orderDetails.phone}</p>
          <p>العنوان: {patient.orderDetails.address}</p>
          <p>المدينة: {patient.orderDetails.city}</p>
          <p>الكمية: {patient.orderDetails.quantity}</p>
          <p>تاريخ الطلب: {patient.orderDate || "—"}</p>
        </div>
      )}
      {patient.profile && (
        <div className="space-y-1">
          <p className="font-semibold text-foreground">الملف العلاجي:</p>
          <p>العمر: {patient.profile.age}</p>
          <p>مكان البهاق: {patient.profile.vitiligoLocation}</p>
          <p>المدة: {patient.profile.duration}</p>
          {patient.profile.beforeImage && (
            <img src={patient.profile.beforeImage} alt="صورة قبل" className="w-32 h-32 object-cover rounded-lg mt-2" />
          )}
        </div>
      )}
      <div>
        <p className="font-semibold text-foreground">أيام الالتزام: {patient.complianceDays?.length || 0}</p>
        <p className="font-semibold text-foreground">التذكير: {patient.reminderConfirmed ? "مفعّل" : "غير مفعّل"}</p>
      </div>
      {patient.weeklyPhotos?.length > 0 && (
        <div className="space-y-2">
          <p className="font-semibold text-foreground">الصور الأسبوعية:</p>
          <div className="grid grid-cols-3 gap-2">
            {patient.weeklyPhotos.map((photo, i) => (
              <div key={i} className="space-y-1">
                <img src={photo.image} alt={`أسبوع ${photo.week}`} className="w-full h-24 object-cover rounded-lg" />
                <p className="text-xs text-muted-foreground text-center">أسبوع {photo.week}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser || !isAdminEmail(fbUser.email || "")) {
        navigate("/admin/login");
        return;
      }
      setAuthorized(true);
      loadData();
    });
    return unsub;
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    const [u, p, s] = await Promise.all([getAllUsers(), getAllPatients(), getAdminStats()]);
    setUsers(u);
    setPatients(p);
    setStats(s);
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  const getUserName = (userId: string) => {
    const u = users.find((x) => x.id === userId);
    return u?.fullName || userId;
  };

  const getPatientForUser = (userId: string) => {
    return patients.find((p) => p.userId === userId);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  const orderedPatients = patients.filter((p) => p.orderPlaced);

  if (!authorized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">لوحة تحكم المسؤول</h1>
              <p className="text-xs text-muted-foreground">إدارة منصة إعلاج من البهاق</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="تسجيل الخروج">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="المستخدمون" value={stats.totalUsers} icon={Users} color="bg-primary" />
            <StatCard title="الطلبات" value={stats.totalOrders} icon={ShoppingCart} color="bg-secondary" />
            <StatCard title="متوسط الالتزام" value={`${stats.avgComplianceDays} يوم`} icon={Activity} color="bg-primary" />
            <StatCard title="الصور المرفوعة" value={stats.totalPhotos} icon={Camera} color="bg-secondary" />
          </div>
        )}

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="patients">المرضى</TabsTrigger>
            <TabsTrigger value="users">المستخدمون</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">جميع الطلبات ({orderedPatients.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>المدينة</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>التفاصيل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderedPatients.map((p) => (
                      <TableRow key={p.userId}>
                        <TableCell className="font-medium">{p.orderDetails?.fullName || "—"}</TableCell>
                        <TableCell dir="ltr" className="text-left">{p.orderDetails?.phone || "—"}</TableCell>
                        <TableCell>{p.orderDetails?.city || "—"}</TableCell>
                        <TableCell>{p.orderDetails?.quantity || "—"}</TableCell>
                        <TableCell>{p.orderDate || "—"}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[80vh] overflow-y-auto">
                              <DialogHeader><DialogTitle>تفاصيل المريض</DialogTitle></DialogHeader>
                              <PatientDetails patient={p} userName={getUserName(p.userId)} />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                    {orderedPatients.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">لا توجد طلبات بعد</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">المرضى ({patients.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المستخدم</TableHead>
                      <TableHead>طلب</TableHead>
                      <TableHead>ملف علاجي</TableHead>
                      <TableHead>التزام</TableHead>
                      <TableHead>صور</TableHead>
                      <TableHead>التفاصيل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((p) => (
                      <TableRow key={p.userId}>
                        <TableCell className="font-medium">{getUserName(p.userId)}</TableCell>
                        <TableCell>
                          <Badge variant={p.orderPlaced ? "default" : "secondary"}>{p.orderPlaced ? "نعم" : "لا"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.profile ? "default" : "secondary"}>{p.profile ? "مكتمل" : "لا"}</Badge>
                        </TableCell>
                        <TableCell>{p.complianceDays?.length || 0} يوم</TableCell>
                        <TableCell>{p.weeklyPhotos?.length || 0}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[80vh] overflow-y-auto">
                              <DialogHeader><DialogTitle>تفاصيل المريض</DialogTitle></DialogHeader>
                              <PatientDetails patient={p} userName={getUserName(p.userId)} />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                    {patients.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">لا يوجد مرضى</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو البريد أو الهاتف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">المستخدمون ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>البريد</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>التفاصيل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => {
                      const patient = getPatientForUser(u.id);
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.fullName}</TableCell>
                          <TableCell dir="ltr" className="text-left">{u.email}</TableCell>
                          <TableCell dir="ltr" className="text-left">{u.phone}</TableCell>
                          <TableCell>
                            <Badge variant={patient?.orderPlaced ? "default" : "secondary"}>
                              {patient?.orderPlaced ? "طلب نشط" : "بدون طلب"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {patient && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[80vh] overflow-y-auto">
                                  <DialogHeader><DialogTitle>تفاصيل المريض</DialogTitle></DialogHeader>
                                  <PatientDetails patient={patient} userName={u.fullName} />
                                </DialogContent>
                              </Dialog>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">لا توجد نتائج</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
