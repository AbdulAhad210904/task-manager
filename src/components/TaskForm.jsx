import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const TaskForm = ({
  task,
  allTasks,
  onSubmit,
  onCancel,
  isOpen
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    parentTask: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        parentTask: task.parentTask?._id || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        parentTask: ''
      });
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.title.trim().length < 3) {
      alert('Task title must be at least 3 characters long');
      return;
    }

    if (formData.description && formData.description.length > 200) {
      alert('Task description must be less than 200 characters');
      return;
    }

    onSubmit({
      title: formData.title.trim(),
      description: formData.description?.trim(),
      parentTask: formData.parentTask || undefined
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter out the current task and its subtasks from parent options
  const getAvailableParentTasks = () => {
    if (!task) return allTasks;
    
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Edit Task' : 'Create New Task'}
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title (minimum 3 characters)"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={200}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task description (optional, max 200 characters)"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.description?.length || 0}/200 characters
            </div>
          </div>
          
          <div>
            <label htmlFor="parentTask" className="block text-sm font-medium text-gray-700 mb-1">
              Parent Task (Optional)
            </label>
            <select
              id="parentTask"
              name="parentTask"
              value={formData.parentTask}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a parent task (optional)</option>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};