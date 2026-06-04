const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const seedData = require('./seed-data.json');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'kula.db');
let db;

// ─── Relation Engine ─────────────────────────────────────────────────────────
// Path segments are edge-direction + type pairs.
// We resolve English and Nepali labels from path traversal.

function resolveRelation(path) {
  // path = array of { dir: 'up'|'down'|'across', type: 'parent'|'spouse'|'sibling'|'partner' }
  // We'll build a concise English description and best-effort Nepali/cultural term

  if (!path || path.length === 0) return { english: 'same person', nepali: 'आफैँ' };

  const steps = path;
  const len = steps.length;

  // Single step
  if (len === 1) {
    const s = steps[0];
    if (s.type === 'spouse') return { english: 'spouse', nepali: 'पति/पत्नी' };
    if (s.type === 'sibling') return { english: 'sibling', nepali: 'दाइ/दिदी/भाइ/बहिनी' };
    if (s.type === 'partner') return { english: 'partner', nepali: 'साथी' };
    if (s.dir === 'up') return { english: 'parent', nepali: 'आमा/बुबा' };
    if (s.dir === 'down') return { english: 'child', nepali: 'छोरा/छोरी' };
  }

  // Two steps
  if (len === 2) {
    const [a, b] = steps;
    // grandparent
    if (a.dir === 'up' && b.dir === 'up') return { english: 'grandparent', nepali: 'हजुरबुवा/हजुरआमा' };
    // grandchild
    if (a.dir === 'down' && b.dir === 'down') return { english: 'grandchild', nepali: 'नाति/नातिनी' };
    // parent's sibling
    if (a.dir === 'up' && b.type === 'sibling') return { english: "parent's sibling", nepali: 'काका/काकी/फुपू/मामा/माइजू' };
    // sibling's child
    if (a.type === 'sibling' && b.dir === 'down') return { english: "sibling's child", nepali: 'भतिजा/भतिजी' };
    // child's spouse
    if (a.dir === 'down' && b.type === 'spouse') return { english: "child's spouse", nepali: 'बुहारी/ज्वाइँ' };
    // spouse's parent
    if (a.type === 'spouse' && b.dir === 'up') return { english: "spouse's parent", nepali: 'सासू/ससुरा' };
    // spouse's sibling
    if (a.type === 'spouse' && b.type === 'sibling') return { english: "spouse's sibling", nepali: 'देवर/देवरानी/जेठाजु/ननद' };
    // sibling's spouse
    if (a.type === 'sibling' && b.type === 'spouse') return { english: "sibling's spouse", nepali: 'भाउजू/भिनाजु' };
    // parent's spouse (step-parent)
    if (a.dir === 'up' && b.type === 'spouse') return { english: 'step-parent', nepali: 'सौतेनी आमा/बुबा' };
  }

  // Three steps
  if (len === 3) {
    const [a, b, c] = steps;
    if (a.dir === 'up' && b.dir === 'up' && c.dir === 'up') return { english: 'great-grandparent', nepali: 'परहजुरबुवा/परहजुरआमा' };
    if (a.dir === 'down' && b.dir === 'down' && c.dir === 'down') return { english: 'great-grandchild', nepali: 'परनाति/परनातिनी' };
    if (a.dir === 'up' && b.dir === 'up' && c.type === 'sibling') return { english: "grandparent's sibling", nepali: 'ठूलो हजुरबुवा/हजुरआमा' };
    if (a.dir === 'up' && b.type === 'sibling' && c.dir === 'down') return { english: 'first cousin', nepali: 'दाजुभाइ/दिदीबहिनी (काका/मामाको छोरा-छोरी)' };
    if (a.dir === 'up' && b.type === 'sibling' && c.type === 'spouse') return { english: "parent's sibling's spouse", nepali: 'काकी/मामी/फुपाजु' };
    if (a.type === 'spouse' && b.dir === 'up' && c.type === 'sibling') return { english: "spouse's parent's sibling", nepali: 'ससुरापक्षका काका/काकी' };
    if (a.type === 'spouse' && b.dir === 'up' && c.dir === 'up') return { english: "spouse's grandparent", nepali: 'ससुरापक्षका हजुरबुवा/हजुरआमा' };
    if (a.dir === 'up' && b.type === 'spouse' && c.type === 'sibling') return { english: "parent's spouse's sibling", nepali: 'सौतेनी पक्षका भाइबहिनी' };
  }

  // Four steps
  if (len === 4) {
    const [a, b, c, d] = steps;
    if (a.dir === 'up' && b.dir === 'up' && c.type === 'sibling' && d.dir === 'down') {
      return { english: "grandparent's sibling's child", nepali: 'टाढाका काका/काकी' };
    }
    if (a.dir === 'up' && b.type === 'sibling' && c.dir === 'down' && d.type === 'spouse') {
      return { english: "first cousin's spouse", nepali: 'दाजुभाइको श्रीमती/श्रीमान' };
    }
    if (a.type === 'spouse' && b.dir === 'up' && c.type === 'sibling' && d.dir === 'down') {
      return { english: "spouse's first cousin", nepali: 'ससुरापक्षका भतिजा/भतिजी' };
    }
    if (a.dir === 'up' && b.dir === 'up' && c.type === 'sibling' && d.dir === 'down') {
      return { english: 'second cousin once removed', nepali: 'टाढाका नातेदार' };
    }
  }

  // Fallback: describe the path in plain English
  const desc = steps.map(s => {
    if (s.type === 'spouse') return "spouse";
    if (s.type === 'sibling') return "sibling";
    if (s.type === 'partner') return "partner";
    if (s.dir === 'up') return "parent";
    if (s.dir === 'down') return "child";
    return "relative";
  }).join("'s ");

  return {
    english: desc,
    nepali: `(${len}-चरणको नाता: ${desc})`
  };
}

