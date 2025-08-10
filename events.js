// events.js

let events = [];
let filteredEvents = [];
let currentPage = 1;
const pageSize = 5;
let currentSort = "dateAsc";

// Init function
const initEvents = async () => {
  try {
    const res = await fetch("data/events.json");
    const data = await res.json();

    events = data.sort((a, b) => new Date(a.date) - new Date(b.date));
    buildCategoryDropdown(events);
    filteredEvents = events;

    const sortSel = document.getElementById("sortSelect");
    if (sortSel) sortSel.value = currentSort;

    render();
  } catch (err) {
    console.error("Error loading events.json", err);
  }
};

// Format date
const formatDate = dateStr => {
  const date = new Date(dateStr);
  return date.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" });
};

// Booked events for current user
const getBookedEvents = () => {
  const session = JSON.parse(localStorage.getItem("session") || "null");
  if (!session || !session.email) return [];
  const registrations = JSON.parse(localStorage.getItem("eventRegistrations") || "{}");
  return registrations[session.email] || [];
};

// Create cards
const createEventCards = list => {
  if (list.length === 0) {
    document.getElementById("eventsContainer").innerHTML =
      `<div class="alert alert-warning text-center" role="alert">No events present.</div>`;
    return;
  }

  const bookedEvents = getBookedEvents();

  document.getElementById("eventsContainer").innerHTML = list.map(event => {
    const isBooked = bookedEvents.includes(event.id);
    const buttonHTML = isBooked
      ? `
        <div class="d-grid gap-2">
          <button class="btn btn-outline-secondary" disabled>Registered</button>
          <button class="btn btn-outline-danger" onclick="unregisterEvent(${event.id})">Cancel</button>
        </div>
      `
      : `<button class="btn btn-outline-success" onclick="registerEvent(${event.id})">Register</button>`;
    const shortDescription = event.description.split(" ").slice(0, 10).join(" ");

    return `
      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <div class="row align-items-center g-2">
            <div class="col-md-2">
              <img src="${event.image}" alt="${event.title}"
                   class="img-fluid rounded w-100"
                   style="height: 150px; object-fit: cover;">
            </div>
            <div class="col-md-8">
              <h5 class="card-title mb-1">${event.title}</h5>
              <p class="card-text mb-0">
                ${shortDescription}...<br />
                <a href="eventDetails.html?id=${event.id}">Read more</a>
              </p>
              <small class="text-muted d-block mt-2">
                <strong>Date:</strong> ${formatDate(event.date)}<br>
                <strong>Venue:</strong> ${event.venue}
              </small>
            </div>
            <div class="col-md-2 d-grid">
              ${buttonHTML}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
};

/* =============== Pagination + Sorting helpers =============== */
const render = () => {
  const sorted = sortList(filteredEvents);
  renderPage(sorted, currentPage);
};

const renderPage = (list, page) => {
  const total = list.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const safePage = Math.min(Math.max(page, 1), totalPages);
  currentPage = safePage;

  const start = (safePage - 1) * pageSize;
  const pageItems = list.slice(start, start + pageSize);

  createEventCards(pageItems);
  buildPagination(totalPages, safePage);
};

const buildPagination = (totalPages, page) => {
  const ul = document.getElementById("pagination");
  if (totalPages <= 1) {
    ul.innerHTML = "";
    return;
  }

  const pageBtn = (label, target, disabled = false, active = false) => `
    <li class="page-item ${disabled ? "disabled" : ""} ${active ? "active" : ""}">
      <a class="page-link" href="javascript:void(0)" onclick="${disabled ? "" : `goToPage(${target})`}">
        ${label}
      </a>
    </li>
  `;

  let html = pageBtn("«", page - 1, page === 1);

  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);

  for (let p = start; p <= end; p++) {
    html += pageBtn(String(p), p, false, p === page);
  }

  html += pageBtn("»", page + 1, page === totalPages);
  ul.innerHTML = html;
};

const goToPage = n => {
  currentPage = n;
  render();
};

/* ===================== Sorting ===================== */
const sortList = list => {
  const sorters = {
    dateAsc:  (a, b) => new Date(a.date) - new Date(b.date),
    dateDesc: (a, b) => new Date(b.date) - new Date(a.date),
    titleAsc: (a, b) => a.title.localeCompare(b.title),
    titleDesc:(a, b) => b.title.localeCompare(a.title),
  };
  return [...list].sort(sorters[currentSort] || sorters.dateAsc);
};

const applySort = () => {
  const sel = document.getElementById("sortSelect");
  currentSort = sel ? sel.value : "dateAsc";
  currentPage = 1;
  render();
};

/* ===================== Search + Filters ===================== */
const searchEvents = () => {
  const query = document.getElementById("searchInput").value.toLowerCase();
  filteredEvents = events.filter(event => event.title.toLowerCase().includes(query));
  currentPage = 1;
  render();
};

/* ---------- Category filters ---------- */
const buildCategoryDropdown = events => {
  const select = document.getElementById("categoryFilter");
  if (!select) return;

  const categories = [...new Set(events.map(e => e.category).filter(Boolean))].sort();
  select.length = 1; // keep the "All categories" option

  categories.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;            // e.g., tech, startup, ai, access, sec
    opt.textContent = c;
    select.appendChild(opt);
  });
};

const clearCategoryFilter = () => {
  const sel = document.getElementById("categoryFilter");
  if (sel) sel.value = "";
};

const applyCategoryFilters = () => {
  clearSearch();
  clearDateFilters();

  const selected = document.getElementById("categoryFilter")?.value || "";
  filteredEvents = selected ? events.filter(e => e.category === selected) : events;

  currentPage = 1;
  render();
};

/* ---------- Date range filter ---------- */
const clearDateFilters = () => {
  document.getElementById("dateFrom").value = "";
  document.getElementById("dateTo").value = "";
};

const applyDateFilters = () => {
  clearSearch();
  clearCategoryFilter();

  const fromValue = document.getElementById("dateFrom").value;
  const toValue = document.getElementById("dateTo").value;

  const fromDate = fromValue ? new Date(fromValue + "T00:00:00") : null;
  const toDate = toValue ? new Date(toValue + "T23:59:59.999") : null;

  filteredEvents = (fromDate || toDate)
    ? events.filter(event => {
        const eventDate = new Date(event.date);
        return (!fromDate || eventDate >= fromDate) &&
               (!toDate || eventDate <= toDate);
      })
    : events;

  currentPage = 1;
  render();
};

/* ---------- Reset ---------- */
const clearSearch = () => { document.getElementById("searchInput").value = ""; };

const resetFilters = () => {
  clearSearch();
  clearDateFilters();
  clearCategoryFilter();
  filteredEvents = events;
  currentPage = 1;
  render();
};

// Run on page load
initEvents();