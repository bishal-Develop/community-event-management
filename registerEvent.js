// let events = []

// fetch("data/events.json")
//   .then(res => res.json())
//   .then(data => {
//     events = data.sort((a, b) => new Date(a.date) - new Date(b.date));
// });

const REGISTRATIONS_KEY = "eventRegistrations";

const getRegistrations = () =>
  JSON.parse(localStorage.getItem(REGISTRATIONS_KEY)) || {};

const saveRegistrations = (registrations) => {
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations));
};


const registerEvent = (id) => {
  const session = JSON.parse(localStorage.getItem("session"));
  console.log("session", session);
  if (!session || !session.email) {
    alert("You must be logged in to register for events.");
    window.location.href = "login.html";
    return;
  }

  const userEmail = session.email;
  const registrations = getRegistrations();

  if (!registrations[userEmail]) {
    registrations[userEmail] = [];
  }

  registrations[userEmail].push(id);
  saveRegistrations(registrations);

  if (typeof createEventCards === "function") {
    createEventCards(events);
  } else {
    window.location.reload();
    // After reload, scroll to bottom
    window.onload = () => {
        window.scrollTo(0, document.body.scrollHeight);
    };
  }
};

// Unregister function
const unregisterEvent = (id) => {
    const session = JSON.parse(localStorage.getItem("session"));
    if (!session || !session.email) {
      alert("You must be logged in to unregister from events.");
      window.location.href = "login.html";
      return;
    }
  
    const userEmail = session.email;
    const registrations = getRegistrations();
  
    if (!registrations[userEmail]) return;
  
    registrations[userEmail] = registrations[userEmail].filter(eventId => eventId !== id);
    saveRegistrations(registrations);
   
    if (typeof createEventCards === "function") {
        createEventCards(events);
      } else {
        window.location.reload();
        // After reload, scroll to bottom
        window.onload = () => {
            window.scrollTo(0, document.body.scrollHeight);
        };
      }
  };