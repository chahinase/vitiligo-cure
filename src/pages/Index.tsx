import { useState, useEffect } from "react";
import { getCurrentUser, type User } from "@/lib/storage";
import AuthScreen from "@/components/AuthScreen";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  if (loading) return null;

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  return <Dashboard user={user} onLogout={() => setUser(null)} />;
};

export default Index;
