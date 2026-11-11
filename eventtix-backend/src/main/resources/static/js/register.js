/*
 * EventTix - register.js
 * When the "Create account" form is submitted:
 *   1. check that the two passwords are the same
 *   2. send the details to  POST /api/auth/register
 *   3. if it works -> save the user in sessionStorage (= logged in) and go to the dashboard
 *   4. if it fails -> show the error message
 */

const registerForm = document.getElementById("registerForm");
const registerError = document.getElementById("registerError");

// If the person is already logged in, skip this page
if (sessionStorage.getItem("eventtixUser") !== null) {
  window.location.href = "index.html";
}

// A small helper so we don't repeat the same 2 lines again and again
function showError(message) {
  registerError.textContent = message;
  registerError.style.display = "block";
}

registerForm.addEventListener("submit", async function (event) {
  event.preventDefault();             // stop the page from reloading
  registerError.style.display = "none";

  const fullName = document.getElementById("fullName").value;
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Check 1: both passwords must match (we do this in the browser, no server needed)
  if (password !== confirmPassword) {
    showError("The two passwords do not match");
    return;
  }

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: fullName,
        username: username,
        email: email,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // the backend sends { "message": "..." } when something is wrong
      // (for example: "Username is already taken")
      showError(data.message);
      return;
    }

    // Sign up worked! Log the new user in and go to the dashboard.
    sessionStorage.setItem("eventtixUser", JSON.stringify(data));
    window.location.href = "index.html";

  } catch (error) {
    showError("Cannot reach the server. Is the backend running?");
  }
});
