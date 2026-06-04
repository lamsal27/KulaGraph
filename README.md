# KulaGraph 🌳

**Interactive visual graph for multiple connected family trees**

KulaGraph is a comprehensive family tree and relationship tracking application that combines a powerful backend with a modern React frontend for visualizing complex family connections.

## Features

### 🎯 Core Functionality
- **Multiple Family Trees**: Manage multiple independent family trees (e.g., different dynasties)
- **Interactive Graph Visualization**: D3.js-based interactive graph with draggable nodes
- **Relationship Management**: Create and track relationships (parent, spouse, sibling, partner)
- **Smart Relation Detection**: Finds relationship paths and labels them (e.g., "first cousin", "uncle")
- **Bilingual Support**: English and Nepali relationship labels
- **Person Management**: Add, edit, delete family members with notes and contact info
- **Advanced Search**: Find family members by name

### 📊 Backend (Node.js/Express)
- SQLite database with sql.js
- RESTful API with CORS support
- Graph traversal algorithm (BFS) for finding relationships
- Relation resolution with English and Nepali labels
- Comprehensive seed data (Mahabharata dynasty example)

### 💻 Frontend (React)
- Modern React 18 with hooks
- Interactive D3.js visualization
- Responsive Tailwind CSS design
- Multiple views: Graph, Members, Relations, Search
- Tree and person management
- Relationship querying and creation

## Project Structure

```
KulaGraph/
├── backend/
│   ├── server.js              # Express server with API routes
│   ├── seed-data.json         # Sample data (Mahabharata)
│   └── package.json           # Backend dependencies
└── frontend/
    ├── src/
    │   ├── components/        # React components
    │   ├── services/          # API client
    │   ├── App.js            # Main app component
    │   └── index.css          # Tailwind styles
    ├── public/
    ├── package.json           # Frontend dependencies
    └── .env.example           # Environment configuration
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Start the server:
   ```bash
   node server.js
   ```
   Server runs on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Create `.env` file (optional, defaults to localhost:3001):
   ```bash
   cp .env.example .env
   ```

3. Start development server:
   ```bash
   npm start
   ```
   App opens at `http://localhost:3000`

## API Endpoints

### Trees
- `GET /api/trees` - List all family trees
- `POST /api/trees` - Create a new tree

### Persons
- `GET /api/persons` - List all persons
- `GET /api/trees/:treeId/persons` - List persons in a tree
- `POST /api/persons` - Add a new person
- `PUT /api/persons/:id` - Update person details
- `DELETE /api/persons/:id` - Delete a person

### Relationships
- `GET /api/relationships` - List all relationships
- `POST /api/relationships` - Create a new relationship
- `DELETE /api/relationships/:id` - Delete a relationship

### Special
- `GET /api/relation?from=:personA&to=:personB` - Find relationship between two persons
- `GET /api/graph/:treeId` - Get graph data (nodes + edges) for visualization
- `GET /api/search?q=:query` - Search persons by name

## Relationship Types

- **parent**: Direct parent-child relationship
- **spouse**: Married/committed partner
- **sibling**: Brother or sister
- **partner**: Non-married partnership

## Data Model

### Tree
```json
{
  "id": "tree-unique",
  "name": "Dynasty Name",
  "description": "Description"
}
```

### Person
```json
{
  "id": "p-unique",
  "name": "Full Name",
  "dob": "YYYY-MM-DD",
  "notes": "Additional information",
  "contact": "Contact info",
  "tree_id": "tree-unique"
}
```

### Relationship
```json
{
  "id": "rel-unique",
  "person_a": "p-id-1",
  "person_b": "p-id-2",
  "type": "parent|spouse|sibling|partner"
}
```

## Sample Data

The backend comes with sample data from Hindu mythology (Mahabharata and Ramayana dynasties) including:
- Kuru Dynasty (Mahabharata)
- Raghu/Ikshvaku Dynasty (Ramayana)

## Key Algorithms

### Relation Finding (BFS)
The `findRelationPath()` function uses breadth-first search to find the shortest path between any two persons in the family tree.

### Relation Resolution
The `resolveRelation()` function converts a path of relationships into human-readable English and Nepali labels, supporting complex relations like "first cousin once removed".

## Technologies Used

### Backend
- **Express.js** - Web framework
- **sql.js** - In-memory SQLite database
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique ID generation

### Frontend
- **React 18** - UI framework
- **D3.js** - Data visualization
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Scripts** - Build tools

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001
```

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Database persistence with PostgreSQL
- [ ] Photo uploads for family members
- [ ] Export family tree as PDF/image
- [ ] Timeline view of events
- [ ] Mobile app version
- [ ] Real-time collaboration
- [ ] Advanced filtering and sorting
- [ ] Genealogical research features
- [ ] Integration with other genealogy sources

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Author

Developed by Lamsal27

---

**Made with ❤️ for exploring family connections** 🌳
