/*
 * EventTix - users.js  (only used by users.html)
 * ----------------------------------------------
 * Talks to the backend:
 *   GET    /api/users        -> get all users
 *   POST   /api/users        -> add a user
 *   PUT    /api/users/{id}   -> edit a user
 *   DELETE /api/users/{id}   -> delete a user
 *
 * showToast() and confirmDialog() come from app.js (window.EventTixUI).
 */

const tableBody = document.getElementById("usersTableBody");
const userForm = document.getElementById("userForm");
const userModalElement = document.getElementById("userModal");
const userModal = new bootstrap.Modal(userModalElement);
const modalTitle = document.getElementById("userModalTitle");
const passwordInput = document.getElementById("password");
const passwordHint = document.getElementById("passwordHint");
const searchInput = document.getElementById("globalSearch");

let allUsers = [];   // the list we got from the backend

// Small helper: stops weird characters from breaking the HTML
function safe(text) {
  return window.EventTixUI.escapeHtml(text);
}

// ---------------------------------------------------------------
// 1. LOAD users from the backend
// ---------------------------------------------------------------
async function loadUsers() {
  try {
    const response = await fetch("/api/users");

    if (!response.ok) {
      throw new Error("Could not load users");
    }

    allUsers = await response.json();
    showUsers();

  } catch (error) {
    window.EventTixUI.showToast("Failed to load users from database", "danger");
  }
}

// ---------------------------------------------------------------
// 2. SHOW users in the table (uses the search box to filter)
// ---------------------------------------------------------------
function showUsers() {
  const searchText = searchInput.value.toLowerCase();
  let rows = "";

  for (const user of allUsers) {

    // skip users that do not match the search text
    const textToSearch = (user.fullName + " " + user.username + " " + user.email + " " + user.role).toLowerCase();
    if (!textToSearch.includes(searchText)) {
      continue;
    }

    // the delete button is hidden for yourself (so you cannot delete your own account)
    let deleteButton = "";
    if (user.username !== currentUser.username) {
      deleteButton = `<button type="button" class="action-btn action-btn--delete" data-delete-id="${user.userId}" title="Delete"><i class="bi bi-trash3-fill"></i></button>`;
    }

    rows += `
      <tr>
        <td class="cell-strong">${safe(user.fullName)}</td>
        <td>${safe(user.username)}</td>
        <td>${safe(user.email)}</td>
        <td>${safe(user.role)}</td>
        <td class="col-actions">
          <button type="button" class="action-btn action-btn--edit" data-edit-id="${user.userId}" title="Edit"><i class="bi bi-pencil-square"></i></button>
          ${deleteButton}
        </td>
      </tr>`;
  }

  if (rows === "") {
    rows = `<tr><td colspan="5" class="empty-state">No users found.</td></tr>`;
  }

  tableBody.innerHTML = rows;
}

// ---------------------------------------------------------------
// 3. OPEN the form (empty for Add, filled for Edit)
// ---------------------------------------------------------------
function openForm(user) {
  userForm.reset();
  userForm.classList.remove("was-validated");

  if (user === null) {
    // ADD mode
    modalTitle.textContent = "Add User";
    userForm.elements.id.value = "";
    passwordHint.textContent = "";
    passwordInput.required = true;       // password is a must when adding
  } else {
    // EDIT mode
    modalTitle.textContent = "Edit User";
    userForm.elements.id.value = user.userId;
    userForm.elements.fullName.value = user.fullName;
    userForm.elements.username.value = user.username;
    userForm.elements.email.value = user.email;
    userForm.elements.role.value = user.role;
    passwordHint.textContent = "Leave blank to keep the current password.";
    passwordInput.required = false;      // blank is OK when editing
  }

  userModal.show();
}

// ---------------------------------------------------------------
// 4. SAVE (add or edit) when the form is submitted
// ---------------------------------------------------------------
userForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  userForm.classList.add("was-validated");

  // stop if a field is empty / wrong
  if (!userForm.checkValidity()) {
    return;
  }

  const id = userForm.elements.id.value;

  // the data we send to the backend
  const userData = {
    fullName: userForm.elements.fullName.value.trim(),
    username: userForm.elements.username.value.trim(),
    email: userForm.elements.email.value.trim(),
    password: userForm.elements.password.value,
    role: userForm.elements.role.value
  };

  // no id = new user (POST), has id = edit (PUT)
  let url = "/api/users";
  let method = "POST";
  if (id !== "") {
    url = "/api/users/" + id;
    method = "PUT";
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      // the backend sends { "message": "..." } when something is wrong
      const error = await response.json();
      window.EventTixUI.showToast(error.message, "danger");
      return;
    }

    userModal.hide();
    window.EventTixUI.showToast(id === "" ? "User added" : "User updated");
    loadUsers();       // reload the table

  } catch (error) {
    window.EventTixUI.showToast("Cannot reach the server", "danger");
  }
});

// ---------------------------------------------------------------
// 5. CLICKS inside the table: edit and delete buttons
// ---------------------------------------------------------------
tableBody.addEventListener("click", async function (event) {

  const editButton = event.target.closest("[data-edit-id]");
  if (editButton) {
    const id = Number(editButton.dataset.editId);
    const user = allUsers.find(u => u.userId === id);
    openForm(user);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-id]");
  if (deleteButton) {
    const id = Number(deleteButton.dataset.deleteId);
    const user = allUsers.find(u => u.userId === id);

    const ok = await window.EventTixUI.confirmDialog({
      title: "Delete user?",
      message: user.fullName + " (" + user.username + ") will be removed permanently."
    });

    if (!ok) {
      return;
    }

    try {
      const response = await fetch("/api/users/" + id, { method: "DELETE" });

      if (!response.ok) {
        window.EventTixUI.showToast("Could not delete the user", "danger");
        return;
      }

      window.EventTixUI.showToast("User deleted");
      loadUsers();

    } catch (error) {
      window.EventTixUI.showToast("Cannot reach the server", "danger");
    }
  }
});

// ---------------------------------------------------------------
// 6. START: button clicks, search box, first load
// ---------------------------------------------------------------
document.getElementById("addUserBtn").addEventListener("click", function () {
  openForm(null);
});

searchInput.addEventListener("input", showUsers);

loadUsers();
