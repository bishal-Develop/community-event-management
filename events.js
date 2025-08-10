// events.js
let events = []

// Fetch Data From JSON
fetch("data/events.json")
  .then(res => res.json())
  .then(data => {
    events = data.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Fire createEventCards function on page load
  createEventCards(events);

  // Build Venue Filters from all events
  buildVenueDropdown(events)
});

// Function to format date nicely
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" });
}
  
// Function to create cards from events array
function createEventCards(events) {
  if(events.length === 0){
    document.getElementById("eventsContainer").innerHTML = `<div class="alert alert-warning text-center" role="alert">
      No events present.
    </div>`
    return;
  }
  document.getElementById("eventsContainer").innerHTML = events.map(event => `
    <div class="card shadow-sm mb-3">
      <div class="card-body">
        <div class="row align-items-center g-2">
          
          <!-- First column: Event image -->
          <div class="col-md-2">
            <img src="${event.image}" alt="${event.title}" class="img-fluid rounded">
          </div>

          <!-- Second column: Title + Description -->
          <div class="col-md-8">
            <h5 class="card-title mb-1">${event.title}</h5>
            <p class="card-text mb-0">${event.description}</p>
            <small class="text-muted d-block mt-2">
              <strong>Date:</strong> ${formatDate(event.date)}<br>
              <strong>Venue:</strong> ${event.venue}
            </small>
          </div>

          <!-- Third column: Register button -->
          <div class="col-md-2 d-grid">
            <a class="btn btn-success" href="#">Register</a>
          </div>

        </div>
      </div>
    </div>
  `).join("");
}


// Search Events
function searchEvents() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  
  const filtered = events.filter(event => {
    return (
      event.title.toLowerCase().includes(query)
    );
  });
  createEventCards(filtered); // this should already be defined in events.js
}

// Filters
// Venue Filter
// Build dropdown options from unique venues in events
function buildVenueDropdown(events) {
  const select = document.getElementById("venueFilter");
  const venues = events.map(e => e.venue).sort();

  // Reset options (keep first "All venues")
  select.length = 1;

  venues.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

// Clear Search
const clearSearch = () => {
  // Clear Search
  document.getElementById("searchInput").value = "";
}

// Clear Venue Filters
const clearVenueFilter = () => {
  document.getElementById("venueFilter").value = ""
}

// Clear Date Filters
const clearDateFilters = () => {
  document.getElementById("dateFrom").value = ""
  document.getElementById("dateTo").value = ""
}

// Reset all the filters
const resetFilters = () => {
  clearSearch()
  clearDateFilters()
  clearVenueFilter()

  createEventCards(events)
}

// Filter by Venues
function applyVenueFilters() {
  // Clear Search and  other filters
  clearSearch()
  clearDateFilters()

  const venueFilter = document.getElementById("venueFilter");

  const selectedVenue = venueFilter?.value || "";

  // Start from full list
  let result = events;
  // Venue filter
  if (selectedVenue) {
    result = result.filter(e => e.venue === selectedVenue);
  }

  createEventCards(result);
}

// Filter by From and To Date
const applyDateFilters = () => {
  // Clear Search and other filters
  clearSearch()
  clearVenueFilter()

  const fromValue = document.getElementById("dateFrom").value;
  const toValue = document.getElementById("dateTo").value;

  const fromDate = fromValue ? new Date(fromValue + "T00:00:00") : null;
  const toDate = toValue ? new Date(toValue + "T23:59:59.999") : null;

  let filtered = events;

  // Filter by range if either date is set
  if (fromDate || toDate) {
    filtered = events.filter(event => {
      const eventDate = new Date(event.date);
      return (!fromDate || eventDate >= fromDate) &&
             (!toDate || eventDate <= toDate);
    });
  }

  createEventCards(filtered);
};