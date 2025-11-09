import { create } from 'zustand';

const useThemeStore = create((set) => ({
  isDarkMode: localStorage.getItem('theme') === 'dark',
  
  toggleTheme: () =>
    set((state) => {
      const newMode = !state.isDarkMode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return { isDarkMode: newMode };
    }),

  setTheme: (isDark) =>
    set(() => {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return { isDarkMode: isDark };
    }),
}));

// Initialize theme on load
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

export default useThemeStore;
