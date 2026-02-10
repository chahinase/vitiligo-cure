import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
}

export interface OrderDetails {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  quantity: string;
}

export interface PatientData {
  userId: string;
  orderPlaced?: boolean;
  orderDate?: string;
  orderDetails?: OrderDetails;
  profile?: {
    age: string;
    vitiligoLocation: string;
    duration: string;
    beforeImage?: string;
  };
  complianceDays: string[];
  reminderConfirmed?: boolean;
  weeklyPhotos: { week: number; image: string; date: string }[];
  treatmentStartDate?: string;
}

export async function getPatientData(userId: string): Promise<PatientData> {
  const ref = doc(db, "patients", userId);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as PatientData;
  return { userId, complianceDays: [], weeklyPhotos: [] };
}

export async function savePatientData(data: PatientData): Promise<void> {
  const ref = doc(db, "patients", data.userId);
  await setDoc(ref, data, { merge: true });
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}
