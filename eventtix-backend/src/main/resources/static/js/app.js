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


async function loadEvents() {
    try {
        const response = await fetch("/api/events");

        if (!response.ok) {
            throw new Error("Failed to load events");
        }


        const events = await response.json();

        store.events = events.map(event => ({...event,id: event.eventId }));

        console.log("Database Events:", store.events);

        return true;

    } catch (error) {
        console.error("Error loading events:", error);
        showToast("Failed to load events from database", "danger");
        return false;
    }
}


async function loadSortedEvents() {
    try {
        const response = await fetch("/api/events/sorted-by-date");

        if (!response.ok) {
            throw new Error("Failed to load sorted events");
        }

        const events = await response.json();

        store.events = events.map(event => ({
            ...event,
            id: event.eventId
        }));

        console.log("Merge Sorted Events:", store.events);

        return true;

    } catch (error) {
        console.error("Merge Sort API Error:", error);
        showToast("Failed to load sorted events", "danger");
        return false;
    }
}



  const STATUS_STYLES = {
    Ongoing: { label: "Ongoing", tone: "success" },
    Upcoming : { label: "Upcoming", tone: "info" },
    Ended : { label: "Ended", tone: "danger" },
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
    document.querySelectorAll('[data-action="logout"]').forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        if (typeof logoutUser === "function") logoutUser();
        else window.location.href = "login.html";
      });
    });
    document.querySelectorAll('[data-action="settings"]').forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        window.location.href = "settings.html";
      });
    });
  }

  function initSummaryCards() {
    const counts = {
      total: store.events.length,
      active: store.events.filter((e) => ["upcoming", "ongoing"].includes(String(e.status || "").trim().toLowerCase())).length,
      today: store.events.filter(e => {
          const today = new Date().toLocaleDateString("en-CA");
          return e.dateTime?.slice(0, 10) === today;
      }).length,
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

    tbody.addEventListener("click", async (event) => {

        const deleteButton = event.target.closest("[data-delete-id]");

        if (!deleteButton) return;

        const eventId = deleteButton.dataset.deleteId;

        // Ask for confirmation
        const confirmed = window.confirm(
            "Are you sure you want to delete this event?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Failed to delete event");
            }

            // Remove deleted event from frontend array
            store.events = store.events.filter(
                event => String(event.id) !== String(eventId)
            );

            // Refresh events table
            table.render();

            // Update summary cards
            initSummaryCards();

            showToast("Event deleted successfully!");

        } catch (error) {
            console.error("Error deleting event:", error);
            showToast(error.message, "danger");
        }
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
      getRows: () => store.events.filter(
          event => ["upcoming", "ongoing"].includes(String(event.status || "").trim().toLowerCase())
      ),
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

    const venueList = document.getElementById("venueOptions");

        venueList.innerHTML = "";

        mock.venues.forEach((venue) => {
            const option = document.createElement("option");
            option.value = venue;
            venueList.appendChild(option);
        });

    const id = new URLSearchParams(window.location.search).get("id");

    if (id) {
        fetch(`/api/events/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Event not found");
                }
                return response.json();
            })
            .then(event => {
                console.log("Event to Edit:", event);
                document.querySelectorAll("[data-form-title]").forEach(
                                el => el.textContent = "Edit Event"
                            );

                            document.getElementById("formSubtitle").textContent =
                                `Update the details for "${event.name}".`;

                            document.getElementById("submitLabel").textContent =
                                "Update Event";

                            // Split date and time
                            const [date, time] = event.dateTime.split("T");

                            // Fill form fields
                            form.elements.id.value = event.eventId;
                            form.elements.name.value = event.name;
                            form.elements.category.value = event.category;
                            form.elements.eventDate.value = date;
                            form.elements.eventTime.value = time.slice(0, 5);
                            form.elements.venue.value = event.venue;
                            form.elements.ticketPrice.value = event.ticketPrice;
                            form.elements.capacity.value = event.capacity;
                            form.elements.status.value = event.status;
                            form.elements.description.value = event.description || "";
                        })
            .catch(error => {
                console.error("Error loading event:", error);
                showToast(error.message, "danger");
            });
    }

//    if (id && !existing) {
//      showToast("That event could not be found. You can create a new one instead.", "danger");
//    }
//
//    if (existing) {
//      document.querySelectorAll("[data-form-title]").forEach((el) => (el.textContent = "Edit Event"));
//      document.getElementById("formSubtitle").textContent = `Update the details for "${existing.name}".`;
//      document.getElementById("submitLabel").textContent = "Update Event";
//      const [date, time] = existing.dateTime.split("T");
//      form.elements.id.value = existing.id;
//      form.elements.name.value = existing.name;
//      form.elements.category.value = existing.category;
//      form.elements.eventDate.value = date;
//      form.elements.eventTime.value = time;
//      form.elements.venue.value = existing.venue;
//      form.elements.ticketPrice.value = existing.ticketPrice;
//      form.elements.capacity.value = existing.capacity;
//      form.elements.status.value = existing.status;
//      form.elements.description.value = existing.description || "";
//    }


form.addEventListener("submit", async (event) => {
    event.preventDefault();

    form.classList.add("was-validated");

    if (!form.checkValidity()) {
        form.querySelector(":invalid")?.focus();
        showToast("Please fix the highlighted fields.", "danger");
        return;
    }

    // Get form data
    const eventData = {
        name: form.elements.name.value.trim(),
        category: form.elements.category.value,
        dateTime: form.elements.eventDate.value + "T" + form.elements.eventTime.value,
        venue: form.elements.venue.value,
        ticketPrice: Number(form.elements.ticketPrice.value),
        capacity: Number(form.elements.capacity.value),
        status: form.elements.status.value,
        description: form.elements.description.value.trim()
    };

    // Check whether this is Create or Edit mode
    const isEdit = Boolean(id);

    const url = isEdit
        ? `/api/events/${id}`
        : "/api/events";

    const method = isEdit ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to save event");
        }

        showToast(
            isEdit
                ? "Event updated successfully!"
                : "Event created successfully!"
        );

        setTimeout(() => {
            window.location.href = "events.html";
        }, 1200);

    } catch (error) {
        console.error("Error saving event:", error);
        showToast(error.message, "danger");
    }
});

  }


async function initBookingsPage() {
  const tbody = document.getElementById("bookingsTableBody");
  const form = document.getElementById("bookingForm");

  // Read API errors
  async function bookingApi(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(
        data.message || `Request failed (HTTP ${response.status})`
      );
    }

    if (response.status === 204) return null;
    return response.json().catch(() => null);
  }

  // Load bookings from MySQL through Spring Boot
  async function loadBookings() {
    const bookings = await bookingApi("/api/bookings");
    store.bookings = bookings;
  }

  // Customer and Event IDs have different data types
  function getCustomer(id) {
    return store.customers.find(
      c => String(c.id) === String(id)
    );
  }

  function getEvent(id) {
    return store.events.find(
      e => String(e.id) === String(id)
    );
  }

  function getCustomerName(id) {
    const customer = getCustomer(id);
    return customer
      ? customer.name || customerName(customer)
      : String(id);
  }

  function getEventName(id) {
    return getEvent(id)?.name || String(id);
  }

  function bookingStatus(status) {
    const tones = {
      Confirmed: "success",
      Pending: "info",
      Cancelled: "danger"
    };

    return `<span class="status-badge status-badge--${
      tones[status] || "info"
    }">${escapeHtml(status)}</span>`;
  }

  const table = createTable({
    tbody,
    pagination: document.getElementById("bookingsPagination"),
    getRows: () => [...store.bookings].sort(
      (a, b) => String(b.bookedOn).localeCompare(
        String(a.bookedOn)
      )
    ),
    filter: (booking, query) => matchesQuery(query, [
      booking.bookingId,
      booking.customerId,
      getCustomerName(booking.customerId),
      getEventName(booking.eventId),
      booking.status
    ]),
    renderRow: booking => {
      const id = escapeHtml(booking.bookingId);

      return `
        <tr>
          <td class="cell-strong">${id}</td>
          <td>${escapeHtml(getCustomerName(booking.customerId))}</td>
          <td>${escapeHtml(getEventName(booking.eventId))}</td>
          <td>${booking.ticketQuantity}</td>
          <td>${formatPrice(booking.totalAmount)}</td>
          <td>${formatDateTime(booking.bookedOn)}</td>
          <td>${bookingStatus(booking.status)}</td>
          <td class="col-actions">
            <button type="button"
              class="action-btn action-btn--edit"
              data-edit-id="${id}" title="Edit">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button type="button"
              class="action-btn action-btn--delete"
              data-delete-id="${id}" title="Delete">
              <i class="bi bi-trash3-fill"></i>
            </button>
          </td>
        </tr>`;
    },
    pageSize: 8,
    colspan: 8,
    emptyMessage: "No bookings found."
  });

  // Populate dropdowns with database data
  const availableEvents = store.events.filter(
    e => !["Ended", "ENDED"].includes(e.status)
  );



  // Searchable dropdowns using existing HTML inputs

  function setupSearchablePicker({
    pickerId,
    searchId,
    hiddenId,
    suggestionsId,
    options
  }) {
    const picker = document.getElementById(pickerId);
    const search = document.getElementById(searchId);
    const hidden = document.getElementById(hiddenId);
    const suggestions = document.getElementById(suggestionsId);

    let activeIndex = -1;
    let visibleOptions = [];

    function close() {
      suggestions.classList.add("d-none");
      search.setAttribute("aria-expanded", "false");
      activeIndex = -1;
    }

    function selectOption(option) {
      hidden.value = String(option.value);
      search.value = option.label;
      search.setCustomValidity("");
      close();

      hidden.dispatchEvent(
        new Event("change", { bubbles: true })
      );
    }

    function render(query = "") {
      visibleOptions = options.filter(option =>
        option.label.toLowerCase().includes(query.toLowerCase()) ||
        String(option.value).toLowerCase().includes(query.toLowerCase())
      );

      suggestions.innerHTML = "";
      activeIndex = -1;

      if (visibleOptions.length === 0) {
        const empty = document.createElement("div");
        empty.className = "list-group-item text-muted";
        empty.textContent = "No matching results";
        suggestions.appendChild(empty);
      }

      visibleOptions.forEach((option, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className =
          "list-group-item list-group-item-action";
        button.setAttribute("role", "option");
        button.textContent = option.label;

        button.addEventListener("click", () => {
          selectOption(option);
        });

        suggestions.appendChild(button);
      });

      suggestions.classList.remove("d-none");
      search.setAttribute("aria-expanded", "true");
    }

    search.addEventListener("focus", () => {
      render(search.value);
    });

    search.addEventListener("input", () => {
      hidden.value = "";
      search.setCustomValidity("");
      hidden.dispatchEvent(
        new Event("change", { bubbles: true })
      );
      render(search.value);
    });

    search.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        close();
        return;
      }

      if (suggestions.classList.contains("d-none")) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        activeIndex = Math.min(
          activeIndex + 1,
          visibleOptions.length - 1
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
      } else if (event.key === "Enter") {
        event.preventDefault();

        if (visibleOptions.length > 0) {
          selectOption(
            visibleOptions[activeIndex >= 0 ? activeIndex : 0]
          );
        }
        return;
      } else {
        return;
      }

      const buttons = suggestions.querySelectorAll("button");

      buttons.forEach((button, index) => {
        button.classList.toggle(
          "active",
          index === activeIndex
        );
      });

      buttons[activeIndex]?.scrollIntoView({
        block: "nearest"
      });
    });

    document.addEventListener("click", event => {
      if (!picker.contains(event.target)) {
        close();
      }
    });

    form.addEventListener("reset", () => {
      search.value = "";
      hidden.value = "";
      search.setCustomValidity("");
      close();
    });

    return {
      validate() {
        const valid = hidden.value !== "";
        search.setCustomValidity(
          valid ? "" : "Please select an option from the list."
        );
        return valid;
      }
    };
  }

  const customerPicker = setupSearchablePicker({
    pickerId: "customerPicker",
    searchId: "customerSearch",
    hiddenId: "customerId",
    suggestionsId: "customerSuggestions",
    options: store.customers.map(c => ({
      value: c.id,
      label: `${c.name || customerName(c)} (${c.id})`
    }))
  });

  const eventPicker = setupSearchablePicker({
    pickerId: "eventPicker",
    searchId: "eventSearch",
    hiddenId: "eventId",
    suggestionsId: "eventSuggestions",
    options: availableEvents.map(e => ({
      value: e.id,
      label: `${e.name} (${formatPrice(e.ticketPrice)})`
    }))
  });



  // Calculate booking total preview
  const totalEl = document.getElementById("bookingTotal");

  function updateTotal() {
    const selectedEvent = getEvent(form.elements.eventId.value);
    const quantity = Number(form.elements.quantity.value) || 0;
    const total = selectedEvent
      ? Number(selectedEvent.ticketPrice) * quantity
      : 0;

    totalEl.textContent = formatPrice(total).replace("Free", "LKR 0");
  }

  form.elements.eventId.addEventListener("change", updateTotal);
  form.elements.quantity.addEventListener("input", updateTotal);
  updateTotal();

  // Create booking
  form.addEventListener("submit", async event => {
    event.preventDefault();

    customerPicker.validate();
    eventPicker.validate();

    form.classList.add("was-validated");



    if (!form.checkValidity()) {
      form.querySelector(":invalid")?.focus();
      return;
    }

    const bookingData = {
      customerId: form.elements.customerId.value,
      eventId: Number(form.elements.eventId.value),
      ticketQuantity: Number(form.elements.quantity.value)
    };

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;

    try {
      const created = await bookingApi("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      await loadBookings();
      table.render();

      form.reset();
      form.classList.remove("was-validated");
      updateTotal();

      showToast(
        `Booking ${created?.bookingId || ""} created successfully!`
      );
    } catch (error) {
      console.error("Create booking error:", error);
      showToast(error.message, "danger");
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Edit or delete booking
  tbody.addEventListener("click", async event => {
    const editBtn = event.target.closest("[data-edit-id]");
    const deleteBtn = event.target.closest("[data-delete-id]");

    if (editBtn) {
      const id = editBtn.dataset.editId;
      const booking = store.bookings.find(b => b.bookingId === id);
      if (!booking) return;

      const quantityText = prompt(
        "Enter ticket quantity:",
        booking.ticketQuantity
      );

      if (quantityText === null) return;

      const quantity = Number(quantityText);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        showToast("Enter a valid ticket quantity.", "danger");
        return;
      }

      const status = prompt(
        "Enter status: Confirmed, Pending or Cancelled",
        booking.status
      );

      if (status === null) return;

      if (!["Confirmed", "Pending", "Cancelled"].includes(status)) {
        showToast("Invalid booking status.", "danger");
        return;
      }

      editBtn.disabled = true;

      try {
        await bookingApi(
          `/api/bookings/${encodeURIComponent(id)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ticketQuantity: quantity,
              status: status
            })
          }
        );

        await loadBookings();
        table.render();
        showToast("Booking updated successfully!");
      } catch (error) {
        showToast(error.message, "danger");
      } finally {
        editBtn.disabled = false;
      }

      return;
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.deleteId;

      const confirmed = await confirmDialog({
        title: "Delete booking?",
        message: `Permanently delete booking ${id}?`
      });

      if (!confirmed) return;

      deleteBtn.disabled = true;

      try {
        await bookingApi(
          `/api/bookings/${encodeURIComponent(id)}`,
          { method: "DELETE" }
        );

        await loadBookings();
        table.render();
        showToast(`Booking ${id} deleted successfully!`);
      } catch (error) {
        showToast(error.message, "danger");
      } finally {
        deleteBtn.disabled = false;
      }
    }
  });

  // Initial database load
  try {
    await loadBookings();
    table.render();
    bindSearch(table);
  } catch (error) {
    console.error("Load bookings error:", error);
    showToast(error.message, "danger");
  }
}


  async function loadCustomers() {
    try {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to load customers (HTTP " + response.status + ")");
      const customers = await response.json();
      store.customers = customers.map(c => ({ ...c, id: String(c.id ?? c.customerId) }));
      return true;
    } catch (error) {
      console.error("Error loading customers:", error);
      store.customers = [];
      showToast(error.message, "danger");
      return false;
    }
  }

  async function customerApi(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Request failed (HTTP ${response.status})`);
    }
    if (response.status === 204) return null;
    return response.json().catch(() => null);
  }

  function initCustomersPage() {
    const tbody = document.getElementById("customersTableBody");
    const table = createTable({
      tbody,
      pagination: document.getElementById("customersPagination"),
      getRows: () => store.customers,
      filter: (c, query) => matchesQuery(query, [c.id, c.name, c.email, c.phone, c.city]),
      renderRow: (c) => {
        const name = escapeHtml(c.name);
        const id = escapeHtml(c.id);
        return `
          <tr>
            <td class="cell-strong">${name}</td>
            <td>${escapeHtml(c.email)}</td>
            <td>${escapeHtml(c.phone)}</td>
            <td>${escapeHtml(c.city)}</td>
            <td>${escapeHtml(c.bookings ?? 0)}</td>
            <td>${id}</td>
            <td class="col-actions">
              <button type="button" class="action-btn action-btn--edit" data-edit-id="${id}" aria-label="Edit ${name}" title="Edit"><i class="bi bi-pencil-square" aria-hidden="true"></i></button>
              <button type="button" class="action-btn action-btn--delete" data-delete-id="${id}" aria-label="Delete ${name}" title="Delete"><i class="bi bi-trash3-fill" aria-hidden="true"></i></button>
            </td>
          </tr>`;
      },
      pageSize: 9,
      colspan: 7,
      emptyMessage: "No customers yet. Click Add Customer to create one.",
    });
    table.render();
    bindSearch(table);

    const modalEl = document.getElementById("customerModal");
    const modal = new bootstrap.Modal(modalEl);
    const form = document.getElementById("customerForm");
    const title = document.getElementById("customerModalTitle");

    function openForm(customer) {
      form.reset();
      form.elements.email.setCustomValidity("");
      form.classList.remove("was-validated");
      title.textContent = customer ? "Edit Customer" : "Add Customer";
      form.elements.id.value = customer ? customer.id : "";
      if (customer) {
        const parts = String(customer.name || "").trim().split(/\s+/);
        form.elements.firstName.value = parts.shift() || "";
        form.elements.lastName.value = parts.join(" ");
        form.elements.email.value = customer.email || "";
        form.elements.phone.value = customer.phone || "";
        form.elements.city.value = customer.city || "";
      }
      modal.show();
    }

    document.getElementById("addCustomerBtn").addEventListener("click", () => openForm(null));
    modalEl.addEventListener("shown.bs.modal", () => form.elements.firstName.focus());

    tbody.addEventListener("click", async (e) => {
      const editBtn = e.target.closest("[data-edit-id]");
      if (editBtn) {
        const customer = store.customers.find(c => c.id === editBtn.dataset.editId);
        if (customer) openForm(customer);
        return;
      }
      const deleteBtn = e.target.closest("[data-delete-id]");
      if (!deleteBtn) return;
      const customer = store.customers.find(c => c.id === deleteBtn.dataset.deleteId);
      if (!customer) return;
      const ok = await confirmDialog({
        title: "Delete customer?",
        message: `Permanently delete ${customer.name} (${customer.id})? This will remove the customer from the database.`,
      });
      if (!ok) return;
      deleteBtn.disabled = true;
      try {
        await customerApi(`/api/customers/${encodeURIComponent(customer.id)}`, { method: "DELETE" });
        store.customers = store.customers.filter(c => c.id !== customer.id);
        table.render();
        showToast("Customer deleted successfully!");
      } catch (error) {
        deleteBtn.disabled = false;
        showToast(error.message, "danger");
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const id = form.elements.id.value; // B001, B047, etc. — never convert to Number
      const emailInput = form.elements.email;
      const email = emailInput.value.trim();
      const duplicate = store.customers.some(c =>
        String(c.email).toLowerCase() === email.toLowerCase() && c.id !== id
      );
      emailInput.setCustomValidity(duplicate ? "duplicate" : "");
      document.getElementById("emailFeedback").textContent = duplicate
        ? "Another customer already uses this email."
        : "Enter a valid email address.";

      form.classList.add("was-validated");
      if (!form.checkValidity()) {
        form.querySelector(":invalid")?.focus();
        return;
      }

      const name = `${form.elements.firstName.value.trim()} ${form.elements.lastName.value.trim()}`.trim();
      const oldCustomer = store.customers.find(c => c.id === id);
      const customerData = {
        name,
        email,
        phone: form.elements.phone.value.trim(),
        city: form.elements.city.value.trim(),
        bookings: id ? (oldCustomer?.bookings ?? 0) : 0,
      };
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      try {
        await customerApi(id ? `/api/customers/${encodeURIComponent(id)}` : "/api/customers", {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customerData),
        });
        modal.hide();
        showToast(id ? "Customer updated successfully!" : "Customer created successfully!");
        await loadCustomers();
        table.render();
      } catch (error) {
        console.error("Error saving customer:", error);
        showToast(error.message, "danger");
      } finally {
        submitButton.disabled = false;
      }
    });

    form.elements.email.addEventListener("input", () => form.elements.email.setCustomValidity(""));
  }

  // Shared helpers required by user management and settings pages.
  window.EventTixUI = { showToast, confirmDialog, escapeHtml };

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



document.addEventListener("DOMContentLoaded", async () => {
    initSidebar();
    initGreeting();
    initShellActions();

    const page = document.body.dataset.page;

    if (page === "customers") {
        if (!await loadCustomers()) return;
    }

    if (page === "events") {
        // Event Management: backend Java Merge Sort (date ascending).
        if (!await loadSortedEvents()) return;
    }

    if (page === "dashboard") {
        // Dashboard: regular API; show only upcoming and ongoing events.
        if (!await loadEvents()) return;
    }

    if (page === "bookings") {
        const [customersLoaded, eventsLoaded] = await Promise.all([
            loadCustomers(),
            loadEvents()
        ]);

        if (!customersLoaded || !eventsLoaded) return;
    }

    pages[page]?.();
});


})();


