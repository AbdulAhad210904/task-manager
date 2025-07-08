import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { TaskItem } from './TaskItem';
import { Pagination } from './Pagination';
import { Loader, AlertCircle } from 'lucide-react';

export const TaskList = ({
  isArchived,
  onEdit,
  onMove,
  refreshTrigger
}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allTasks, setAllTasks] = useState([]);

  const fetchTasks = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = isArchived
        ? await apiService.getArchivedTasks(page)
        : await apiService.getActiveTasks(page);
      
      setTasks(response.tasks);
      setTotalPages(response.pagination.pages);
      setCurrentPage(response.pagination.page);
      
      // Fetch all tasks for parent selection
      const allTasksResponse = await apiService.getTaskTree(isArchived);
      setAllTasks(allTasksResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(1);
  }, [isArchived, refreshTrigger]);

  const handlePageChange = (page) => {
    fetchTasks(page);
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await apiService.updateTask(id, { completed });
      fetchTasks(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteTask(id);
      fetchTasks(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-blue-600" size={24} />
        <span className="ml-2 text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <AlertCircle className="text-red-500" size={24} />
        <span className="ml-2 text-red-600">{error}</span>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {isArchived ? 'No archived tasks found' : 'No active tasks found'}
        </p>
        {!isArchived && (
          <p className="text-gray-400 mt-2">
            Create your first task to get started!
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            onToggleComplete={handleToggleComplete}
            onEdit={onEdit}
            onDelete={handleDelete}
            onMove={onMove}
            allTasks={allTasks}
          />
        ))}
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};