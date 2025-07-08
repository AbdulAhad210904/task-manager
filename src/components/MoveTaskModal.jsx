import React, { useState } from 'react';
import { X } from 'lucide-react';

export const MoveTaskModal = ({
  task,
  allTasks,
  onMove,
  onCancel,
  isOpen
}) => {
  const [selectedParent, setSelectedParent] = useState(task.parentTask?._id || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onMove(task._id, selectedParent || null);
  };

  // Filter out the current task and its subtasks from parent options
  const getAvailableParentTasks = () => {
    const filterTask = (tasks, excludeId) => {
      return tasks.filter(t => {
        if (t._id === excludeId) return false;
        if (t.parentTask?._id === excludeId) return false;
        return true;
      });
    };

    return filterTask(allTasks, task._id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Move Task
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Moving: {task.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select a new parent task or choose "No Parent" to make it a top-level task.
            </p>
          </div>
          
          <div>
            <label htmlFor="parentTask" className="block text-sm font-medium text-gray-700 mb-1">
              New Parent Task
            </label>
            <select
              id="parentTask"
              value={selectedParent}
              onChange={(e) => setSelectedParent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Parent (Top-level task)</option>
              {getAvailableParentTasks()
                .filter(t => !t.archived)
                .map(t => (
                  <option key={t._id} value={t._id}>
                    {t.title}
                  </option>
                ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Move Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};