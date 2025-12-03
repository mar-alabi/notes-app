document.addEventListener("DOMContentLoaded", () => {
  // ============================================
  // 1. DOM ELEMENT REFERENCES
  // ============================================
  const noteTitle = document.getElementById("note-title");
  const noteContent = document.getElementById("note-content");
  const saveButton = document.getElementById("save-btn");
  const notesListDiv = document.getElementById("notes-list-div");
  const searchField = document.getElementById("search-note");
  const syncButton = document.getElementById("sync-btn");
  const syncMessage = document.getElementById("sync-message");

  // ============================================
  // 2. STATE VARIABLES
  // ============================================
  let notesArray = [];
  let currentEditingNoteId = null;

  // ============================================
  // 3. INITIALIZATION
  // ============================================
  loadFromLocalStorage();

  // ============================================
  //4.  CRUD OPERATIONS - Data Managements
  // ============================================

  /**
   * Creates a new note and saves to localStorage
   * Updates notesArray and re-renders notesList
   * @param {string} title
   * @param {string} content
   */
  function createNote(title, content) {
    const newNote = {
      id: crypto.randomUUID(),
      title: title,
      content: content,
      createdAt: Date.now(),
    };
    notesArray.push(newNote);
    saveToLocalStorage(notesArray);
    renderNotesList(notesArray);
  }

  /**
   * Loads an existing note into the form for editing
   * Switches UI to UPDATE mode
   * @param {string} id - The unique identifier of the note to edit
   */
  function loadNoteForEditing(id) {
    const noteToEdit = notesArray.find((note) => note.id === id);
    if (!noteToEdit) return;
    noteTitle.value = noteToEdit.title;
    noteContent.value = noteToEdit.content;
    currentEditingNoteId = id;
    saveButton.textContent = "Update";
  }

  /**
   * Allows user to edit note in UPDATE mode
   * Updates existing note with new information
   * Saves to localStorage and re-renders notesList
   *@param {string} id
   * @param {string} newTitle
   * @param {string} newContent
   */
  function updateExistingNote(id, newTitle, newContent) {
    // 1. Find the note in the array
    let noteToUpdate = notesArray.find((note) => note.id === id);
    if (!noteToUpdate) return;

    // 2. Update its properties with the NEW values
    noteToUpdate.title = newTitle; // Use newTitle
    noteToUpdate.content = newContent; // Use newContent

    // 3. Save to localStorage
    saveToLocalStorage(notesArray);

    // 4. Re-render
    renderNotesList(notesArray);

    // 5. Reset to CREATE mode
    currentEditingNoteId = null;
    saveButton.textContent = "Save";
  }

  /**
   * Deletes selected note from notesArray and localStorage
   * Re-renders the updated notesArray
   * @param {string} id
   * @returns
   */
  function deleteNote(id) {
    const userConfirmed = confirm("Are you sure you want to delete this note");
    if (!userConfirmed) {
      return;
    }
    notesArray = notesArray.filter((note) => note.id !== id);
    saveToLocalStorage(notesArray);
    renderNotesList(notesArray);
  }

  // ============================================
  // 5. LOCALSTORAGE OPERATIONS
  // ============================================

  /**
   * Loads existing notes from localStorage
   * Renders notes to UI
   */
  function loadFromLocalStorage() {
    let savedNotes = localStorage.getItem("notes");

    if (!savedNotes) {
      notesArray = [];
      renderNotesList(notesArray);
      return;
    }

    try {
      notesArray = JSON.parse(savedNotes) || [];
    } catch (e) {
      notesArray = [];
    }

    renderNotesList(notesArray);
  }

  /**
   * Saves new entries to localStorage
   * @param {object} notes
   */
  function saveToLocalStorage(notes) {
    let notesString = JSON.stringify(notes);
    localStorage.setItem("notes", notesString);
  }

  // ============================================
  // 6. UI/RENDERING FUNCTIONS
  // ============================================

  /**
   * Renders array of notes to UI
   * @param {Array} notes
   */

  function renderNotesList(notes) {
    notesListDiv.innerHTML = "";

    if (notes.length === 0) {
      notesListDiv.textContent = "No notes yet";
      return;
    }

    const notesList = document.createElement("ul");

    for (let note of notes) {
      const listItem = document.createElement("li");

      listItem.innerHTML = `
        <strong>${note.title}</strong>
        <p>${note.content.slice(0, 40)}...</p>
        <small>${new Date(note.createdAt).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })}</small>
      `;

      const actionDiv = document.createElement("div");
      actionDiv.className = "actions";

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.onclick = () => loadNoteForEditing(note.id);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.onclick = () => deleteNote(note.id);

      actionDiv.appendChild(editButton);
      actionDiv.appendChild(deleteButton);

      listItem.appendChild(actionDiv);
      notesList.appendChild(listItem);
    }

    notesListDiv.appendChild(notesList);
  }
  /**
   * Filters the array and renders notes that match user query to the UI
   * @param {string} userQuery
   */
  function searchNotes(userQuery) {
    userQuery = userQuery.toLowerCase();
    if (userQuery === "") {
      renderNotesList(notesArray);
    } else {
      const searchedArray = notesArray.filter(
        (note) =>
          note.title.toLowerCase().includes(userQuery) ||
          note.content.toLowerCase().includes(userQuery)
      );
      renderNotesList(searchedArray);
    }
  }
  // ============================================
  // 7. HELPER FUNCTIONS
  // ============================================
  /**
   * Clears input fields after saving or updating notes
   */
  function clearInputs() {
    noteTitle.value = "";
    noteContent.value = "";
    currentEditingNoteId = null;
    saveButton.textContent = "Save";
  }

  function handleSync() {
    syncButton.disabled = true;
    // 1. Update UI to show "Syncing..."
    syncMessage.textContent = "Syncing...";
    // 2. Call syncWithAPI(notesArray)
    syncWithAPI(notesArray)
      .then(() => {
        syncMessage.textContent = "Synced!";
        setTimeout(() => {
          syncMessage.textContent = "";
        }, 3000);
      })
      .catch((error) => {
        syncMessage.textContent = `Sync failed: ${error}`;
      })
      .finally(() => {
        syncButton.disabled = false; // Re-enable button
      });
  }

  function handleSave() {
    if (!noteTitle.value.trim() || !noteContent.value.trim()) {
      alert("Please fill in both fields");
      return;
    }
    if (currentEditingNoteId === null) {
      createNote(noteTitle.value, noteContent.value);
    } else {
      updateExistingNote(
        currentEditingNoteId,
        noteTitle.value,
        noteContent.value
      );
    }
  }
  // ============================================
  // 8. EVENT LISTENERS
  // ============================================

  /**
   * Handles save/update button click
   * Creates new note in CREATE mode or updates existing note in UPDATE mode
   */
  saveButton.addEventListener("click", (e) => {
    e.preventDefault();
    handleSave();
    //clear inputs after saving
    clearInputs();
  });

  /**
   * Handles user search
   *
   */
  searchField.addEventListener("input", () => {
    searchNotes(searchField.value);
  });

  noteContent.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
      //clear inputs after saving
      clearInputs();
    }
  });

  syncButton.addEventListener("click", (e) => {
    e.preventDefault();
    handleSync();
  });
  // ============================================
  // 9.API FUNCTIONS
  // ============================================

  /**
   * Simulates mock API for backend syncing
   * @param {*} notes
   * @returns
   */
  function syncWithAPI(notes) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate network delay (2 seconds)
        let syncValue = Math.random();
        // Simulate success 90% of the time, failure 10%
        // How would you generate a random number to decide this?

        if (syncValue < 0.1) {
          reject("Failure");
        } else {
          resolve({ Success: true, Notes: notes });
        }
      }, 2000); // 2 second delay
    });
  }
});
