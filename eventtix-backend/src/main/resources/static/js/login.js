/*
 * EventTix - login.js
 * When the form is submitted:
 *   1. send username + password to  POST /api/auth/login
 *   2. if it works -> save the user in sessionStorage and go to the dashboard
 *   3. if it fails -> show the error message
 */

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

// If the person is already logged in, skip the login page
if (sessionStorage.getItem("eventtixUser") !== null) {
  window.location.href = "index.html";
}

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();          // stop the page from reloading
  loginError.style.display = "none";

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password })
    });

    const data = await response.json();

    if (!response.ok) {
      // the backend sends { "message": "..." } when something is wrong
      loginError.textContent = data.message;
      loginError.style.display = "block";
      return;
    }

    // Login worked! Remember the user and go to the dashboard.
    sessionStorage.setItem("eventtixUser", JSON.stringify(data));
    window.location.href = "index.html";

  } catch (error) {
    loginError.textContent = "Cannot reach the server. Is the backend running?";
    loginError.style.display = "block";
  }
});
