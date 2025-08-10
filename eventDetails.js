// eventDetails.js
// Populates the details page using only getElementById + innerText/innerHTML

// 1) Read id from URL
const params = new URLSearchParams(location.search);
const eventId = parseInt(params.get("id"), 10);

// 2) Target elements
const titleEl = document.getElementById("eventTitle");
const dateEl = document.getElementById("eventDate");
const venueEl = document.getElementById("eventVenue");
const descEl = document.getElementById("eventDescription");
const imgBox = document.getElementById("imageContainer");
const mapBox = document.getElementById("mapContainer");
const actionBox = document.getElementById("actionContainer");
const container = document.getElementById("eventDetailsContainer"); // optional if you add one

// Booked events for current user
const getBookedEvents = () => {
    const session = JSON.parse(localStorage.getItem("session") || "null");
    if (!session || !session.email) return [];
    const registrations = JSON.parse(localStorage.getItem("eventRegistrations") || "{}");
    return registrations[session.email] || [];
  };

// 3) Fetch events and render one
fetch("data/events.json")
  .then(r => r.json())
  .then(list => {
    const event = list.find(e => e.id === eventId);

    if (!event) {
      // Fallback: show simple not-found state using innerHTML
      titleEl.innerText = "Event not found";
      dateEl.innerText = "";
      venueEl.innerText = "";
      descEl.innerText = "";
      imgBox.innerHTML = "";
      mapBox.innerHTML = "";
      actionBox.innerHTML = `
        <div class="alert alert-danger mb-0">We couldn't find that event.</div>
      `;
      return;
    }

    // Fill basic text fields
    titleEl.innerText = event.title;
    dateEl.innerText = new Date(event.date).toLocaleString("en-AU", { dateStyle: "full", timeStyle: "short" });
    venueEl.innerText = event.venue;
    descEl.innerText = event.description;

    // Image via innerHTML
    imgBox.innerHTML = `
      <img src="${event.image}" alt="${event.title}" class="img-fluid rounded shadow">
    `;

    // Map via innerHTML
    mapBox.innerHTML = `
      <div class="ratio ratio-16x9">
        <iframe src="${event.embeddedMap}" style="border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    `;

    // Action button via innerHTML (hooks into your existing registerEvent if present)
    const bookedEvents = getBookedEvents()
    const isBooked = bookedEvents.includes(event.id);
    const buttonHTML = isBooked
        ? `
            <div class="d-grid gap-2">
            <button class="btn btn-outline-secondary" disabled>Registered</button>
            <button class="btn btn-outline-danger" onclick="unregisterEvent(${event.id})">Cancel</button>
            </div>
        `
        : `<button class="btn btn-outline-success" onclick="registerEvent(${event.id})">Register</button>`;
    actionBox.innerHTML = buttonHTML;
  });