import { db } from "./firebase";
import { collection, getDocs, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import type { PatientData } from "./storage";

// List of admin emails - add your admin email here
const ADMIN_EMAILS = ["admin@vitiligo-cure.com"];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export async function getAllUsers(): Promise<AdminUser[]> {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminUser));
}

export async function getAllPatients(): Promise<PatientData[]> {
  const snap = await getDocs(collection(db, "patients"));
  return snap.docs.map((d) => d.data() as PatientData);
}

export async function getPatientByUserId(userId: string): Promise<PatientData | null> {
  const ref = doc(db, "patients", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as PatientData) : null;
}

export async function updatePatientData(userId: string, data: Partial<PatientData>): Promise<void> {
  const ref = doc(db, "patients", userId);
  await setDoc(ref, data, { merge: true });
}

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalWithProfile: number;
  avgComplianceDays: number;
  totalPhotos: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [users, patients] = await Promise.all([getAllUsers(), getAllPatients()]);
  
  const totalOrders = patients.filter((p) => p.orderPlaced).length;
  const totalWithProfile = patients.filter((p) => p.profile).length;
  const totalPhotos = patients.reduce((sum, p) => sum + (p.weeklyPhotos?.length || 0), 0);
  const avgComplianceDays =
    patients.length > 0
      ? patients.reduce((sum, p) => sum + (p.complianceDays?.length || 0), 0) / patients.length
      : 0;

  return {
    totalUsers: users.length,
    totalOrders,
    totalWithProfile,
    avgComplianceDays: Math.round(avgComplianceDays * 10) / 10,
    totalPhotos,
  };
}
