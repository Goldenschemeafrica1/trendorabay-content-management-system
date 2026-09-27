import { createContext } from 'react'

// Create context for header visibility control
export const HeaderVisibilityContext = createContext({
  hideHeader: false,
  setHideHeader: () => {}
})

// Create context for sidebar visibility control
export const SidebarVisibilityContext = createContext({
  hideSidebar: false,
  setHideSidebar: () => {}
})

// Create context for theme control
export const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {}
})
