import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThemeSliceState {
  theme: Theme;
}

type Theme = "light" | "dark";
const themeLocalStorageKey = "main_theme";
const availableThemes: Theme[] = ["light", "dark"];

const getInitialTheme = () => {
  const isBrowserDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const defaultTheme = isBrowserDark ? "dark" : "light";
  const storedTheme = localStorage.getItem(themeLocalStorageKey) as Theme;
  const initialTheme =
    availableThemes.indexOf(storedTheme) === -1 ? defaultTheme : storedTheme;
  localStorage.setItem(themeLocalStorageKey, initialTheme);
  return initialTheme;
};

const initialState: ThemeSliceState = {
  theme: getInitialTheme(),
  // slot color state goes here
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      localStorage.setItem(themeLocalStorageKey, action.payload);
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;