import { create } from "zustand";
import api from "../lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  driverProfile: any;
}

interface Account {
  token: string;
  user: User;
}

interface AuthState {
  accounts: Record<string, Account>; // email -> { token, user }
  activeAccount: string | null;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  register: (name: string, email: string, password: string) => Promise<{ success: boolean }>;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; token?: string; email?: string }>;
  logout: (email?: string) => Promise<void>;
  switchAccount: (email: string) => void;
  refresh: () => Promise<void>;
  getUser: () => Promise<User | null>;
  checkAuth: () => Promise<void>;
  getAccountsList: () => { email: string; name: string; role: string }[];
}

// 🔹 helpers
const loadAccounts = (): Record<string, Account> => {
  try {
    const raw = localStorage.getItem("auth-accounts");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load accounts", e);
  }
  return {};
};

const saveAccounts = (accounts: Record<string, Account>) => {
  localStorage.setItem("auth-accounts", JSON.stringify(accounts));
};

export const useAuthStore = create<AuthState>((set, get) => {
  const accounts = loadAccounts();
  const activeAccount = sessionStorage.getItem("activeAccount");
  const currentAcc = activeAccount ? accounts[activeAccount] : null;

  return {
    accounts,
    activeAccount,
    user: currentAcc?.user || null,
    token: currentAcc?.token || null,
    loading: false,
    error: null,

    // Register
    register: async (name, email, password) => {
      set({ loading: true, error: null });
      try {
        const res = await api.post("/auth/register", { name, email, password });
        const { token, user } = res.data;

        const newAccounts = { ...get().accounts, [email]: { token, user } };
        saveAccounts(newAccounts);
        sessionStorage.setItem("activeAccount", email);

        set({
          accounts: newAccounts,
          activeAccount: email,
          token,
          user,
          loading: false,
        });
        return { success: true };
      } catch (err: any) {
        set({
          loading: false,
          error: err.response?.data?.message || "Registration failed",
        });
        return { success: false };
      }
    },

    // Login
    login: async (email, password) => {
      set({ loading: true, error: null });
      try {
        const res = await api.post("/auth/login", { email, password });
        const { token, user } = res.data;

        const newAccounts = { ...get().accounts, [email]: { token, user } };
        saveAccounts(newAccounts);
        sessionStorage.setItem("activeAccount", email);

        set({
          accounts: newAccounts,
          activeAccount: email,
          token,
          user,
          loading: false,
        });

        return { success: true, user, token };
      } catch (err: any) {
        set({
          loading: false,
          error: err.response?.data?.message || "Login failed",
        });
        return { success: false };
      }
    },

    // Logout (only remove one account)
    logout: async (email?: string) => {
      const target = email || get().activeAccount;
      if (!target) return;

      const newAccounts = { ...get().accounts };
      delete newAccounts[target];
      saveAccounts(newAccounts);

      let newActive = get().activeAccount;
      if (target === newActive) {
        sessionStorage.removeItem("activeAccount");
        newActive = null;
      }

      set({
        accounts: newAccounts,
        activeAccount: newActive,
        user: newActive ? newAccounts[newActive]?.user : null,
        token: newActive ? newAccounts[newActive]?.token : null,
      });

      try {
        await api.post("/auth/logout");
      } catch {
        // ignore
      }
    },

    // Switch account (tab-specific)
    switchAccount: (email: string) => {
      const acc = get().accounts[email];
      if (!acc) return;
      sessionStorage.setItem("activeAccount", email);
      set({ activeAccount: email, user: acc.user, token: acc.token });
    },

    // Refresh token for active account
    refresh: async () => {
      const { activeAccount, accounts } = get();
      if (!activeAccount) return;

      const acc = accounts[activeAccount];
      if (!acc) return;

      try {
        const res = await api.get("/refresh", {
          headers: { Authorization: `Bearer ${acc.token}` },
        });
        const { token: newToken, user } = res.data;

        const updatedAcc = { token: newToken || acc.token, user: user || acc.user };
        const newAccounts = { ...accounts, [activeAccount]: updatedAcc };
        saveAccounts(newAccounts);

        set({
          accounts: newAccounts,
          user: updatedAcc.user,
          token: updatedAcc.token,
        });
      } catch {
        await get().logout(activeAccount);
      }
    },

    checkAuth: async () => {
      const { activeAccount, accounts } = get();
      if (!activeAccount) return;
      const acc = accounts[activeAccount];
      if (!acc) return;

      try {
        const res = await api.get("/me", {
          headers: { Authorization: `Bearer ${acc.token}` },
        });
        const updatedAcc = { token: acc.token, user: res.data };
        const newAccounts = { ...accounts, [activeAccount]: updatedAcc };
        saveAccounts(newAccounts);
        set({
          accounts: newAccounts,
          user: res.data,
          token: acc.token,
        });
      } catch {
        await get().logout(activeAccount);
      }
    },

    getUser: async () => {
      const { activeAccount, accounts } = get();
      if (!activeAccount) return null;
      const acc = accounts[activeAccount];
      if (!acc) return null;

      try {
        const res = await api.get("/me", {
          headers: { Authorization: `Bearer ${acc.token}` },
        });
        const updatedAcc = { token: acc.token, user: res.data };
        const newAccounts = { ...accounts, [activeAccount]: updatedAcc };
        saveAccounts(newAccounts);
        set({ accounts: newAccounts, user: res.data });
        return res.data;
      } catch {
        await get().logout(activeAccount);
        return null;
      }
    },

    getAccountsList: () => {
      const { accounts } = get();
      return Object.entries(accounts).map(([email, acc]) => ({
        email,
        name: acc.user.name,
        role: acc.user.role,
      }));
    },
  };
});

export default useAuthStore;

export const useAuth = () => {
  const {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    refresh,
    getUser,
    checkAuth,
    switchAccount,
    getAccountsList,
    activeAccount,
  } = useAuthStore();

  return {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    refresh,
    getUser,
    checkAuth,
    switchAccount,
    getAccountsList,
    activeAccount,
  };
};
