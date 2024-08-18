document.addEventListener('DOMContentLoaded', () => {
  const noteForm = document.querySelector('.note-form');
  const noteTitle = document.querySelector('.note-title');
  const noteText = document.querySelector('.note-textarea');
  const saveNoteBtn = document.querySelector('.save-note');
  const newNoteBtn = document.querySelector('.new-note');
  const clearBtn = document.querySelector('.clear-btn');
  const noteList = document.querySelector('#list-group');

  // Track the active note
  let activeNote = {};

  // Show an element
  const show = (elem) => {
    elem.style.display = 'inline';
  };

  // Hide an element
  const hide = (elem) => {
    elem.style.display = 'none';
  };

  // Fetch notes from the server
  const getNotes = () =>
    fetch('/api/notes')
      .then(response => response.json());

  // Save a new note to the server
  const saveNote = (note) =>
    fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(note)
    }).then(response => response.json());

  // Delete a note from the server
  const deleteNote = (id) =>
    fetch(`/api/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

  // Handle saving a note
  const handleNoteSave = () => {
    const newNote = {
      title: noteTitle.value,
      text: noteText.value
    };

    saveNote(newNote).then(() => {
      getAndRenderNotes();
      renderActiveNote();
    }).catch(error => {
      console.error('Error saving note:', error);
    });
  };

  // Handle deleting a note
  const handleNoteDelete = (e) => {
    e.stopPropagation();

    const noteId = JSON.parse(e.target.parentElement.getAttribute('data-note')).id;

    if (activeNote.id === noteId) {
      activeNote = {};
    }

    deleteNote(noteId).then(() => {
      getAndRenderNotes();
      renderActiveNote();
    }).catch(error => {
      console.error('Error deleting note:', error);
    });
  };

  // Handle viewing a note
  const handleNoteView = (e) => {
    e.preventDefault();
    activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
    renderActiveNote();
  };

  // Handle creating a new note
  const handleNewNoteView = () => {
    activeNote = {};
    show(clearBtn);
    renderActiveNote();
  };

  // Handle clearing the note
  const handleClearNote = () => {
    activeNote = {};
    renderActiveNote();
  };

  // Handle rendering the buttons based on input
  const handleRenderBtns = () => {
    if (!noteTitle.value.trim() && !noteText.value.trim()) {
      hide(saveNoteBtn);
      hide(clearBtn);
    } else if (!noteTitle.value.trim() || !noteText.value.trim()) {
      hide(saveNoteBtn);
      show(clearBtn);
    } else {
      show(saveNoteBtn);
      show(clearBtn);
    }
  };

  // Render the list of notes
  const renderNoteList = async (notes) => {
    noteList.innerHTML = '';

    const createLi = (text, delBtn = true) => {
      const liEl = document.createElement('li');
      liEl.classList.add('list-group-item');

      const spanEl = document.createElement('span');
      spanEl.classList.add('list-item-title');
      spanEl.innerText = text;
      spanEl.addEventListener('click', handleNoteView);

      liEl.append(spanEl);

      if (delBtn) {
        const delBtnEl = document.createElement('i');
        delBtnEl.classList.add(
          'fas',
          'fa-trash-alt',
          'float-right',
          'text-danger',
          'delete-note'
        );
        delBtnEl.addEventListener('click', handleNoteDelete);

        liEl.append(delBtnEl);
      }

      return liEl;
    };

    const noteListItems = [];

    if (notes.length === 0) {
      noteListItems.push(createLi('No saved Notes', false));
    } else {
      notes.forEach((note) => {
        const li = createLi(note.title);
        li.dataset.note = JSON.stringify(note);
        noteListItems.push(li);
      });
    }

    noteListItems.forEach((note) => noteList.append(note));
  };

  // Render the active note in the right-hand column
  const renderActiveNote = () => {
    hide(saveNoteBtn);
    hide(clearBtn);

    if (Object.keys(activeNote).length === 0) {
      noteTitle.value = '';
      noteText.value = '';
      show(clearBtn);
      show(saveNoteBtn);
      return;
    }

    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
    show(newNoteBtn);
  };

  // Fetch and render notes
  const getAndRenderNotes = () => getNotes().then(renderNoteList);

  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  clearBtn.addEventListener('click', handleClearNote);
  noteForm.addEventListener('input', handleRenderBtns);

  getAndRenderNotes();
});