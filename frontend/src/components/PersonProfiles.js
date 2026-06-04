import React, { useState } from 'react';

function PersonProfiles({ persons, relationships, currentUser, onDeletePerson, onDeleteRelationship, onAddRelationship }) {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPersons = persons.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRelationsForPerson = (personId) => {
    return relationships.filter(
      (r) => r.person_a_id === personId || r.person_b_id === personId
    );
  };

  const getRelationshipLabel = (relationship, personId) => {
    const isPersonA = relationship.person_a_id === personId;
    const otherPersonId = isPersonA ? relationship.person_b_id : relationship.person_a_id;
    const otherPerson = persons.find((p) => p.id === otherPersonId);

    const relationTypes = {
      parent: isPersonA ? 'is parent of' : 'is child of',
      child: isPersonA ? 'is child of' : 'is parent of',
      spouse: 'is spouse of',
      sibling: 'is sibling of',
    };

    return { label: relationTypes[relationship.relation_type], person: otherPerson };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search and List */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">👥 All Members</h3>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredPersons.map((person) => (
              <button
                key={person.id}
                onClick={() => setSelectedPerson(person)}
                className={`w-full text-left p-3 rounded-lg transition border ${
                  selectedPerson?.id === person.id
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-400'
                    : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-400'
                }`}
              >
                <p className="font-semibold text-gray-900 dark:text-white">{person.name}</p>
                {person.dob && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">📅 {person.dob}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          {selectedPerson ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedPerson.name}</h2>
                  {selectedPerson === currentUser && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">👤 That's you!</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    onDeletePerson(selectedPerson.id);
                    setSelectedPerson(null);
                  }}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold transition"
                >
                  Delete
                </button>
              </div>

              {selectedPerson.dob && (
                <p className="text-gray-600 dark:text-gray-400 mb-2">📅 DOB: {selectedPerson.dob}</p>
              )}
              {selectedPerson.contact && (
                <p className="text-gray-600 dark:text-gray-400 mb-2">📞 {selectedPerson.contact}</p>
              )}
              {selectedPerson.notes && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">{selectedPerson.notes}</p>
              )}

              {/* Relationships */}
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">🔗 Relationships</h3>
                {getRelationsForPerson(selectedPerson.id).length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No relationships added yet</p>
                ) : (
                  <div className="space-y-3">
                    {getRelationsForPerson(selectedPerson.id).map((rel) => {
                      const { label, person } = getRelationshipLabel(rel, selectedPerson.id);
                      return (
                        <div
                          key={rel.id}
                          className="bg-gray-50 dark:bg-slate-700 p-3 rounded-lg flex justify-between items-start"
                        >
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{person.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                          </div>
                          <button
                            onClick={() => onDeleteRelationship(rel.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-12 text-center border border-gray-200 dark:border-slate-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg">Select a person to view their profile</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PersonProfiles;
