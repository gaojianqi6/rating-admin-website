import { User } from '@/typings/user';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore, [["zustand/persist", UserStore]]>(
  persist(
    (set) => ({
      user: null,
      setUser: (user: User) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "ADMIN_USER_STORAGE", // key in localStorage
      // storage: createJSONStorage(() => sessionStorage), 
    }
  )
);

// export const useUserStore = create<UserStore>(
//   persist(
//     (set) => ({
//       user: null,
//       setUser: (user: User) => set({ user }),
//       clearUser: () => set({ user: null }),
//     }),
//     {
//       name: 'user-storage', // key in localStorage
//       // Optionally, specify getStorage if needed (default is localStorage)
//       getStorage: () => localStorage,
//     }
//   )
// );