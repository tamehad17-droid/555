import { createSlice } from '@reduxjs/toolkit';
import i18n from '@/i18n';

const getInitialLocale = () => {
  const stored = localStorage.getItem('locale');
  return stored || 'ar';
};

const initialState = {
  current: getInitialLocale(),
};

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setLocale: (state, action) => {
      state.current = action.payload;
      localStorage.setItem('locale', action.payload);
      i18n.changeLanguage(action.payload);
      
      // Update document direction and lang
      if (action.payload === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', action.payload);
      }
    },
  },
});

export const { setLocale } = localeSlice.actions;
export default localeSlice.reducer;