// BFS on the graph to find shortest path between two persons
function findRelationPath(personAId, personBId) {
  if (personAId === personBId) return [];

  // Build adjacency from relationships
  const stmt = db.prepare('SELECT * FROM relationships');
  const edges = [];
  while (stmt.step()) edges.push(stmt.getAsObject());
  stmt.free();

  // Build undirected adjacency with edge metadata
  const adj = {}; // personId -> [{neighbor, edgeType, dir}]
  for (const e of edges) {
    if (!adj[e.person_a]) adj[e.person_a] = [];
    if (!adj[e.person_b]) adj[e.person_b] = [];

    if (e.type === 'parent') {
      // person_a IS parent of person_b
      adj[e.person_a].push({ neighbor: e.person_b, edgeType: 'parent', dir: 'down' }); // going from parent to child = down
      adj[e.person_b].push({ neighbor: e.person_a, edgeType: 'parent', dir: 'up' });   // going from child to parent = up
    } else if (e.type === 'spouse' || e.type === 'sibling' || e.type === 'partner') {
      adj[e.person_a].push({ neighbor: e.person_b, edgeType: e.type, dir: 'across' });
      adj[e.person_b].push({ neighbor: e.person_a, edgeType: e.type, dir: 'across' });
    }
  }

  // BFS
  const visited = new Set();
  const queue = [{ id: personAId, path: [] }];
  visited.add(personAId);

  while (queue.length > 0) {
    const { id, path } = queue.shift();
    const neighbors = adj[id] || [];
    for (const edge of neighbors) {
      if (visited.has(edge.neighbor)) continue;
      const newPath = [...path, { type: edge.edgeType, dir: edge.dir }];
      if (edge.neighbor === personBId) return newPath;
      visited.add(edge.neighbor);
      queue.push({ id: edge.neighbor, path: newPath });
    }
  }
  return null; // no connection
}

