import React, { useState, useEffect } from 'react';
import api from './services/api';
import Header from './components/Header';
import UserInput from './components/UserInput';
import GraphViewer from './components/GraphViewer';
import PersonProfiles from './components/PersonProfiles';
import RelationshipQuery from './components/RelationshipQuery';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [persons, setPersons] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [activeTab, setActiveTab] = useState('graph');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Load all data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [personsRes, relationshipsRes] = await Promise.all([
        api.get('/api/persons'),
        api.get('/api/relationships'),
      ]);
      setPersons(personsRes.data);
      setRelationships(relationshipsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userName) => {
    const user = persons.find((p) => p.name === userName);
    setCurrentUser(user);
  };

  const handleAddPerson = async (name, dob, notes, contact) => {
    try {
      const createdBy = currentUser ? currentUser.name : 'guest';
      const response = await api.post('/api/persons', {
        name,
        dob,
        notes,
        contact,
        created_by: createdBy,
      });
      await loadAllData();
      return response.data;
    } catch (error) {
      console.error('Error adding person:', error);
      alert(error.response?.data?.error || 'Error adding person');
      return null;
    }
  };

  const handleAddRelationship = async (personAId, personBId, relationType, side) => {
    try {
      const createdBy = currentUser ? currentUser.name : 'guest';
      await api.post('/api/relationships', {
        person_a_id: personAId,
        person_b_id: personBId,
        relation_type: relationType,
        side,
        created_by: createdBy,
      });
      await loadAllData();
      return true;
    } catch (error) {
      console.error('Error adding relationship:', error);
      alert(error.response?.data?.error || 'Error adding relationship');
      return false;
    }
  };

  const handleDeletePerson = async (personId) => {
    if (window.confirm('Delete this person and all their relationships?')) {
      try {
        await api.delete(`/api/persons/${personId}`);
        await loadAllData();
      } catch (error) {
        console.error('Error deleting person:', error);
      }
    }
  };

  const handleDeleteRelationship = async (relationshipId) => {
    if (window.confirm('Delete this relationship?')) {
      try {
        await api.delete(`/api/relationships/${relationshipId}`);
        await loadAllData();
      } catch (error) {
        console.error('Error deleting relationship:', error);
      }
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Header />

        {!currentUser ? (
          <UserInput
            persons={persons}
            onUserSelect={handleUserSelect}
            onAddPerson={handleAddPerson}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* User Header */}
            <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800 text-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold">{currentUser.name}'s Family</h2>
                  <p className="text-blue-100 mt-1">Exploring your family tree</p>
                </div>
                <button
                  onClick={() => setCurrentUser(null)}
                  className="bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                >
                  Switch User
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow mb-6 overflow-hidden border border-gray-200 dark:border-slate-700">
              <div className="flex border-b border-gray-200 dark:border-slate-700">
                {['graph', 'relations', 'profiles'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 font-semibold transition text-center ${
                      activeTab === tab
                        ? 'bg-blue-500 dark:bg-blue-700 text-white'
                        : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tab === 'graph' && '📊 Graph View'}
                    {tab === 'relations' && '🔗 Find Relations'}
                    {tab === 'profiles' && '👥 All Members'}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                ) : (
                  <>
                    {activeTab === 'graph' && (
                      <div className="space-y-6">
                        <GraphViewer
                          persons={persons}
                          relationships={relationships}
                          currentUser={currentUser}
                          onDeletePerson={handleDeletePerson}
                          onDeleteRelationship={handleDeleteRelationship}
                        />
                      </div>
                    )}

                    {activeTab === 'relations' && (
                      <RelationshipQuery
                        persons={persons}
                        relationships={relationships}
                        currentUser={currentUser}
                        onAddRelationship={handleAddRelationship}
                        onAddPerson={handleAddPerson}
                      />
                    )}

                    {activeTab === 'profiles' && (
                      <PersonProfiles
                        persons={persons}
                        relationships={relationships}
                        currentUser={currentUser}
                        onDeletePerson={handleDeletePerson}
                        onDeleteRelationship={handleDeleteRelationship}
                        onAddRelationship={handleAddRelationship}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
