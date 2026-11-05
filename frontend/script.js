/* =========================================================
   LabMate AI – script.js
   Sections: 1 Data · 2 Elements · 3 Navbar · 4 Lists
             5 Subject cards · 6 Search + validation
             7 Stats counter · 8 Start-up
   ========================================================= */


/* ---------- 1. DATA ---------- */

// Sample experiments for each subject card.
// Keys must match the data-subject values in index.html.
const EXPERIMENTS = {
  electronics: ["Study of Ohm's Law", "Verification of Kirchhoff's Laws", "Half-Wave and Full-Wave Rectifier", "Transistor as a Switch"],
  cs:          ["Implementation of Linked List", "Binary Search Tree Operations", "Dijkstra's Shortest Path", "SQL Joins and Queries"],
  physics:     ["Newton's Rings", "Verification of Hooke's Law", "Diffraction Grating", "Study of Simple Pendulum"],
  chemistry:   ["Acid-Base Titration", "Estimation of Water Hardness", "Determination of Viscosity", "Conductometric Titration"],
  mechanical:  ["Verification of Bernoulli's Theorem", "Tensile Test on Mild Steel", "Viscosity of Oil (Redwood)", "Study of Four-Stroke Engine"]
};

// Readable names, used for the list heading after a card is selected
const SUBJECT_NAMES = {
  electronics: "Electronics & Electrical",
  cs: "Computer Science",
  physics: "Physics",
  chemistry: "Chemistry",
  mechanical: "Mechanical Engineering"
};

// Shown when no subject card is selected
const DEFAULT_POPULAR = ["Study of Ohm's Law", "Acid-Base Titration", "Binary Search Tree Operations", "Newton's Rings"];

const EMPTY_RECENT_TEXT = "Nothing yet. Generate a guide and it will show up here.";

// Recent searches live in memory only, so they reset when the page refreshes.
// (To keep them, you could save them with localStorage later.)
let recent = [];


/* ---------- 2. ELEMENTS ----------
   Grab each HTML element once, then reuse the variable. */
const form        = document.getElementById("search-form");
const input       = document.getElementById("experiment");
const button      = document.getElementById("generate-btn");
const errorMsg    = document.getElementById("error-msg");
const result      = document.getElementById("result");
const popularList = document.getElementById("popular-list");
const recentList  = document.getElementById("recent-list");
const navbar      = document.getElementById("navbar");
const menu        = document.getElementById("nav-menu");
const toggle      = document.getElementById("menu-toggle");


/* ---------- 3. NAVBAR ---------- */

// Add a shadow to the navbar once the page has been scrolled a little
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 10);
});

// Hamburger button: open/close the mobile menu
toggle.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", isOpen); // tells screen readers the state
});

// Close the mobile menu after a link is clicked.
// (Smooth scrolling itself is handled by CSS: scroll-behavior: smooth)
menu.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });
});

// Highlight the nav link for whichever section is currently on screen
const navLinks = [...menu.querySelectorAll(".nav-link")];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
    });
  });
}, { rootMargin: "-40% 0px -55% 0px" }); // only counts a section when it's near the screen middle

["home", "guides", "about", "experiments"].forEach(id => {
  sectionObserver.observe(document.getElementById(id));
});


/* ---------- 4. LISTS (popular + recent) ---------- */

// Draw a list of experiment names as clickable rows.
// If there are no items, show a friendly empty message instead.
function renderList(listEl, items, emptyText) {
  listEl.innerHTML = "";

  if (items.length === 0) {
    listEl.innerHTML = `<li class="empty">${emptyText}</li>`;
    return;
  }

  items.forEach(name => {
    const li  = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = `<span></span><i class="fa-solid fa-arrow-up-right-from-square"></i>`;
    btn.firstChild.textContent = name; // textContent (not innerHTML) keeps text safe from HTML injection
    btn.addEventListener("click", () => fillSearch(name));
    li.appendChild(btn);
    listEl.appendChild(li);
  });
}

// Put an experiment name into the search box and scroll back up to it
function fillSearch(name) {
  input.value = name;
  clearError();
  document.getElementById("home").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => input.focus({ preventScroll: true }), 500); // wait for the scroll to finish
}

