# EventTix – Frontend

Event management dashboard built with **HTML5, CSS3, Bootstrap 5 and vanilla JavaScript**.
No React, no Next.js, no Node.js, no build step.

---

## 1. Running it

**Just open `index.html` in a browser.** This was tested both from `file://` (double-click) and over `http://`.

| Requirement | Detail |
|---|---|
| Internet connection | Bootstrap 5.3.3, Bootstrap Icons 1.11.3 and the Inter font load from CDNs (jsDelivr, Google Fonts). Without internet the pages are unstyled and everything that relies on Bootstrap's JavaScript (modals, confirmation dialogs, toasts, the Add/Edit Customer dialog) stops working. See [section 6](#6-using-local-bootstrap-instead-of-the-cdn) to host them yourself. |
| Local server | **Not required** for the frontend alone. There is no `fetch()`, no ES module and no `import`. A server is only needed once you connect the Java backend (section 4), or if you simply prefer one: `python3 -m http.server 8000`. |
| Data | **Nothing is saved.** All data comes from `js/mock-data.js`. Adds, edits and deletes change an in-memory copy and are lost on reload. This is how the original frontend behaved; see section 3. |

## 2. Project structure

```text
eventtix-frontend/
├── index.html              Dashboard
├── events.html             Event Management (list, search, delete)
├── event-form.html         Add / Edit event   (event-form.html?id=3 = edit mode)
├── bookings.html           Ticket Booking
├── customers.html          Customer Management (add / edit modal)
├── css/
│   └── style.css           All custom styling (design tokens in :root)
├── js/
│   ├── app.js              All page behaviour (one file, one init function per page)
│   └── mock-data.js        Demo data + dropdown option lists (replace with backend data)
├── assets/
│   └── images/eventtix-logo.png
└── README.md
```

Pages live at the project root (not in a `pages/` folder) so that every original link
(`event-form.html?id=3`, `events.html?q=jazz`) and every relative path to `css/`, `js/`
and `assets/` stays exactly as designed, and so the folder can be dropped straight into
Spring Boot's `static/` directory.

### What each page does

