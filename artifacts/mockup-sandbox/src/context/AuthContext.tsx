import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  changePassword as apiChangePassword,
  deleteAccount as apiDeleteAccount,
  getMe,
  getMembershipStatus,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  updateProfile,
  type MembershipStatus,
  type User,
} from "@/lib/api";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth-storage";

interface AuthContextValue {
  user: User | null;
  membership: MembershipStatus | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMembership: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<MembershipStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    void getMe()
      .then((response) => {
        setUser(response.user);
        setMembership(response.membership);
      })
      .catch(() => clearAuthToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    setAuthToken(response.token);
    setUser(response.user);
    const snapshot = await getMembershipStatus();
    setMembership(snapshot);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await apiRegister(email, password, name);
      setAuthToken(response.token);
      setUser(response.user);
      const snapshot = await getMembershipStatus();
      setMembership(snapshot);
    },
    [],
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setMembership(null);
  }, []);

  const refreshMembership = useCallback(async () => {
    const snapshot = await getMembershipStatus();
    setMembership(snapshot);
  }, []);

  const updateName = useCallback(async (name: string) => {
    const response = await updateProfile(name);
    setUser(response.user);
    setMembership(response.membership);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await apiChangePassword(currentPassword, newPassword);
    },
    [],
  );

  const deleteAccount = useCallback(async () => {
    await apiDeleteAccount();
    setUser(null);
    setMembership(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      membership,
      isLoading,
      login,
      register,
      logout,
      refreshMembership,
      updateName,
      changePassword,
      deleteAccount,
    }),
    [
      user,
      membership,
      isLoading,
      login,
      register,
      logout,
      refreshMembership,
      updateName,
      changePassword,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
