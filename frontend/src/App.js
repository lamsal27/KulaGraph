import React, { useState, useEffect } from 'react';
import api from './services/api';
import TreeList from './components/TreeList';
import TreeViewer from './components/TreeViewer';
import PersonForm from './components/PersonForm';
import RelationshipViewer from './components/RelationshipViewer';
import PersonSearch from './components/PersonSearch';

function App() {
  const [trees, setTrees] = useState([]);
  const [selectedTree, setSelectedTree] = useState(null);
  const [persons, setPersons] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [activeTab, setActiveTab] = useState('graph');
  const [loading, setLoading] = useState(false);

  // Load trees on mount
  useEffect(() => {
    loadTrees();
  }, []);

  // Load persons and relationships when tree is selected
  useEffect(() => {
    if (selectedTree) {
      loadTreeData();
    }
  }, [selectedTree]);

  const loadTrees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/trees');
      setTrees(response.data);
      if (response.data.length > 0) {
        setSelectedTree(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading trees:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTreeData = async () => {
    try {
      setLoading(true);
      const [personsRes, relationshipsRes] = await Promise.all([
        api.get(`/api/trees/${selectedTree.id}/persons`),
        api.get('/api/relationships', { params: { tree_id: selectedTree.id } })
      ]);
      setPersons(personsRes.data);
      setRelationships(relationshipsRes.data);
    } catch (error) {
      console.error('Error loading tree data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTree = async (name, description) => {
    try {
      const response = await api.post('/api/trees', { name, description });
      await loadTrees();
      setSelectedTree(response.data);
    } catch (error) {
      console.error('Error creating tree:', error);
    }
  };

  const handleAddPerson = async (personData) => {
    try {
      await api.post('/api/persons', {
        ...personData,
        tree_id: selectedTree.id
      });
      await loadTreeData();
      setShowPersonForm(false);
    } catch (error) {
      console.error('Error adding person:', error);
    }
  };

  const handleDeletePerson = async (personId) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      try {
        await api.delete(`/api/persons/${personId}`);
        await loadTreeData();
      } catch (error) {
        console.error('Error deleting person:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">🌳 KulaGraph</h1>
          <p className="text-gray-600">Interactive Family Tree Tracker</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Family Trees</h2>
              <TreeList
                trees={trees}
                selectedTree={selectedTree}
                onSelectTree={setSelectedTree}
                onCreateTree={handleCreateTree}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedTree ? (
              <div className="bg-white rounded-lg shadow">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab('graph')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'graph'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      📊 Graph View
                    </button>
                    <button
                      onClick={() => setActiveTab('persons')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'persons'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      👥 Members
                    </button>
                    <button
                      onClick={() => setActiveTab('relations')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'relations'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      🔗 Relations
                    </button>
                    <button
                      onClick={() => setActiveTab('search')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'search'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      🔍 Search
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Loading...</p>
                    </div>
                  ) : (
                    <>
                      {activeTab === 'graph' && (
                        <div>
                          <div className="mb-4 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {selectedTree.name} - Family Tree
                            </h3>
                            <button
                              onClick={() => setShowPersonForm(true)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                              + Add Person
                            </button>
                          </div>
                          <TreeViewer
                            persons={persons}
                            relationships={relationships}
                            treeId={selectedTree.id}
                            onDeletePerson={handleDeletePerson}
                          />
                        </div>
                      )}

                      {activeTab === 'persons' && (
                        <div>
                          <div className="mb-4 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Family Members</h3>
                            <button
                              onClick={() => setShowPersonForm(true)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                              + Add Person
                            </button>
                          </div>
                          <div className="space-y-2">
                            {persons.length === 0 ? (
                              <p className="text-gray-500">No family members yet. Add one to get started!</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {persons.map((person) => (
                                  <div key={person.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                    <h4 className="font-semibold text-gray-900">{person.name}</h4>
                                    {person.dob && <p className="text-sm text-gray-500">📅 {person.dob}</p>}
                                    {person.notes && <p className="text-sm text-gray-600 mt-2">{person.notes}</p>}
                                    {person.contact && <p className="text-sm text-gray-500">📞 {person.contact}</p>}
                                    <button
                                      onClick={() => handleDeletePerson(person.id)}
                                      className="mt-3 text-red-600 hover:text-red-700 text-sm"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === 'relations' && (
                        <RelationshipViewer
                          persons={persons}
                          relationships={relationships}
                          treeId={selectedTree.id}
                          onRelationshipAdded={loadTreeData}
                        />
                      )}

                      {activeTab === 'search' && (
                        <PersonSearch persons={persons} />
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No family trees yet. Create one to get started!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Person Form Modal */}
      {showPersonForm && selectedTree && (
        <PersonForm
          onSubmit={handleAddPerson}
          onCancel={() => setShowPersonForm(false)}
        />
      )}
    </div>
  );
}

export default App;
