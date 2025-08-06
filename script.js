const video = document.getElementById("video");
const captureBtn = document.getElementById("captureBtn");
const noteInput = document.getElementById("noteInput");
const dateInput = document.getElementById("dateInput");
const journalGallery = document.getElementById("journalGallery");
const clearAllBtn = document.getElementById("clearAllBtn");

// Set today's date as default
dateInput.valueAsDate = new Date();

// Start webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Error accessing the webcam: ", err);
    alert("Could not access the webcam. Please ensure you have granted permission.");
  });

// Load saved entries on page load
window.onload = function() {
  loadEntries();
};

// Capture image & save with note
captureBtn.addEventListener("click", () => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = canvas.toDataURL("image/png");
  const note = noteInput.value.trim();
  const date = dateInput.value;
  const time = new Date().toLocaleTimeString(); // Get current time

  if (!note || !date) {
    alert("Please write a note and select a date before saving.");
    return;
  }

  const entry = { imageData, note, date, time, id: Date.now() }; // Add time to the entry object
  saveEntry(entry);
  noteInput.value = "";
  dateInput.valueAsDate = new Date();
});

// Save to localStorage
function saveEntry(entry) {
  let entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  entries.unshift(entry); // newest first
  localStorage.setItem("journalEntries", JSON.stringify(entries));
  displayEntries(entries);
}

// Display all entries
function displayEntries(entries) {
  journalGallery.innerHTML = "";
  entries.forEach(entry => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <img src="${entry.imageData}" />
      <div class="date-time">
        <span class="date">${entry.date}</span>
        <span class="time">${entry.time}</span>
      </div>
      <div class="note">${entry.note}</div>
      <div class="card-actions">
        <button class="edit-btn" data-id="${entry.id}">Edit</button>
        <button class="delete-btn" data-id="${entry.id}">Delete</button>
      </div>
    `;
    journalGallery.appendChild(card);
  });
}

// Load on page load
function loadEntries() {
  const entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  displayEntries(entries);
}

// Clear all entries functionality
clearAllBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all journal entries? This action cannot be undone.")) {
    localStorage.removeItem("journalEntries");
    journalGallery.innerHTML = "";
  }
});

// Edit and Delete functionality
journalGallery.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  let entries = JSON.parse(localStorage.getItem("journalEntries")) || [];
  const index = entries.findIndex(entry => entry.id === parseInt(id));
  if (index === -1) return;

  if (e.target.classList.contains("delete-btn")) {
    entries.splice(index, 1);
    localStorage.setItem("journalEntries", JSON.stringify(entries));
    displayEntries(entries);
  } else if (e.target.classList.contains("edit-btn")) {
    const card = e.target.closest(".entry-card");
    const currentNoteDiv = card.querySelector(".note");
    const currentNote = currentNoteDiv.textContent;

    currentNoteDiv.innerHTML = `<input type="text" class="edit-note-input" value="${currentNote}">`;

    e.target.textContent = "Save";
    e.target.classList.remove("edit-btn");
    e.target.classList.add("save-edit-btn");

    card.querySelector(".save-edit-btn").addEventListener("click", (saveEvent) => {
      const newNote = card.querySelector(".edit-note-input").value;
      entries[index].note = newNote;
      localStorage.setItem("journalEntries", JSON.stringify(entries));
      displayEntries(entries);
    });
  }
});