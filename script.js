document.addEventListener("DOMContentLoaded", () => {
  const noteTitle = document.getElementById("note-title");
  const noteContent = document.getElementById("note-content");
  const saveButton = document.getElementById("save-btn");
  const notesListDiv = document.getElementById("notes-list-div");

  // array to store all the notes
  let notesArray = [];
  loadFromLocalStorage();
  function loadFromLocalStorage() {
    let savedNotes = localStorage.getItem("notes");
    if (savedNotes === null) {
      notesListDiv.textContent = "No notes yet";
    } else {
      notesArray = JSON.parse(savedNotes);
      renderNotesList(notesArray);
    }
  }

  function deleteNote(id) {
    const userConfirmed = confirm("Are you sure you want to delete this note");
    if (!userConfirmed) {
      return;
    }
    notesArray = notesArray.filter((note) => note.id !== id);
    saveToLocalStorage(notesArray);
    renderNotesList(notesArray);
  }
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
        updateNote(note.id, note.title, note.content);
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

  //create a new note
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

  function saveToLocalStorage(notes) {
    let notesString = JSON.stringify(notes);
    localStorage.setItem("notes", notesString);
  }

  // save new note
  saveButton.addEventListener("click", (e) => {
    e.preventDefault();
    createNote(noteTitle.value, noteContent.value);
    //clear inputs after saving
    clearInputs();
  });

  function clearInputs() {
    noteTitle.value = "";
    noteContent.value = "";
  }
});
