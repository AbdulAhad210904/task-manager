import React, { useState } from 'react';
import { apiService } from './services/api';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { MoveTaskModal } from './components/MoveTaskModal';
import { Plus, List, Archive, CheckCircle, Clock } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('active');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [movingTask, setMovingTask] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [allTasks, setAllTasks] = useState([]);

  const refreshTasks = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateTask = async (data) => {
    try {
      await apiService.createTask(data);
      setShowTaskForm(false);
      refreshTasks();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create task');
    }
  };

  const handleUpdateTask = async (data) => {
    if (!editingTask) return;
    
    try {
      await apiService.updateTask(editingTask._id, {
        title: data.title,
        description: data.description
      });
      
      if (data.parentTask !== (editingTask.parentTask?._id || '')) {
        await apiService.moveTask(editingTask._id, data.parentTask || null);
      }
      
      setEditingTask(null);
      refreshTasks();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update task');
    }
  };

  const handleMoveTask = async (taskId, parentId) => {
    try {
      await apiService.moveTask(taskId, parentId);
      setMovingTask(null);
      refreshTasks();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to move task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleOpenTaskForm = async () => {
    try {
      const tasks = await apiService.getTaskTree(false);
      setAllTasks(tasks);
      setShowTaskForm(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to load tasks');
    }
  };

  const handleEditTaskWithTasks = async (task) => {
    try {
      const tasks = await apiService.getTaskTree(false);
      setAllTasks(tasks);
      setEditingTask(task);
      setShowTaskForm(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to load tasks');
    }
  };
  const handleMoveTaskModal = async (task) => {
    try {
      const tasks = await apiService.getTaskTree(false);
      setAllTasks(tasks);
      setMovingTask(task);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to load tasks');
    }
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleCloseMoveModal = () => {
    setMovingTask(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border-b-4 border-blue-500 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Manager</h1>
          <p className="text-gray-600">Organize your tasks with hierarchical structure and automated archiving</p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentView('active')}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <List size={20} className="mr-2" />
              Active Tasks
            </button>
            <button
              onClick={() => setCurrentView('archived')}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'archived'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Archive size={20} className="mr-2" />
              Archived Tasks
            </button>
          </div>

          {currentView === 'active' && (
            <button
              onClick={handleOpenTaskForm}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Add Task
            </button>
          )}
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Clock size={20} className="text-blue-600" />
            <div>
              <p className="text-blue-800 font-medium">Automated Archiving</p>
              <p className="text-blue-600 text-sm">
                Completed tasks are automatically moved to archive every 5 minutes
              </p>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            {currentView === 'active' ? (
              <CheckCircle className="text-green-600" size={24} />
            ) : (
              <Archive className="text-gray-600" size={24} />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {currentView === 'active' ? 'Active Tasks' : 'Archived Tasks'}
            </h2>
          </div>
          
          <TaskList
            isArchived={currentView === 'archived'}
            onEdit={handleEditTaskWithTasks}
            onMove={handleMoveTaskModal}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Task Form Modal */}
        <TaskForm
          task={editingTask}
          allTasks={allTasks}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={handleCloseForm}
          isOpen={showTaskForm}
        />

        {/* Move Task Modal */}
        {movingTask && (
          <MoveTaskModal
            task={movingTask}
            allTasks={allTasks}
            onMove={handleMoveTask}
            onCancel={handleCloseMoveModal}
            isOpen={true}
          />
        )}
      </div>
    </div>
  );
}

export default App;