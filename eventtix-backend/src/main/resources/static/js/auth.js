/*
 * EventTix - auth.js  (runs on every page EXCEPT login.html)
 * ----------------------------------------------------------
 * What this file does:
 *   1. Checks if someone is logged in. If not -> go to login.html
 *   2. Shows the logged in person's name + role in the top-right corner
 *   3. Hides the "Users" menu link if the person is not an ADMIN
 *   4. Gives the other files two helper functions: getUser() and logout()
 *
 * The logged in user is kept in sessionStorage (the browser's memory for
 * this tab). When the tab is closed, the user is logged out automatically.
 */

// Get the logged in user (or null if nobody is logged in)
function getLoggedInUser() {
  const text = sessionStorage.getItem("eventtixUser");
  if (text === null) {
    return null;
  }
  return JSON.parse(text);
}

// Log out: forget the user and go to the login page
function logoutUser() {
  sessionStorage.removeItem("eventtixUser");
  window.location.href = "login.html";
}

// ----- Step 1: is someone logged in? -----
const currentUser = getLoggedInUser();

if (currentUser === null) {
  window.location.href = "login.html";
}

// ----- Steps 2 and 3: run after the page has loaded -----
document.addEventListener("DOMContentLoaded", function () {
  if (currentUser === null) {
    return;
  }

  // Step 2: show name and role in the top-right profile box
  const nameBox = document.querySelector(".profile-name");
  const roleBox = document.querySelector(".profile-role");
  const avatarBox = document.querySelector(".profile-avatar");

  if (nameBox) nameBox.textContent = currentUser.fullName;
  if (roleBox) roleBox.textContent = currentUser.role;
  if (avatarBox) avatarBox.textContent = currentUser.fullName.charAt(0).toUpperCase();

  // Step 3: hide admin-only links if this person is not an admin
  if (currentUser.role !== "ADMIN") {
    const adminLinks = document.querySelectorAll("[data-admin-only]");
    adminLinks.forEach(function (link) {
      link.style.display = "none";
    });

    // A normal USER must not stay on the Users page
    if (document.body.dataset.page === "users") {
      window.location.href = "index.html";
    }
  }
});
