import React, { useState } from 'react';
import api from '../services/api';

function RelationshipQuery({ persons, relationships, currentUser, onAddRelationship, onAddPerson }) {
  const [personAId, setPersonAId] = useState(currentUser?.id || '');
  const [personBId, setPersonBId] = useState('');
  const [relationType, setRelationType] = useState('parent');
  const [relationData, setRelationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showNewPersonForm, setShowNewPersonForm] = useState(false);
  const [newPersonForm, setNewPersonForm] = useState({ name: '', dob: '', notes: '', contact: '' });

  const relationshipTypes = [
    { value: 'parent', label: '👨‍👩‍👧 Parent' },
    { value: 'child', label: '👧 Child' },
    { value: 'spouse', label: '💑 Spouse/Partner' },
    { value: 'sibling', label: '👥 Sibling' },
  ];

  const handleAddRelationship = async (e) => {
    e.preventDefault();
    if (personAId && personBId && personAId !== personBId) {
      const success = await onAddRelationship(personAId, personBId, relationType, null);
      if (success) {
        setPersonBId('');
        setSuggestions([]);
      }
    }
  };

  const handleQueryRelation = async (e) => {
    e.preventDefault();
    if (personAId && personBId && personAId !== personBId) {
      try {
        setLoading(true);
        const response = await api.get('/api/relation', {
          params: { from: personAId, to: personBId },
        });
        setRelationData(response.data);
      } catch (error) {
        console.error('Error querying relation:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddNewPerson = async (e) => {
    e.preventDefault();
    if (newPersonForm.name.trim()) {
      const result = await onAddPerson(
        newPersonForm.name,
        newPersonForm.dob,
        newPersonForm.notes,
        newPersonForm.contact
      );
      if (result) {
        setPersonBId(result.id);
        setNewPersonForm({ name: '', dob: '', notes: '', contact: '' });
        setShowNewPersonForm(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Relationship */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 p-6 rounded-lg border border-blue-200 dark:border-slate-600">
        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center">
          <span className="mr-2">➕</span> Add Relationship
        </h3>
        <form onSubmit={handleAddRelationship} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                From
              </label>
              <select
                value={personAId}
                onChange={(e) => setPersonAId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select person...</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Relationship
              </label>
              <select
                value={relationType}
                onChange={(e) => setRelationType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {relationshipTypes.map((rt) => (
                  <option key={rt.value} value={rt.value}>
                    {rt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              To
            </label>
            <div className="relative">
              <select
                value={personBId}
                onChange={(e) => setPersonBId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select person...</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewPersonForm(!showNewPersonForm)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
              >
                + New
              </button>
            </div>
          </div>

          {showNewPersonForm && (
            <form onSubmit={handleAddNewPerson} className="bg-white dark:bg-slate-600 p-4 rounded-lg space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={newPersonForm.name}
                onChange={(e) => setNewPersonForm({ ...newPersonForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-500 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                required
              />
              <input
                type="date"
                value={newPersonForm.dob}
                onChange={(e) => setNewPersonForm({ ...newPersonForm, dob: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-500 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              />
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-semibold py-2 rounded transition text-sm"
              >
                Create & Select
              </button>
            </form>
          )}

          <button
            type="submit"
            disabled={!personAId || !personBId}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
          >
            Add Relationship
          </button>
        </form>
      </div>

      {/* Query Relationship */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 p-6 rounded-lg border border-purple-200 dark:border-slate-600">
        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center">
          <span className="mr-2">🔍</span> Find How We're Related
        </h3>
        <form onSubmit={handleQueryRelation} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                From
              </label>
              <select
                value={personAId}
                onChange={(e) => setPersonAId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select person...</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                To
              </label>
              <select
                value={personBId}
                onChange={(e) => setPersonBId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select person...</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !personAId || !personBId}
            className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Searching...' : 'Find Relationship'}
          </button>
        </form>

        {relationData && (
          <div className="mt-6 p-4 bg-white dark:bg-slate-700 rounded-lg border-l-4 border-purple-600">
            {relationData.connected ? (
              <div>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">✓ Connected!</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {relationData.label.english}
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                  ({relationData.label.nepali})
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  📍 Distance: {relationData.distance} step{relationData.distance !== 1 ? 's' : ''}
                </p>
              </div>
            ) : (
              <p className="text-lg font-bold text-red-600 dark:text-red-400">✗ Not directly connected</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RelationshipQuery;
