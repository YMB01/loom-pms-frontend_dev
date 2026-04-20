/** Inline before React hydrates — syncs `lang` and Ethiopic font class with localStorage. */
export const LOCALE_STORAGE_KEY = "loom-locale";

export const localeInitScript = `(function(){try{var k='${LOCALE_STORAGE_KEY}';var am=localStorage.getItem(k)==='am';document.documentElement.lang=am?'am':'en';document.documentElement.classList.toggle('locale-am-root',am);if(am)document.body.classList.add('locale-am');else document.body.classList.remove('locale-am');}catch(e){}})();`;
