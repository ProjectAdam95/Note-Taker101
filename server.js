const express = require('express'); // Import the Express.js framework
const fs = require('fs'); // Import the File System module to handle file operations
const path = require('path'); // Import the Path module for handling and transforming file paths
const { v4: uuidv4 } = require('uuid'); // Import the UUID module for generating unique IDs

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve the notes.html file
app.get('/notes', (req, res) => {
  console.log('Serving notes.html');
  res.sendFile(path.join(__dirname, 'notes.html'));
});

// Handle API requests for getting notes
app.get('/api/notes', (req, res) => {
  const dbPath = path.join(__dirname, 'src', 'assets', 'db', 'db.json'); // Path to db.json
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

// Handle API requests for saving a new note
app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  newNote.id = uuidv4(); // Assign unique ID

  const dbPath = path.join(__dirname, 'src', 'assets', 'db', 'db.json'); // Path to db.json
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

// Handle API requests for deleting a note
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  const dbPath = path.join(__dirname, 'src', 'assets', 'db', 'db.json'); // Path to db.json
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

// Handle all other requests and return index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Serve index.html for all other routes
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});