// Fill the popular list. Pass a subject key, or null for the default list.
function showPopular(subjectKey) {
  const title = document.getElementById("popular-title");
  title.textContent = subjectKey ? SUBJECT_NAMES[subjectKey] + " experiments" : "Popular lab experiments";
  renderList(popularList, subjectKey ? EXPERIMENTS[subjectKey] : DEFAULT_POPULAR, "No experiments yet.");
}


/* ---------- 5. SUBJECT CARDS ---------- */

const subjectCards = document.querySelectorAll(".subject");

subjectCards.forEach(card => {
  card.addEventListener("click", () => {
    const wasSelected = card.classList.contains("selected");

    // Only one card can be selected at a time
    subjectCards.forEach(c => c.classList.remove("selected"));

    // Clicking the selected card again clears the choice
    if (wasSelected) {
      showPopular(null);
      return;
    }

    card.classList.add("selected");
    showPopular(card.dataset.subject); // dataset.subject reads data-subject="..."
    document.getElementById("experiments").scrollIntoView({ behavior: "smooth" });
  });
});


/* ---------- 6. SEARCH + VALIDATION ---------- */

// Show an error message and shake the search bar
function showError(message) {
  errorMsg.textContent = message;
  form.classList.remove("invalid");
  void form.offsetWidth;            // forces a reflow so the shake animation can replay
  form.classList.add("invalid");
}

function clearError() {
  errorMsg.textContent = "";
  form.classList.remove("invalid");
}

// Remove the error as soon as the user starts typing again
input.addEventListener("input", clearError);

// Runs when the user clicks "Generate Lab Guide" or presses Enter
form.addEventListener("submit", event => {
  event.preventDefault();           // stop the page from reloading
  const value = input.value.trim(); // trim() removes spaces at the start/end

  // Basic input validation. Each check stops here with a message if it fails.
  if (value.length === 0)        return showError("Enter an experiment name to continue.");
  if (value.length < 3)          return showError("Experiment name must be at least 3 characters.");
  if (!/[a-zA-Z]/.test(value))   return showError("Experiment name should contain letters.");
  if (value.length > 100)        return showError("Keep the experiment name under 100 characters.");

  clearError();
  result.classList.remove("show");
  button.classList.add("loading");  // shows the spinner

  // TEMPORARY: a fake delay to show the loading state.
  // No AI request is made yet. Replace this block with a real API call later.
  setTimeout(() => {
    button.classList.remove("loading");
    addRecent(value);

    result.innerHTML = "";
    const name = document.createElement("strong");
    name.textContent = value;
    result.append(name, " is saved to your recent experiments. AI guide generation isn't connected yet, so no guide was created. This is a placeholder.");
    result.classList.add("show");
  }, 1600);
});

// Add a search to the top of the recent list (no duplicates, max 5)
function addRecent(name) {
  const others = recent.filter(item => item.toLowerCase() !== name.toLowerCase());
  recent = [name, ...others].slice(0, 5);
  renderList(recentList, recent, EMPTY_RECENT_TEXT);
}


/* ---------- 7. STATS COUNTER ----------
   Numbers count up from 0 the first time they scroll into view. */
const statsSection = document.querySelector(".stats");

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    entry.target.querySelectorAll("[data-count]").forEach(el => {
      const target = Number(el.dataset.count); // the number in data-count="..."
      const startTime = performance.now();

      // Runs every animation frame for 1.2 seconds
      function tick(now) {
        const progress = Math.min((now - startTime) / 1200, 1); // goes from 0 to 1
        const value = Math.round(target * progress).toLocaleString();
        el.textContent = value + (progress === 1 && target > 100 ? "+" : ""); // adds "+" to big numbers at the end
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });

    statsObserver.unobserve(entry.target); // run only once
  });
}, { threshold: 0.4 });

statsObserver.observe(statsSection);


/* ---------- 8. START-UP ----------
   Fill both lists when the page first loads. */
showPopular(null);
renderList(recentList, [], EMPTY_RECENT_TEXT);