// ─── DB Init ─────────────────────────────────────────────────────────────────
async function initDB() {
  const SQL = await initSqlJs();
  db = new SQL.Database();

  db.run(`CREATE TABLE IF NOT EXISTS trees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS persons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dob TEXT,
    notes TEXT,
    contact TEXT,
    tree_id TEXT,
    FOREIGN KEY(tree_id) REFERENCES trees(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS relationships (
    id TEXT PRIMARY KEY,
    person_a TEXT NOT NULL,
    person_b TEXT NOT NULL,
    type TEXT NOT NULL,
    FOREIGN KEY(person_a) REFERENCES persons(id),
    FOREIGN KEY(person_b) REFERENCES persons(id)
  )`);

  // Seed
  for (const t of seedData.trees) {
    db.run('INSERT OR IGNORE INTO trees VALUES (?,?,?)', [t.id, t.name, t.description]);
  }
  for (const p of seedData.persons) {
    db.run('INSERT OR IGNORE INTO persons VALUES (?,?,?,?,?,?)',
      [p.id, p.name, p.dob || null, p.notes || '', p.contact || '', p.tree_id]);
  }
  for (const r of seedData.relationships) {
    const id = `rel-${r.person_a}-${r.person_b}`;
    db.run('INSERT OR IGNORE INTO relationships VALUES (?,?,?,?)',
      [id, r.person_a, r.person_b, r.type]);
  }

  console.log('Database initialized and seeded.');
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Trees
app.get('/api/trees', (req, res) => {
  const stmt = db.prepare('SELECT * FROM trees');
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  res.json(rows);
});

app.post('/api/trees', (req, res) => {
  const { name, description } = req.body;
  const id = 'tree-' + uuidv4().slice(0, 8);
  db.run('INSERT INTO trees VALUES (?,?,?)', [id, name, description || '']);
  res.json({ id, name, description });
});

// Persons
app.get('/api/trees/:treeId/persons', (req, res) => {
  const stmt = db.prepare('SELECT * FROM persons WHERE tree_id = ?');
  stmt.bind([req.params.treeId]);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  res.json(rows);
});

app.get('/api/persons', (req, res) => {
  const stmt = db.prepare('SELECT * FROM persons');
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  res.json(rows);
});

app.post('/api/persons', (req, res) => {
  const { name, dob, notes, contact, tree_id } = req.body;
  const id = 'p-' + uuidv4().slice(0, 8);
  db.run('INSERT INTO persons VALUES (?,?,?,?,?,?)',
    [id, name, dob || null, notes || '', contact || '', tree_id]);
  res.json({ id, name, dob, notes, contact, tree_id });
});

app.put('/api/persons/:id', (req, res) => {
  const { name, dob, notes, contact } = req.body;
  db.run('UPDATE persons SET name=?, dob=?, notes=?, contact=? WHERE id=?',
    [name, dob || null, notes || '', contact || '', req.params.id]);
  res.json({ success: true });
});

app.delete('/api/persons/:id', (req, res) => {
  db.run('DELETE FROM relationships WHERE person_a=? OR person_b=?',
    [req.params.id, req.params.id]);
  db.run('DELETE FROM persons WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

// Relationships
app.get('/api/relationships', (req, res) => {
  const { tree_id } = req.query;
  let rows = [];
  if (tree_id) {
    const stmt = db.prepare(`
      SELECT r.* FROM relationships r
      JOIN persons pa ON r.person_a = pa.id
      WHERE pa.tree_id = ?`);
    stmt.bind([tree_id]);
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
  } else {
    const stmt = db.prepare('SELECT * FROM relationships');
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
  }
  res.json(rows);
});

app.post('/api/relationships', (req, res) => {
  const { person_a, person_b, type } = req.body;
  const id = 'rel-' + uuidv4().slice(0, 8);
  db.run('INSERT INTO relationships VALUES (?,?,?,?)', [id, person_a, person_b, type]);
  res.json({ id, person_a, person_b, type });
});

app.delete('/api/relationships/:id', (req, res) => {
  db.run('DELETE FROM relationships WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

// Relation query — the star of the show
app.get('/api/relation', (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to required' });

  const path = findRelationPath(from, to);
  if (path === null) return res.json({ connected: false, path: [], label: null });

  const label = resolveRelation(path);
  res.json({ connected: true, path, label });
});

// Full graph for a tree (nodes + edges)
app.get('/api/graph/:treeId', (req, res) => {
  const pStmt = db.prepare('SELECT * FROM persons WHERE tree_id = ?');
  pStmt.bind([req.params.treeId]);
  const persons = [];
  while (pStmt.step()) persons.push(pStmt.getAsObject());
  pStmt.free();

  const ids = persons.map(p => `'${p.id}'`).join(',');
  if (!ids) return res.json({ nodes: [], edges: [] });

  const rStmt = db.prepare(`SELECT * FROM relationships WHERE person_a IN (${ids}) OR person_b IN (${ids})`);
  const rels = [];
  while (rStmt.step()) rels.push(rStmt.getAsObject());
  rStmt.free();

  res.json({ nodes: persons, edges: rels });
});

// Search persons by name
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  const stmt = db.prepare("SELECT * FROM persons WHERE name LIKE ? LIMIT 20");
  stmt.bind([`%${q}%`]);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  res.json(rows);
});

// ─── Start ────────────────────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(3001, () => console.log('Kula backend running on http://localhost:3001'));
});
