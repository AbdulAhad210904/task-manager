import React, { useState } from 'react';
import { 
  Check, 
  Edit, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Move3D,
  Clock,
  Archive
} from 'lucide-react';

export const TaskItem = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onMove,
  depth = 0,
  allTasks = []
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleToggleComplete = () => {
    onToggleComplete(task._id, !task.completed);
  };

  const handleDelete = () => {
    if (hasSubtasks) {
      if (window.confirm(`This task has ${task.subtasks.length} subtask(s). Are you sure you want to delete it and all its subtasks?`)) {
        onDelete(task._id);
      }
    } else {
      if (window.confirm('Are you sure you want to delete this task?')) {
        onDelete(task._id);
      }
    }
  };

  return (
    <div className="task-item" style={{ marginLeft: `${depth * 24}px` }}>
      <div className={`bg-white rounded-lg shadow-sm border-l-4 p-4 mb-2 transition-all duration-200 hover:shadow-md ${
        task.completed 
          ? 'border-green-400 bg-green-50' 
          : task.archived 
            ? 'border-gray-400 bg-gray-50' 
            : 'border-blue-400'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {hasSubtasks && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                
                {task.parentTask && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Subtask of: {task.parentTask.title}
                  </span>
                )}
              </div>
              
              {task.description && (
                <p className={`text-sm mb-2 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>Created: {formatDate(task.createdAt)}</span>
                </div>
                
                {task.archived && task.archivedAt && (
                  <div className="flex items-center space-x-1">
                    <Archive size={12} />
                    <span>Archived: {formatDate(task.archivedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {!task.archived && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleComplete}
                className={`p-1 rounded-full transition-colors ${
                  task.completed 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
              >
                <Check size={16} />
              </button>
              
              <button
                onClick={() => onEdit(task)}
                className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                title="Edit task"
              >
                <Edit size={16} />
              </button>
              
              <button
                onClick={() => onMove(task)}
                className="p-1 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                title="Move task"
              >
                <Move3D size={16} />
              </button>
              
              <button
                onClick={handleDelete}
                className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {hasSubtasks && isExpanded && (
        <div className="ml-4">
          {task.subtasks.map((subtask) => (
            <TaskItem
              key={subtask._id}
              task={subtask}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
              depth={depth + 1}
              allTasks={allTasks}
            />
          ))}
        </div>
      )}
    </div>
  );
};