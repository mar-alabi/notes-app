document.addEventListener("DOMContentLoaded", () => {
  // ============================================
  // 1. DOM ELEMENT REFERENCES
  // ============================================
  const noteTitle = document.getElementById("note-title");
  const noteContent = document.getElementById("note-content");
  const saveButton = document.getElementById("save-btn");
  const notesListDiv = document.getElementById("notes-list-div");

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
    let newNote = {
      id: Date.now().toString(),
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
    let noteToEdit = notesArray.find((note) => note.id === id);
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
    if (savedNotes === null) {
      notesListDiv.textContent = "No notes yet";
    } else {
      notesArray = JSON.parse(savedNotes);
      renderNotesList(notesArray);
    }
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
    let notesList = document.createElement("ul");
    notesListDiv.appendChild(notesList);

    for (let note of notes) {
      const listItem = document.createElement("li");
      const editButton = document.createElement("button");
      const deleteButton = document.createElement("button");
      editButton.textContent = "Edit";
      deleteButton.textContent = "Delete";

      editButton.onclick = () => {
        loadNoteForEditing(note.id);
      };
      deleteButton.onclick = () => {
        deleteNote(note.id);
      };
      listItem.textContent = note.title;
      listItem.appendChild(editButton);
      listItem.appendChild(deleteButton);
      notesList.appendChild(listItem);
    }
  }

  // ============================================
  // 7. HELPER FUNCTIONS
  // ============================================
  function clearInputs() {
    noteTitle.value = "";
    noteContent.value = "";
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
    if (currentEditingNoteId === null) {
      createNote(noteTitle.value, noteContent.value);
    } else {
      updateExistingNote(
        currentEditingNoteId,
        noteTitle.value,
        noteContent.value
      );
    }
    //clear inputs after saving
    clearInputs();
  });
});
