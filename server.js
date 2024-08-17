const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "assets" directory inside "src"
app.use(express.static(path.join(__dirname, 'src/assets')));

// GET all notes
app.get('/api/notes', (req, res) => {
  const dbPath = path.join(__dirname, 'src/assets/db', 'db.json');
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading db.json:', err);
      return res.status(500).json({ error: 'Failed to read notes' });
    }
    try {
      const notes = JSON.parse(data);
      res.json(notes);
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      res.status(500).json({ error: 'Failed to parse notes' });
    }
  });
});

// Save a new note
app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  newNote.id = uuidv4(); // Assign unique ID

  const dbPath = path.join(__dirname, 'src/assets/db', 'db.json');
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading db.json:', err);
      return res.status(500).json({ error: 'Failed to save note' });
    }
    try {
      const notes = JSON.parse(data);
      notes.push(newNote);

      fs.writeFile(dbPath, JSON.stringify(notes, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Error writing to db.json:', writeErr);
          return res.status(500).json({ error: 'Failed to save note' });
        }
        res.json(newNote);
      });
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      res.status(500).json({ error: 'Failed to save note' });
    }
  });
});

// Delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  const dbPath = path.join(__dirname, 'src/assets/db', 'db.json');
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading db.json:', err);
      return res.status(500).json({ error: 'Failed to delete note' });
    }
    try {
      let notes = JSON.parse(data);
      notes = notes.filter(note => note.id !== noteId);

      fs.writeFile(dbPath, JSON.stringify(notes, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Error writing to db.json:', writeErr);
          return res.status(500).json({ error: 'Failed to delete note' });
        }
        res.json({ success: true });
      });
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      res.status(500).json({ error: 'Failed to delete note' });
    }
  });
});

// Return the notes.html file
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/assets/views/notes.html'));
});

// Handle all other requests, return index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/assets/views/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
