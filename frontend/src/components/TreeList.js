import React, { useState } from 'react';

function TreeList({ trees, selectedTree, onSelectTree, onCreateTree }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateTree(formData.name, formData.description);
    setFormData({ name: '', description: '' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="space-y-2 mb-4">
        {trees.map((tree) => (
          <button
            key={tree.id}
            onClick={() => onSelectTree(tree)}
            className={`w-full text-left p-3 rounded-md transition ${
              selectedTree?.id === tree.id
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="font-semibold text-gray-900">{tree.name}</h3>
            <p className="text-xs text-gray-600 mt-1">{tree.description}</p>
          </button>
        ))}
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
        >
          + New Tree
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 p-3 rounded-md">
          <input
            type="text"
            placeholder="Tree name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-400 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default TreeList;
