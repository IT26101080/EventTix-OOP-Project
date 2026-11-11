/*
 * EventTix - theme.js  (runs on EVERY page, including login.html)
 * ---------------------------------------------------------------
 * Light / dark theme.
 *   - The choice is saved in localStorage under the name "eventtixTheme".
 *     (localStorage = the browser's small notebook. It is still there after you
 *      close the tab, so your choice is remembered next time.)
 *   - We put the theme on the <html> tag as  data-theme="dark".
 *     style.css has a section that changes the colours when it sees that.
 *   - Bootstrap has its own dark mode, switched with  data-bs-theme="dark".
 *
 * This file is loaded in the <head> so the right colours are used from the
 * very first moment (no white flash before the page turns dark).
 */

// Switch the page to "light" or "dark" and remember the choice
function applyTheme(theme) {
  if (theme !== "dark") {
    theme = "light";
  }

  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-bs-theme", theme);

  try {
    localStorage.setItem("eventtixTheme", theme);
  } catch (error) {
    // Some browsers block storage. The theme still works, it just is not remembered.
  }
}

// Run once, right now: use the saved theme (or "light" if nothing was saved)
(function () {
  let saved = "light";
  try {
    saved = localStorage.getItem("eventtixTheme") || "light";
  } catch (error) {
    // ignore
  }
  applyTheme(saved);
})();