| Page | Working behaviour |
|---|---|
| **Dashboard** | Summary cards (Total / Active / Today's), next 7 upcoming & ongoing events (soonest first), 6 latest bookings, search, *Add New*, *View all* links |
| **Events** | Summary cards, table with search (name, category, venue, status, date), `?q=` deep-link, pagination (9 / page), *Edit* link, *Delete* with confirmation modal |
| **Event form** | Add mode and Edit mode (`?id=`), Bootstrap validation, focus on first invalid field, *Clear*, *Cancel*, header search, "event not found" notice for a bad `?id=` |
| **Ticket Booking** | New-booking form with live total, validation (1–10 tickets, only non-ended events), bookings table (8 / page) with search by `#id` / customer / event / status, *Delete* with confirmation |
| **Customers** | Add / Edit modal, validation (10-digit phone starting with 0, duplicate-email check, case-insensitive), *Delete* with confirmation that mentions their bookings, search, pagination (9 / page) |
| **All pages** | Off-canvas sidebar below 992 px (hamburger, backdrop click and `Esc` close it), time-based greeting, toast messages, confirmation dialog, *Log Out* and *Settings* links |

---

## 3. What cannot work without a backend

Everything below is **already wired in the UI** but has no server to talk to yet. Each of these is a
placeholder in the original design, not something lost in conversion.

| UI action | Current behaviour | Where in `js/app.js` | Intended Java endpoint |
|---|---|---|---|
| Load events / customers / bookings | Read from `EventTixMock` | top of file (`store`) | `GET /events`, `GET /customers`, `GET /bookings` (named in the `mock-data.js` comment) |
| Save event (add / update) | Validates, shows an info toast, redirects to `events.html`. **Does not save.** | `initEventForm` → `submit` | `POST /events/save` (already the form's `action`) |
| Delete event | Confirm → removed from the in-memory list only | `bindEventDelete` | not defined in the original, your choice |
| Save customer (add / update) | Added / edited in memory only | `initCustomersPage` → `submit` | `POST /customers/save` (already the form's `action`) |
| Delete customer | In-memory only | `initCustomersPage` | not defined in the original |
| Create booking | Added to in-memory list as `CONFIRMED` | `initBookingsPage` → `submit` | `POST /bookings/save` (already the form's `action`) |
| Delete booking | In-memory only | `initBookingsPage` | not defined in the original |
| Log Out | Confirm dialog, then an info toast saying auth isn't connected | `initShellActions` | Spring Security `POST /logout` |
| Settings | Info toast: "not part of this frontend demo" | `initShellActions` | no page exists in the original |
| Current user ("Madhawa / User") | Hard-coded in each page's header | `.profile-pill` in every `.html` | from the logged-in session |

> The three forms carry `action="/…/save" method="post"`, but their `submit` handlers start with
> `preventDefault()` and then only validate and update the in-memory data, so **nothing is posted
> yet**. That is the hook point for your backend (see 4.3).

---

## 4. Java backend integration

### 4.1 Option A: Spring Boot serving this folder as static files (simplest)

1. Copy the **contents** of `eventtix-frontend/` into `src/main/resources/static/`.
2. Run the app (`./mvnw spring-boot:run` or `./gradlew bootRun`) and open `http://localhost:8080/`.

Spring Boot serves `static/index.html` as the welcome page, so no controller is needed to view the UI
and the original Next.js `/` → `/index.html` redirect is not needed.

### 4.2 Option B: Thymeleaf templates

The code comments mention Thymeleaf (`th:each`). If you go that way:

- Move the five `.html` files to `src/main/resources/templates/`; keep `css/`, `js/`, `assets/` in `static/`.
- Add controllers that return the template names, and change page links from `events.html` to your routes.
- Use absolute asset paths (`/css/style.css`, or `th:href="@{/css/style.css}"`) because pages will no longer all sit at the root.
- Decide whether tables are rendered server-side (remove the matching render code from `app.js`) or kept client-side and fed by JSON.

### 4.3 Connecting the forms and lists

- **Lists:** replace the arrays in `js/mock-data.js` with data from your endpoints (e.g. `fetch('/api/events')` before the page's `init…` function runs), or render the rows server-side.
- **Saving:** in `initEventForm`, `initBookingsPage` and `initCustomersPage`, the line after `checkValidity()` passes is where to call your endpoint (`fetch(form.action, { method: 'POST', … })`, or call `form.submit()` for a normal post).
- **Delete buttons** each carry `data-delete-id="<id>"` and already go through the confirmation modal; call your endpoint after `confirmDialog(...)` resolves true.

### 4.4 Data contract (taken from the existing forms and mock data)

| Entity | Field | Shape in the UI | Suggested Java type |
|---|---|---|---|
| **Event** | `id` | number | `Long` |
| | `name` | 3–100 chars | `String` |
| | `category` | one of 7 names (list in `mock-data.js`) | `String` / enum / table |
| | `dateTime` | ISO local, `2026-10-25T19:00` | `LocalDateTime` |
| | `venue` | one of 7 names (a **string**, not an id) | `String` / table |
| | `ticketPrice` | ≥ 0 (0 displays as "Free"), currency LKR | `BigDecimal` |
| | `capacity` | whole number ≥ 1 | `int` |
| | `status` | `UPCOMING` \| `ONGOING` \| `ENDED` | `enum` |
| | `description` | optional, ≤ 500 chars | `String` |
| **Customer** | `id` | number | `Long` |
| | `firstName`, `lastName` | 2–50 chars each | `String` |
| | `email` | valid, ≤ 100, **unique (case-insensitive)** | `String` |
| | `phone` | `0[0-9]{9}` | `String` |
| | `city` | ≤ 50 chars | `String` |
| | `joinedOn` | `2026-03-14` | `LocalDate` |
| **Booking** | `id` | number | `Long` |
| | `customerId`, `eventId` | ids | `Long` |
| | `quantity` | 1–10 | `int` |
| | `bookedOn` | ISO local date-time | `LocalDateTime` |
| | `status` | `CONFIRMED` \| `PENDING` \| `CANCELLED` | `enum` |

Field names the forms use when posted natively:
event → `id, name, category, description, eventDate, eventTime, venue, ticketPrice, capacity, status`
(note: **date and time are separate fields**, not `dateTime`);
customer → `id, firstName, lastName, email, phone, city`;
booking → `customerId, eventId, quantity`.

### 4.5 Things worth knowing before you wire it up

- **Re-validate on the server.** The rules above are enforced only in the browser (Bean Validation `@Size`, `@Pattern`, `@Min`, `@Max`, `@Email` map directly).
- **Booking total is display-only.** The UI computes price × quantity; compute it again server-side. The UI does not check remaining capacity either.
- **CSRF:** Spring Security enables it by default. Thymeleaf `th:action` forms get the token automatically; plain HTML forms and `fetch()` calls must send it (`_csrf` field or `X-CSRF-TOKEN` header), otherwise POSTs return 403.
- **Dates:** Spring Boot's default Jackson settings emit `LocalDateTime` as an ISO string, which `app.js` parses. If you enable `WRITE_DATES_AS_TIMESTAMPS` you get arrays and dates will show as "-".
- **IDs are treated as numbers** (`Number(id)` in `findById`). For UUID ids, change that helper.
- **"Today's Events"** currently counts events whose status is `ONGOING`, not events whose date is today; **"Active Events"** counts everything not `ENDED`. Change this if you want date-based logic from the server.
- **Security headers.** The original `next.config.mjs` set `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`. In Spring Security `nosniff` is on by default; the referrer policy can be added with
  `http.headers(h -> h.referrerPolicy(r -> r.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)))`.
- **Context path:** if you deploy under one (e.g. a WAR at `/eventtix`), the absolute form actions `/events/save` etc. will need that prefix. Relative asset paths are fine.

---

## 5. What changed from the uploaded Next.js project

**Key finding:** the uploaded project's real UI was *already* plain HTML + Bootstrap + vanilla JS in
`public/`. Its own `next.config.mjs` says so ("Next.js only serves those static files"). The React
layer was a shell: `app/page.tsx` only redirected to `/index.html`, `app/layout.tsx` only held
metadata, and the shadcn `Button` in `components/ui/` was never imported. So no UI was rewritten, which
is why the visual and behavioural fidelity is exact. The conversion was removing that wrapper.

| | |
|---|---|
| **Kept byte-for-byte** | all 5 HTML pages (apart from one `src`, below), `js/app.js`, `js/mock-data.js`, the logo |
| **Moved** | `images/eventtix-logo.png` → `assets/images/eventtix-logo.png` (the `<img src>` in each page was updated) |
| **Added (1 CSS rule)** | At the very end of `css/style.css`: `.table-responsive { position: relative; }`. See below. |
| **Removed** | Next.js, React, React DOM, Tailwind + `globals.css`, shadcn/Base UI, `lucide-react`, `package.json`, lockfiles, `tsconfig`, `postcss`, `app/`, `components/`, `lib/` |
| **Removed: Vercel Analytics** | `app/layout.tsx` loaded `@vercel/analytics` in production only. It is Vercel-specific and has no equivalent here. |
| **Left out: favicons** | `icon.svg`, `apple-icon.png`, `icon-*-32x32.png` are the **v0 logo**, not EventTix branding, and none of the HTML pages ever referenced them (only the Next layout did). Add your own `<link rel="icon">` when you have one. |
| **Left out: placeholders** | `placeholder*.png/jpg/svg` are v0 scaffolding, referenced by nothing. |

### The one deliberate deviation: a mobile overflow fix

On `events.html`, `bookings.html` and `customers.html` the original stretched the page far beyond the
screen on phones (layout width 1225 / 1150 / 1022 px instead of ~390 px), because Bootstrap's
`.visually-hidden` (used for the "Actions" column header) is `position: absolute` and escaped the table's
scroll container. The table itself scrolled correctly; the *page* did not fit. The one-line rule fixes it
with no visible change at any width. To restore the original behaviour exactly, delete the clearly
marked block at the end of `css/style.css`.

---

## 6. Using local Bootstrap instead of the CDN

Download Bootstrap 5.3.3 (`css/bootstrap.min.css`, `js/bootstrap.bundle.min.js`) and Bootstrap Icons
1.11.3 (`font/bootstrap-icons.min.css` plus its `fonts/` folder), place them under `assets/vendor/`, and
update the three CDN tags in the `<head>` / end of `<body>` of each page. In a Maven/Gradle project you can
use WebJars instead. The Inter font can be self-hosted the same way.

## 7. How this was verified

Tested in headless Chromium (Bootstrap and Bootstrap Icons served from local copies of the same versions,
since the CDN is unreachable from the test environment):

- **Visual:** the converted site was screenshot against the original `public/` site on all 5 pages (plus edit mode) at 1440, 820 and 390 px. All 18 renders are pixel-identical (the 6 renders on the three affected pages are identical once the original's inflated width is cropped).
- **Behaviour:** 96 scripted checks (every button, link, form, validation rule, modal, search, pagination, sidebar toggle, toast, deep link) pass on the converted site; the same suite on the original passes 93, failing only the 3 mobile-overflow checks above.
- **Integrity:** all 52 local references resolve; no React/Next/Tailwind references remain; pages work from `file://`.

**Not tested:** Safari, Firefox and real devices, and anything involving a Java server (none was available).
