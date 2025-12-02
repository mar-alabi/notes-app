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

  function renderNotesList(notes) {
    notesListDiv.innerHTML = "";
    let notesList = document.createElement("ul");
    notesListDiv.appendChild(notesList);

    for (let note of notes) {
      let listItem = document.createElement("li");

      listItem.textContent = note.title;
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
