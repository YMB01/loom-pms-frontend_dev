/** Inline before React hydrates — prevents flash of wrong theme. Keep in sync with theme-context STORAGE_KEY. */
export const THEME_STORAGE_KEY = "loom-theme";

export const themeInitScript = `(function(){try{var k='${THEME_STORAGE_KEY}';var s=localStorage.getItem(k);var d=false;if(s==='dark')d=true;else if(s==='light')d=false;else d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;
