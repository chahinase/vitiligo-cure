// localStorage-based storage for the trial version

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

export interface PatientData {
  userId: string;
  orderPlaced?: boolean;
  orderDate?: string;
  profile?: {
    age: string;
    vitiligoLocation: string;
    duration: string;
    beforeImage?: string;
  };
  complianceDays: string[]; // array of date strings "YYYY-MM-DD"
  reminderConfirmed?: boolean;
  weeklyPhotos: { week: number; image: string; date: string }[];
  treatmentStartDate?: string;
}

const USERS_KEY = "ilaj_users";
const CURRENT_USER_KEY = "ilaj_current_user";
const PATIENT_DATA_KEY = "ilaj_patient_data";

export function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function registerUser(user: Omit<User, "id">): User {
  const users = getUsers();
  if (users.find((u) => u.email === user.email)) {
    throw new Error("البريد الإلكتروني مسجل مسبقاً");
  }
  const newUser: User = { ...user, id: crypto.randomUUID() };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
}

export function loginUser(email: string, password: string): User {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  return user;
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function getPatientData(userId: string): PatientData {
  const data = localStorage.getItem(`${PATIENT_DATA_KEY}_${userId}`);
  if (data) return JSON.parse(data);
  return {
    userId,
    complianceDays: [],
    weeklyPhotos: [],
  };
}

export function savePatientData(data: PatientData) {
  localStorage.setItem(`${PATIENT_DATA_KEY}_${data.userId}`, JSON.stringify(data));
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}
