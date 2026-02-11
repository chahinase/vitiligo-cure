import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import type { PatientData } from "./storage";

/**
 * Check if a given email belongs to an admin by querying the "admins" collection in Firestore.
 * Each document in "admins" has the email as the document ID.
 * To add an admin: create a document in Firestore collection "admins" with the document ID = email address.
 */
export async function isAdminEmail(email: string): Promise<boolean> {
  if (!email) return false;
  const ref = doc(db, "admins", email.toLowerCase());
  const snap = await getDoc(ref);
  return snap.exists();
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
