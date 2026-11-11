EventTix MERGED FRONTEND (HTML/CSS/JS only)

Source: user's latest files (Nov 11) + collaborator login/user-management files.

Install: back up src/main/resources/static; copy the CONTENTS of this folder into static (preserve assets/images and other files).

Preserved: existing Events/Customers/Bookings frontend, searchable booking inputs, dashboard normal API, Event Management merge-sort API.
Added: login/register/users/settings pages, auth/theme scripts, admin Users navigation, profile display, functional logout navigation, EventTixUI helpers.

REQUIRES collaborator's BACKEND user-management classes, database users table, and endpoints (/api/auth/login, /api/users, etc.). Frontend-only ZIP cannot supply these.

Security: sessionStorage-based auth is only client-side navigation gating. Protect REST endpoints server-side and hash passwords before real deployment.

Test: login, registration, dashboard, events sort, customers CRUD, booking, users CRUD, settings, logout. Browser cache hard-refresh after installation.
