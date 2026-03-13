import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  type User,
  signOut,
  onAuthStateChanged,
  signInWithPopup
} from "firebase/auth";

import { auth, googleProvider } from "@/lib/firebase";
import { isAdminEmail } from "@/config/admins";

// retornamos sucesso/erro para que a página de login possa mostrar mensagens
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // observa alterações na autenticação
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAdmin(isAdminEmail(firebaseUser?.email));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithPopup(auth, googleProvider);
      // não rejeitamos logins de usuários comuns aqui; apenas marcamos admins
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao fazer login com Google:", error);
      return { success: false, error: error?.message || "Erro desconhecido" };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );

}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;

}