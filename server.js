const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'desi-ff-esports-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Database setup
const db = new sqlite3.Database('./esports.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  db.serialize(() => {
    // Admin users table
    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tournaments table
    db.run(`CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      mode TEXT NOT NULL,
      total_slots INTEGER NOT NULL,
      entry_fee REAL NOT NULL,
      prize_template TEXT NOT NULL,
      organizer_commission REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Players/Teams table
    db.run(`CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      team_name TEXT NOT NULL,
      whatsapp_number TEXT,
      ingame_id TEXT,
      payment_status TEXT DEFAULT 'pending',
      position INTEGER DEFAULT 0,
      prize_amount REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments (id)
    )`);

    // Prize templates table
    db.run(`CREATE TABLE IF NOT EXISTS prize_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      distribution TEXT NOT NULL,
      description TEXT
    )`);

    // Create default admin (username: admin, password: admin123)
    // WARNING: Change this password immediately in production
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
    db.run(`INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)`, 
      ['admin', hashedPassword]);

    // Create default prize templates
    const templates = [
      {
        name: '70-20-10',
        distribution: JSON.stringify({ 1: 70, 2: 20, 3: 10 }),
        description: '1st: 70%, 2nd: 20%, 3rd: 10%'
      },
      {
        name: '80-20',
        distribution: JSON.stringify({ 1: 80, 2: 20 }),
        description: '1st: 80%, 2nd: 20%'
      },
      {
        name: 'winner-takes-all',
        distribution: JSON.stringify({ 1: 100 }),
        description: '1st: 100%'
      },
      {
        name: '50-30-20',
        distribution: JSON.stringify({ 1: 50, 2: 30, 3: 20 }),
        description: '1st: 50%, 2nd: 30%, 3rd: 20%'
      }
    ];

    templates.forEach(template => {
      db.run(`INSERT OR IGNORE INTO prize_templates (name, distribution, description) VALUES (?, ?, ?)`,
        [template.name, template.distribution, template.description]);
    });
  });
}

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Routes

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.userId = admin.id;
    req.session.username = admin.username;
    res.json({ success: true, username: admin.username });
  });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true });
  });
});

// Check auth status
app.get('/api/auth-status', (req, res) => {
  if (req.session.userId) {
    res.json({ authenticated: true, username: req.session.username });
  } else {
    res.json({ authenticated: false });
  }
});

// Get prize templates
app.get('/api/templates', (req, res) => {
  db.all('SELECT * FROM prize_templates', [], (err, templates) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(templates.map(t => ({
      ...t,
      distribution: JSON.parse(t.distribution)
    })));
  });
});

// Create tournament
app.post('/api/tournaments', isAuthenticated, (req, res) => {
  const { name, mode, total_slots, entry_fee, prize_template, organizer_commission } = req.body;
  
  db.run(`INSERT INTO tournaments (name, mode, total_slots, entry_fee, prize_template, organizer_commission)
          VALUES (?, ?, ?, ?, ?, ?)`,
    [name, mode, total_slots, entry_fee, prize_template, organizer_commission || 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create tournament' });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Get all tournaments
app.get('/api/tournaments', isAuthenticated, (req, res) => {
  db.all('SELECT * FROM tournaments ORDER BY created_at DESC', [], (err, tournaments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(tournaments);
  });
});

// Get tournament details with participants
app.get('/api/tournaments/:id', isAuthenticated, (req, res) => {
  const tournamentId = req.params.id;
  
  db.get('SELECT * FROM tournaments WHERE id = ?', [tournamentId], (err, tournament) => {
    if (err || !tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    db.all('SELECT * FROM participants WHERE tournament_id = ?', [tournamentId], (err, participants) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const paidCount = participants.filter(p => p.payment_status === 'paid').length;
      const totalCollection = paidCount * tournament.entry_fee;
      const commission = (totalCollection * tournament.organizer_commission) / 100;
      const netPrizePool = totalCollection - commission;
      
      res.json({
        tournament,
        participants,
        stats: {
          totalSlots: tournament.total_slots,
          filledSlots: participants.length,
          paidSlots: paidCount,
          totalCollection,
          commission,
          netPrizePool
        }
      });
    });
  });
});

// Add participant to tournament
app.post('/api/tournaments/:id/participants', isAuthenticated, (req, res) => {
  const tournamentId = req.params.id;
  const { team_name, whatsapp_number, ingame_id, payment_status } = req.body;
  
  db.run(`INSERT INTO participants (tournament_id, team_name, whatsapp_number, ingame_id, payment_status)
          VALUES (?, ?, ?, ?, ?)`,
    [tournamentId, team_name, whatsapp_number, ingame_id, payment_status || 'pending'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add participant' });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Update participant payment status
app.put('/api/participants/:id', isAuthenticated, (req, res) => {
  const participantId = req.params.id;
  const { payment_status } = req.body;
  
  db.run('UPDATE participants SET payment_status = ? WHERE id = ?',
    [payment_status, participantId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update participant' });
      }
      res.json({ success: true });
    }
  );
});

// Delete participant
app.delete('/api/participants/:id', isAuthenticated, (req, res) => {
  const participantId = req.params.id;
  
  db.run('DELETE FROM participants WHERE id = ?', [participantId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete participant' });
    }
    res.json({ success: true });
  });
});

// Submit tournament results
app.post('/api/tournaments/:id/results', isAuthenticated, (req, res) => {
  const tournamentId = req.params.id;
  const { winners } = req.body; // Array of { participantId, position }
  
  db.get('SELECT * FROM tournaments WHERE id = ?', [tournamentId], (err, tournament) => {
    if (err || !tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    db.all('SELECT * FROM participants WHERE tournament_id = ? AND payment_status = "paid"',
      [tournamentId], (err, participants) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        const totalCollection = participants.length * tournament.entry_fee;
        const commission = (totalCollection * tournament.organizer_commission) / 100;
        const netPrizePool = totalCollection - commission;
        
        // Get prize distribution template
        db.get('SELECT * FROM prize_templates WHERE name = ?',
          [tournament.prize_template], (err, template) => {
            if (err || !template) {
              return res.status(404).json({ error: 'Prize template not found' });
            }
            
            const distribution = JSON.parse(template.distribution);
            
            // Update winners with their prize amounts
            const stmt = db.prepare('UPDATE participants SET position = ?, prize_amount = ? WHERE id = ?');
            
            winners.forEach(winner => {
              const prizePercentage = distribution[winner.position] || 0;
              const prizeAmount = (netPrizePool * prizePercentage) / 100;
              stmt.run([winner.position, prizeAmount, winner.participantId]);
            });
            
            stmt.finalize((err) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to update results' });
              }
              
              // Update tournament status
              db.run('UPDATE tournaments SET status = ? WHERE id = ?',
                ['completed', tournamentId], (err) => {
                  if (err) {
                    return res.status(500).json({ error: 'Failed to update tournament' });
                  }
                  res.json({ success: true });
                });
            });
          });
      });
  });
});

// Get tournament summary for sharing
app.get('/api/tournaments/:id/summary', isAuthenticated, (req, res) => {
  const tournamentId = req.params.id;
  
  db.get('SELECT * FROM tournaments WHERE id = ?', [tournamentId], (err, tournament) => {
    if (err || !tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    
    db.all('SELECT * FROM participants WHERE tournament_id = ? ORDER BY position ASC, team_name ASC',
      [tournamentId], (err, participants) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        const paidParticipants = participants.filter(p => p.payment_status === 'paid');
        const totalCollection = paidParticipants.length * tournament.entry_fee;
        const commission = (totalCollection * tournament.organizer_commission) / 100;
        const netPrizePool = totalCollection - commission;
        
        const winners = participants.filter(p => p.position > 0 && p.prize_amount > 0)
          .sort((a, b) => a.position - b.position);
        
        // Generate WhatsApp-friendly text
        let summary = `🏆 *${tournament.name}*\n`;
        summary += `━━━━━━━━━━━━━━━━━\n`;
        summary += `📊 Mode: ${tournament.mode}\n`;
        summary += `👥 Total Slots: ${tournament.total_slots}\n`;
        summary += `✅ Filled: ${participants.length}\n`;
        summary += `💰 Entry Fee: ₹${tournament.entry_fee}\n`;
        summary += `━━━━━━━━━━━━━━━━━\n`;
        summary += `💵 Total Collection: ₹${totalCollection.toFixed(2)}\n`;
        summary += `📉 Organizer Commission (${tournament.organizer_commission}%): ₹${commission.toFixed(2)}\n`;
        summary += `🎁 Net Prize Pool: ₹${netPrizePool.toFixed(2)}\n`;
        
        if (winners.length > 0) {
          summary += `━━━━━━━━━━━━━━━━━\n`;
          summary += `🏅 *WINNERS*\n`;
          winners.forEach(winner => {
            const medals = ['', '🥇', '🥈', '🥉'];
            const medal = medals[winner.position] || `#${winner.position}`;
            summary += `${medal} ${winner.team_name}: ₹${winner.prize_amount.toFixed(2)}\n`;
          });
        }
        
        summary += `━━━━━━━━━━━━━━━━━\n`;
        summary += `Powered by Desi FF eSports 🎮`;
        
        res.json({
          tournament,
          participants,
          winners,
          stats: {
            totalCollection,
            commission,
            netPrizePool,
            totalSlots: tournament.total_slots,
            filledSlots: participants.length,
            paidSlots: paidParticipants.length
          },
          whatsappSummary: summary
        });
      });
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Default login - Username: admin, Password: admin123');
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});
