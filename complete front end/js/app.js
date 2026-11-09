/*
 * EventTix – frontend interactions (vanilla JavaScript)
 * -----------------------------------------------------
 * This file only handles UI behaviour: navigation, search, pagination,
 * validation and confirmation dialogs. It does NOT save anything.
 * All business logic and file read/write belongs in the Spring Boot backend.
 */
(function () {
  "use strict";

  const mock = window.EventTixMock;

  // Working copies for this page view only. Reloading the page resets them.
  const store = {
    events: mock.events.map((item) => ({ ...item })),
    customers: mock.customers.map((item) => ({ ...item })),
    bookings: mock.bookings.map((item) => ({ ...item })),
  };

  const STATUS_STYLES = {
    ONGOING: { label: "Ongoing", tone: "success" },
    UPCOMING: { label: "Upcoming", tone: "info" },
    ENDED: { label: "Ended", tone: "danger" },
    CONFIRMED: { label: "Confirmed", tone: "success" },
    PENDING: { label: "Pending", tone: "info" },
    CANCELLED: { label: "Cancelled", tone: "danger" },
  };

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDateTime(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "-";
    const day = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return `${day}, ${time}`;
  }

  function formatDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  function formatPrice(amount) {
    const value = Number(amount) || 0;
    if (value === 0) return "Free";
    return `LKR ${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }

  function statusBadge(status) {
    const style = STATUS_STYLES[status] || { label: status, tone: "info" };
    return `<span class="status-badge status-badge--${style.tone}">${escapeHtml(style.label)}</span>`;
  }

  function matchesQuery(query, fields) {
    if (!query) return true;
    return fields.some((field) => String(field ?? "").toLowerCase().includes(query));
  }

  function findById(list, id) {
    return list.find((item) => item.id === Number(id));
  }

  function customerName(customer) {
    return customer ? `${customer.firstName} ${customer.lastName}` : "Unknown customer";
  }

  function nextId(list) {
    return list.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  }

  function emptyRow(colspan, message) {
    return `<tr><td colspan="${colspan}" class="empty-state"><i class="bi bi-inbox" aria-hidden="true"></i>${escapeHtml(message)}</td></tr>`;
  }

  /* ------------------------------------------------------------------
     Toasts and confirmation dialog
     ------------------------------------------------------------------ */
  function showToast(message, tone = "success") {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container position-fixed bottom-0 end-0 p-3";
      document.body.appendChild(container);
    }

    const icons = { success: "bi-check-circle-fill text-success", danger: "bi-x-circle-fill text-danger", info: "bi-info-circle-fill text-primary" };
    const toastEl = document.createElement("div");
    toastEl.className = "toast align-items-center border-0 shadow";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body d-flex align-items-start gap-2">
          <i class="bi ${icons[tone] || icons.info}" aria-hidden="true"></i>
          <span>${escapeHtml(message)}</span>
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`;
    container.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
    toast.show();
  }

  let confirmModal = null;

  function confirmDialog({ title, message, confirmText = "Delete", tone = "danger" }) {
    if (!confirmModal) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="confirmModalTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header border-0 pb-0">
                <h2 class="modal-title" id="confirmModalTitle"></h2>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body pt-2" id="confirmModalBody"></div>
              <div class="modal-footer border-0 pt-0">
                <button type="button" class="btn btn-et-outline" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn rounded-pill px-4 fw-semibold" id="confirmModalOk"></button>
              </div>
            </div>
          </div>
        </div>`;
      document.body.appendChild(wrapper.firstElementChild);
      confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));
    }

    document.getElementById("confirmModalTitle").textContent = title;
    document.getElementById("confirmModalBody").textContent = message;
    const okButton = document.getElementById("confirmModalOk");
    okButton.textContent = confirmText;
    okButton.className = `btn rounded-pill px-4 fw-semibold btn-${tone}`;

    return new Promise((resolve) => {
      const modalEl = document.getElementById("confirmModal");
      let confirmed = false;
      const onOk = () => {
        confirmed = true;
        confirmModal.hide();
      };
      const onHidden = () => {
        okButton.removeEventListener("click", onOk);
        modalEl.removeEventListener("hidden.bs.modal", onHidden);
        resolve(confirmed);
      };
      okButton.addEventListener("click", onOk);
      modalEl.addEventListener("hidden.bs.modal", onHidden);
      confirmModal.show();
    });
  }

  /* ------------------------------------------------------------------
     Pagination + paginated table
     ------------------------------------------------------------------ */
  function pageItems(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set([1, total, current - 1, current, current + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
    const items = [];
    sorted.forEach((page, index) => {
      if (index > 0 && page - sorted[index - 1] > 1) items.push("...");
      items.push(page);
    });
    return items;
  }

  function renderPagination(list, current, total, onChange) {
    if (!list) return;
    if (total <= 1) {
      list.innerHTML = "";
      return;
    }

    const parts = [`<li><button type="button" class="page-nav" data-page="${current - 1}" ${current === 1 ? "disabled" : ""} aria-label="Previous page">Prev</button></li>`];
    pageItems(current, total).forEach((item) => {
      if (item === "...") {
        parts.push('<li><button type="button" class="page-ellipsis" tabindex="-1" aria-hidden="true">...</button></li>');
      } else {
        const active = item === current;
        parts.push(`<li><button type="button" data-page="${item}" class="${active ? "active" : ""}" ${active ? 'aria-current="page"' : ""} aria-label="Page ${item}">${item}</button></li>`);
      }
    });
    parts.push(`<li><button type="button" class="page-nav" data-page="${current + 1}" ${current === total ? "disabled" : ""} aria-label="Next page">Next</button></li>`);
    list.innerHTML = parts.join("");

    list.onclick = (event) => {
      const button = event.target.closest("button[data-page]");
      if (!button || button.disabled) return;
      onChange(Number(button.dataset.page));
    };
  }

  function createTable({ tbody, pagination, getRows, filter, renderRow, pageSize, colspan, emptyMessage, noMatchMessage }) {
    let query = "";
    let page = 1;

    function render() {
      const filtered = getRows().filter((row) => filter(row, query));
      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      page = Math.min(page, totalPages);

      const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
      if (visible.length === 0) {
        tbody.innerHTML = emptyRow(colspan, query ? noMatchMessage || `No results match "${query}".` : emptyMessage);
      } else {
        tbody.innerHTML = visible.map(renderRow).join("");
      }

      if (pagination) {
        renderPagination(pagination, page, filtered.length ? totalPages : 0, (next) => {
          page = next;
          render();
        });
      }
    }

    return {
      render,
      setQuery(value) {
        query = value.trim().toLowerCase();
        page = 1;
        render();
      },
    };
  }

  function bindSearch(table) {
    const input = document.getElementById("globalSearch");
    if (!input || !table) return;
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) {
      input.value = initial;
      table.setQuery(initial);
    }
    input.addEventListener("input", () => table.setQuery(input.value));
  }

  /* ------------------------------------------------------------------
     Shared layout behaviour
     ------------------------------------------------------------------ */
  function initSidebar() {
    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("sidebarToggle");
    const backdrop = document.getElementById("sidebarBackdrop");
    if (!sidebar || !toggle || !backdrop) return;

    const setOpen = (open) => {
      sidebar.classList.toggle("is-open", open);
      backdrop.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => setOpen(!sidebar.classList.contains("is-open")));
    backdrop.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  function initGreeting() {
    const el = document.querySelector("[data-greeting]");
    if (!el) return;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
    el.textContent = `${greeting}!`;
  }

  function initShellActions() {
    document.querySelectorAll('[data-action="logout"]').forEach((link) => {
      link.addEventListener("click", async (event) => {
        event.preventDefault();
        const ok = await confirmDialog({
          title: "Log out?",
          message: "You will be signed out of EventTix. (Login is handled by the backend and is not connected yet.)",
          confirmText: "Log Out",
          tone: "primary",
        });
        if (ok) showToast("Log out will work once Spring Boot authentication is connected.", "info");
      });
    });

    document.querySelectorAll('[data-action="settings"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        showToast("Settings are not part of this frontend demo.", "info");
      });
    });
  }

  function initSummaryCards() {
    const counts = {
      total: store.events.length,
      active: store.events.filter((e) => e.status !== "ENDED").length,
      today: store.events.filter((e) => e.status === "ONGOING").length,
    };
    document.querySelectorAll("[data-stat]").forEach((el) => {
      el.textContent = counts[el.dataset.stat] ?? 0;
    });
  }

  /* ------------------------------------------------------------------
     Row templates
     ------------------------------------------------------------------ */
  function eventRow(event, { actions = true } = {}) {
    const name = escapeHtml(event.name);
    return `
      <tr>
        <td class="cell-strong">${name}</td>
        <td>${escapeHtml(event.category)}</td>
        <td>${formatDateTime(event.dateTime)}</td>
        <td>${escapeHtml(event.venue)}</td>
        <td>${formatPrice(event.ticketPrice)}</td>
        <td>${statusBadge(event.status)}</td>
        ${
          actions
            ? `<td class="col-actions">
                <a class="action-btn action-btn--edit" href="event-form.html?id=${event.id}" aria-label="Edit ${name}" title="Edit"><i class="bi bi-pencil-square" aria-hidden="true"></i></a>
                <button type="button" class="action-btn action-btn--delete" data-delete-id="${event.id}" aria-label="Delete ${name}" title="Delete"><i class="bi bi-trash3-fill" aria-hidden="true"></i></button>
              </td>`
            : ""
        }
      </tr>`;
  }

  function eventFilter(event, query) {
    return matchesQuery(query, [event.name, event.category, event.venue, STATUS_STYLES[event.status]?.label, formatDateTime(event.dateTime)]);
  }

  function bindEventDelete(tbody, table) {
    tbody.addEventListener("click", async (e) => {
      const button = e.target.closest("[data-delete-id]");
      if (!button) return;
      const event = findById(store.events, button.dataset.deleteId);
      if (!event) return;
      const ok = await confirmDialog({
        title: "Delete event?",
        message: `"${event.name}" will be removed from this list. This demo does not delete it permanently.`,
      });
      if (!ok) return;
      store.events = store.events.filter((item) => item.id !== event.id);
      table.render();
      initSummaryCards();
      showToast(`"${event.name}" removed (demo only, not saved).`);
    });
  }

  /* ------------------------------------------------------------------
     Pages
     ------------------------------------------------------------------ */
  function initDashboard() {
    initSummaryCards();

    const tbody = document.getElementById("recentEventsBody");
    const table = createTable({
      tbody,
      pagination: null,
      getRows: () => [...store.events].filter((e) => e.status !== "ENDED").sort((a, b) => a.dateTime.localeCompare(b.dateTime)),
      filter: eventFilter,
      renderRow: (event) => eventRow(event, { actions: false }),
      pageSize: 7,
      colspan: 6,
      emptyMessage: "No upcoming or ongoing events yet.",
    });
    table.render();
    bindSearch(table);

    const list = document.getElementById("recentBookingsList");
    const recent = [...store.bookings].sort((a, b) => b.bookedOn.localeCompare(a.bookedOn)).slice(0, 6);
    list.innerHTML = recent.length
      ? recent
          .map((booking) => {
            const customer = findById(store.customers, booking.customerId);
            const event = findById(store.events, booking.eventId);
            const initials = customer ? customer.firstName[0] + customer.lastName[0] : "?";
            return `
              <li class="activity-item">
                <span class="activity-avatar" aria-hidden="true">${escapeHtml(initials)}</span>
                <span class="activity-body">
                  <span class="activity-title">${escapeHtml(customerName(customer))}</span>
                  <span class="activity-meta">${escapeHtml(event ? event.name : "Unknown event")} &middot; ${booking.quantity} ticket${booking.quantity > 1 ? "s" : ""}</span>
                </span>
                <span class="activity-amount">${formatPrice((event?.ticketPrice || 0) * booking.quantity)}</span>
              </li>`;
          })
          .join("")
      : '<li class="empty-state"><i class="bi bi-inbox" aria-hidden="true"></i>No bookings yet.</li>';
  }

  function initEventsPage() {
    initSummaryCards();

    const tbody = document.getElementById("eventsTableBody");
    const table = createTable({
      tbody,
      pagination: document.getElementById("eventsPagination"),
      getRows: () => store.events,
      filter: eventFilter,
      renderRow: (event) => eventRow(event),
      pageSize: 9,
      colspan: 7,
      emptyMessage: "No events yet. Click \u201cAdd New\u201d to create one.",
    });
    table.render();
    bindSearch(table);
    bindEventDelete(tbody, table);
  }

  function fillSelect(select, options, placeholder) {
    select.innerHTML =
      `<option value="">${escapeHtml(placeholder)}</option>` +
      options.map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join("");
  }

  function initEventForm() {
    const form = document.getElementById("eventForm");
    fillSelect(form.elements.category, mock.categories.map((c) => ({ value: c, label: c })), "Select a category");
    fillSelect(form.elements.venue, mock.venues.map((v) => ({ value: v, label: v })), "Select a venue");

    const id = new URLSearchParams(window.location.search).get("id");
    const existing = id ? findById(store.events, id) : null;

    if (id && !existing) {
      showToast("That event could not be found. You can create a new one instead.", "danger");
    }

    if (existing) {
      document.querySelectorAll("[data-form-title]").forEach((el) => (el.textContent = "Edit Event"));
      document.getElementById("formSubtitle").textContent = `Update the details for "${existing.name}".`;
      document.getElementById("submitLabel").textContent = "Update Event";
      const [date, time] = existing.dateTime.split("T");
      form.elements.id.value = existing.id;
      form.elements.name.value = existing.name;
      form.elements.category.value = existing.category;
      form.elements.eventDate.value = date;
      form.elements.eventTime.value = time;
      form.elements.venue.value = existing.venue;
      form.elements.ticketPrice.value = existing.ticketPrice;
      form.elements.capacity.value = existing.capacity;
      form.elements.status.value = existing.status;
      form.elements.description.value = existing.description || "";
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.classList.add("was-validated");
      if (!form.checkValidity()) {
        form.querySelector(":invalid")?.focus();
        showToast("Please fix the highlighted fields.", "danger");
        return;
      }
      showToast(existing ? "Event details are valid. Connect the Spring Boot backend to save changes." : "Event details are valid. Connect the Spring Boot backend to save this event.", "info");
      setTimeout(() => (window.location.href = "events.html"), 1800);
    });

    form.addEventListener("reset", () => form.classList.remove("was-validated"));
  }

  function initBookingsPage() {
    const tbody = document.getElementById("bookingsTableBody");
    const table = createTable({
      tbody,
      pagination: document.getElementById("bookingsPagination"),
      getRows: () => [...store.bookings].sort((a, b) => b.bookedOn.localeCompare(a.bookedOn)),
      filter: (booking, query) => {
        const customer = findById(store.customers, booking.customerId);
        const event = findById(store.events, booking.eventId);
        return matchesQuery(query, [`#${booking.id}`, customerName(customer), event?.name, STATUS_STYLES[booking.status]?.label]);
      },
      renderRow: (booking) => {
        const customer = findById(store.customers, booking.customerId);
        const event = findById(store.events, booking.eventId);
        return `
          <tr>
            <td class="cell-strong">#${booking.id}</td>
            <td>${escapeHtml(customerName(customer))}</td>
            <td>${escapeHtml(event ? event.name : "Unknown event")}</td>
            <td>${booking.quantity}</td>
            <td>${formatPrice((event?.ticketPrice || 0) * booking.quantity)}</td>
            <td>${formatDateTime(booking.bookedOn)}</td>
            <td>${statusBadge(booking.status)}</td>
            <td class="col-actions">
              <button type="button" class="action-btn action-btn--delete" data-delete-id="${booking.id}" aria-label="Delete booking #${booking.id}" title="Delete"><i class="bi bi-trash3-fill" aria-hidden="true"></i></button>
            </td>
          </tr>`;
      },
      pageSize: 8,
      colspan: 8,
      emptyMessage: "No bookings yet. Use the form above to book tickets.",
    });
    table.render();
    bindSearch(table);

    tbody.addEventListener("click", async (e) => {
      const button = e.target.closest("[data-delete-id]");
      if (!button) return;
      const id = Number(button.dataset.deleteId);
      const ok = await confirmDialog({ title: "Delete booking?", message: `Booking #${id} will be removed from this list. This demo does not delete it permanently.` });
      if (!ok) return;
      store.bookings = store.bookings.filter((b) => b.id !== id);
      table.render();
      showToast(`Booking #${id} removed (demo only, not saved).`);
    });

    const form = document.getElementById("bookingForm");
    const bookableEvents = store.events.filter((e) => e.status !== "ENDED");
    fillSelect(form.elements.customerId, store.customers.map((c) => ({ value: c.id, label: customerName(c) })), "Select a customer");
    fillSelect(form.elements.eventId, bookableEvents.map((e) => ({ value: e.id, label: `${e.name} (${formatPrice(e.ticketPrice)})` })), "Select an event");

    const totalEl = document.getElementById("bookingTotal");
    const updateTotal = () => {
      const event = findById(store.events, form.elements.eventId.value);
      const quantity = Number(form.elements.quantity.value) || 0;
      totalEl.textContent = formatPrice(event ? event.ticketPrice * quantity : 0).replace("Free", "LKR 0");
    };
    form.elements.eventId.addEventListener("change", updateTotal);
    form.elements.quantity.addEventListener("input", updateTotal);
    updateTotal();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.classList.add("was-validated");
      if (!form.checkValidity()) {
        form.querySelector(":invalid")?.focus();
        return;
      }
      const booking = {
        id: Math.max(1000, ...store.bookings.map((b) => b.id)) + 1,
        customerId: Number(form.elements.customerId.value),
        eventId: Number(form.elements.eventId.value),
        quantity: Number(form.elements.quantity.value),
        bookedOn: new Date().toISOString().slice(0, 16),
        status: "CONFIRMED",
      };
      store.bookings.push(booking);
      table.render();
      form.reset();
      form.classList.remove("was-validated");
      updateTotal();
      showToast(`Booking #${booking.id} added to this list (demo only, not saved).`);
    });
  }

  function initCustomersPage() {
    const tbody = document.getElementById("customersTableBody");
    const bookingCount = (customerId) => store.bookings.filter((b) => b.customerId === customerId).length;

    const table = createTable({
      tbody,
      pagination: document.getElementById("customersPagination"),
      getRows: () => store.customers,
      filter: (c, query) => matchesQuery(query, [customerName(c), c.email, c.phone, c.city]),
      renderRow: (c) => {
        const name = escapeHtml(customerName(c));
        return `
          <tr>
            <td class="cell-strong">${name}</td>
            <td>${escapeHtml(c.email)}</td>
            <td>${escapeHtml(c.phone)}</td>
            <td>${escapeHtml(c.city)}</td>
            <td>${bookingCount(c.id)}</td>
            <td>${formatDate(c.joinedOn)}</td>
            <td class="col-actions">
              <button type="button" class="action-btn action-btn--edit" data-edit-id="${c.id}" aria-label="Edit ${name}" title="Edit"><i class="bi bi-pencil-square" aria-hidden="true"></i></button>
              <button type="button" class="action-btn action-btn--delete" data-delete-id="${c.id}" aria-label="Delete ${name}" title="Delete"><i class="bi bi-trash3-fill" aria-hidden="true"></i></button>
            </td>
          </tr>`;
      },
      pageSize: 9,
      colspan: 7,
      emptyMessage: "No customers yet. Click \u201cAdd Customer\u201d to create one.",
    });
    table.render();
    bindSearch(table);

    const modalEl = document.getElementById("customerModal");
    const modal = new bootstrap.Modal(modalEl);
    const form = document.getElementById("customerForm");
    const title = document.getElementById("customerModalTitle");

    function openForm(customer) {
      form.reset();
      form.classList.remove("was-validated");
      title.textContent = customer ? "Edit Customer" : "Add Customer";
      form.elements.id.value = customer ? customer.id : "";
      if (customer) {
        ["firstName", "lastName", "email", "phone", "city"].forEach((field) => (form.elements[field].value = customer[field]));
      }
      modal.show();
    }

    document.getElementById("addCustomerBtn").addEventListener("click", () => openForm(null));
    modalEl.addEventListener("shown.bs.modal", () => form.elements.firstName.focus());

    tbody.addEventListener("click", async (e) => {
      const editBtn = e.target.closest("[data-edit-id]");
      if (editBtn) {
        openForm(findById(store.customers, editBtn.dataset.editId));
        return;
      }
      const deleteBtn = e.target.closest("[data-delete-id]");
      if (!deleteBtn) return;
      const customer = findById(store.customers, deleteBtn.dataset.deleteId);
      if (!customer) return;
      const count = bookingCount(customer.id);
      const ok = await confirmDialog({
        title: "Delete customer?",
        message: `${customerName(customer)} will be removed from this list${count ? ` (they have ${count} booking${count > 1 ? "s" : ""})` : ""}. This demo does not delete it permanently.`,
      });
      if (!ok) return;
      store.customers = store.customers.filter((c) => c.id !== customer.id);
      table.render();
      showToast(`${customerName(customer)} removed (demo only, not saved).`);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailInput = form.elements.email;
      const id = Number(form.elements.id.value) || null;
      const duplicate = store.customers.some((c) => c.email.toLowerCase() === emailInput.value.trim().toLowerCase() && c.id !== id);
      emailInput.setCustomValidity(duplicate ? "duplicate" : "");
      document.getElementById("emailFeedback").textContent = duplicate ? "Another customer already uses this email." : "Enter a valid email address.";

      form.classList.add("was-validated");
      if (!form.checkValidity()) {
        form.querySelector(":invalid")?.focus();
        return;
      }

      const values = {};
      ["firstName", "lastName", "email", "phone", "city"].forEach((field) => (values[field] = form.elements[field].value.trim()));

      if (id) {
        Object.assign(findById(store.customers, id), values);
        showToast(`${values.firstName} ${values.lastName} updated (demo only, not saved).`);
      } else {
        store.customers.push({ id: nextId(store.customers), ...values, joinedOn: new Date().toISOString().slice(0, 10) });
        showToast(`${values.firstName} ${values.lastName} added (demo only, not saved).`);
      }
      table.render();
      modal.hide();
    });

    form.elements.email.addEventListener("input", () => form.elements.email.setCustomValidity(""));
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  const pages = {
    dashboard: initDashboard,
    events: initEventsPage,
    "event-form": initEventForm,
    bookings: initBookingsPage,
    customers: initCustomersPage,
  };

  document.addEventListener("DOMContentLoaded", () => {
    initSidebar();
    initGreeting();
    initShellActions();
    pages[document.body.dataset.page]?.();
  });
})();
