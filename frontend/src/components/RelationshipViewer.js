import React, { useState, useEffect } from 'react';
import api from '../services/api';

function RelationshipViewer({ persons, relationships, treeId, onRelationshipAdded }) {
  const [personAId, setPersonAId] = useState('');
  const [personBId, setPersonBId] = useState('');
  const [relationType, setRelationType] = useState('parent');
  const [relationData, setRelationData] = useState(null);
  const [loading, setLoading] = useState(false);

  const relationshipTypes = [
    { value: 'parent', label: 'Parent' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'partner', label: 'Partner' },
  ];

  const handleAddRelationship = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/api/relationships', {
        person_a: personAId,
        person_b: personBId,
        type: relationType,
      });
      setPersonAId('');
      setPersonBId('');
      setRelationType('parent');
      onRelationshipAdded();
    } catch (error) {
      console.error('Error adding relationship:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryRelation = async (e) => {
    e.preventDefault();
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
  };

  return (
    <div className="space-y-6">
      {/* Add Relationship Form */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Create Relationship</h3>
        <form onSubmit={handleAddRelationship} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Person A
              </label>
              <select
                value={personAId}
                onChange={(e) => setPersonAId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship Type
              </label>
              <select
                value={relationType}
                onChange={(e) => setRelationType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Person B
            </label>
            <select
              value={personBId}
              onChange={(e) => setPersonBId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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

          <button
            type="submit"
            disabled={loading || !personAId || !personBId}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {loading ? 'Adding...' : 'Add Relationship'}
          </button>
        </form>
      </div>

      {/* Query Relationship Form */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">🔍 Find Relationship</h3>
        <form onSubmit={handleQueryRelation} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <select
                value={personAId}
                onChange={(e) => setPersonAId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <select
                value={personBId}
                onChange={(e) => setPersonBId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {loading ? 'Searching...' : 'Find Relationship'}
          </button>
        </form>

        {relationData && (
          <div className="mt-4 p-4 bg-white rounded border border-gray-200">
            {relationData.connected ? (
              <div>
                <p className="text-lg font-semibold text-green-600">✓ Connected</p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  {relationData.label.english}
                </p>
                <p className="text-gray-600 mt-1">({relationData.label.nepali})</p>
                <p className="text-xs text-gray-500 mt-3">Distance: {relationData.path.length} steps</p>
              </div>
            ) : (
              <p className="text-lg font-semibold text-red-600">✗ Not Connected</p>
            )}
          </div>
        )}
      </div>

      {/* All Relationships List */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">All Relationships</h3>
        {relationships.length === 0 ? (
          <p className="text-gray-500">No relationships yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relationships.map((rel, idx) => {
              const personA = persons.find((p) => p.id === rel.person_a);
              const personB = persons.find((p) => p.id === rel.person_b);
              return (
                <div
                  key={idx}
                  className="bg-gray-50 p-3 rounded border border-gray-200"
                >
                  <p className="font-medium text-gray-900">
                    {personA?.name} → {personB?.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Relationship: <span className="font-semibold">{rel.type}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default RelationshipViewer;
