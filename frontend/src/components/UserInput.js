import React, { useState } from 'react';

function UserInput({ persons, onUserSelect, onAddPerson }) {
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', dob: '', notes: '', contact: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPersons = persons.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      const result = await onAddPerson(
        formData.name,
        formData.dob,
        formData.notes,
        formData.contact
      );
      if (result) {
        onUserSelect(formData.name);
        setFormData({ name: '', dob: '', notes: '', contact: '' });
        setShowNewUserForm(false);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            Welcome to KulaGraph
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Select yourself or create your profile
          </p>

          {!showNewUserForm ? (
            <div className="space-y-4">
              {persons.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Existing Members
                  </label>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg mb-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredPersons.map((person) => (
                      <button
                        key={person.id}
                        onClick={() => onUserSelect(person.name)}
                        className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600 transition border border-gray-200 dark:border-slate-600"
                      >
                        <p className="font-semibold text-gray-900 dark:text-white">{person.name}</p>
                        {person.dob && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">DOB: {person.dob}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowNewUserForm(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
              >
                + Create New Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Contact
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition"
                >
                  Create & Enter
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewUserForm(false)}
                  className="flex-1 bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserInput;
