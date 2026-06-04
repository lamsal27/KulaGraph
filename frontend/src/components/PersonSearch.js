import React, { useState } from 'react';

function PersonSearch({ persons }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      setResults([]);
    } else {
      const filtered = persons.filter((person) =>
        person.name.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🔍 Search Family Members
        </label>
        <input
          type="text"
          placeholder="Enter name..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {searchTerm && (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </p>
          {results.length === 0 ? (
            <p className="text-gray-500">No matches found.</p>
          ) : (
            <div className="space-y-3">
              {results.map((person) => (
                <div
                  key={person.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    {person.dob && <p>📅 DOB: {person.dob}</p>}
                    {person.contact && <p>📞 {person.contact}</p>}
                  </div>
                  {person.notes && (
                    <p className="mt-3 text-gray-700 text-sm">{person.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!searchTerm && (
        <div className="text-center py-8 text-gray-500">
          <p>Enter a name to search for family members</p>
        </div>
      )}
    </div>
  );
}

export default PersonSearch;
