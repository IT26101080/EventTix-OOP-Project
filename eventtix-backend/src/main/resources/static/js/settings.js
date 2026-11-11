/*
 * EventTix - settings.js  (only used by settings.html)
 * ----------------------------------------------------
 * Talks to the backend:
 *   PUT /api/users/{id}/profile    -> save name / username / email
 *   PUT /api/users/{id}/password   -> change the password
 *
 * The Appearance tab (light / dark) does NOT use the backend.
 * It is saved in the browser with localStorage - see applyTheme() in theme.js.
 *
 * currentUser and getLoggedInUser() come from auth.js. applyTheme() comes from theme.js.
 * showToast() comes from app.js (window.EventTixUI).
 */

const profileForm = document.getElementById("profileForm");
const passwordForm = document.getElementById("passwordForm");

// ---------------------------------------------------------------
// 1. TAB 1 - MY PROFILE
// ---------------------------------------------------------------

// Fill the form with the logged in person's details
function fillProfileForm() {
  document.getElementById("profileFullName").value = currentUser.fullName;
  document.getElementById("profileUsername").value = currentUser.username;
  document.getElementById("profileEmail").value = currentUser.email;
  document.getElementById("profileRole").value = currentUser.role;
}

profileForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  profileForm.classList.add("was-validated");

  // stop if a field is empty / wrong
  if (!profileForm.checkValidity()) {
    return;
  }

  // the data we send to the backend
  const profileData = {
    fullName: document.getElementById("profileFullName").value.trim(),
    username: document.getElementById("profileUsername").value.trim(),
    email: document.getElementById("profileEmail").value.trim()
  };

  try {
    const response = await fetch("/api/users/" + currentUser.userId + "/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData)
    });

    const data = await response.json();

    if (!response.ok) {
      // the backend sends { "message": "..." } when something is wrong
      window.EventTixUI.showToast(data.message, "danger");
      return;
    }

    // It worked! Remember the new details in this tab, so every page shows them.
    sessionStorage.setItem("eventtixUser", JSON.stringify(data));
    currentUser.fullName = data.fullName;
    currentUser.username = data.username;
    currentUser.email = data.email;

    // Update the name + letter in the top-right corner straight away
    document.querySelector(".profile-name").textContent = data.fullName;
    document.querySelector(".profile-avatar").textContent = data.fullName.charAt(0).toUpperCase();

    profileForm.classList.remove("was-validated");
    window.EventTixUI.showToast("Profile saved");

  } catch (error) {
    window.EventTixUI.showToast("Cannot reach the server", "danger");
  }
});

// ---------------------------------------------------------------
// 2. TAB 2 - CHANGE PASSWORD
// ---------------------------------------------------------------
passwordForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmBox = document.getElementById("confirmPassword");
  const confirmFeedback = document.getElementById("confirmFeedback");

  // The two new passwords must be the same.
  // setCustomValidity("text") marks the box as wrong; setCustomValidity("") clears it.
  if (confirmBox.value !== newPassword) {
    confirmBox.setCustomValidity("Passwords do not match");
    confirmFeedback.textContent = "The two new passwords do not match.";
  } else {
    confirmBox.setCustomValidity("");
    confirmFeedback.textContent = "Please repeat the new password.";
  }

  passwordForm.classList.add("was-validated");

  if (!passwordForm.checkValidity()) {
    return;
  }

  try {
    const response = await fetch("/api/users/" + currentUser.userId + "/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      window.EventTixUI.showToast(data.message, "danger");
      return;
    }

    // It worked! Empty the form so the passwords do not stay on the screen.
    passwordForm.reset();
    passwordForm.classList.remove("was-validated");
    window.EventTixUI.showToast("Password changed");

  } catch (error) {
    window.EventTixUI.showToast("Cannot reach the server", "danger");
  }
});

// ---------------------------------------------------------------
// 3. TAB 3 - APPEARANCE (light / dark)
// ---------------------------------------------------------------
const themeRadios = document.querySelectorAll('input[name="theme"]');

// Tick the radio button that matches the theme we are using now
const savedTheme = localStorage.getItem("eventtixTheme") || "light";
themeRadios.forEach(function (radio) {
  radio.checked = (radio.value === savedTheme);

  // When the person picks one: save it and switch the colours immediately
  radio.addEventListener("change", function () {
    applyTheme(radio.value);
    window.EventTixUI.showToast(radio.value === "dark" ? "Dark theme on" : "Light theme on");
  });
});

// ---------------------------------------------------------------
// 4. START
// ---------------------------------------------------------------
fillProfileForm();
