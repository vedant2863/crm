"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle2, 
  Search, 
  Plus, 
  Calendar,
  User,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Flag,
  Filter
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/feature/tasks/types/task";
import { CreateTaskRequest } from "@/feature/tasks/services/taskService";

const TASK_STATUSES = [
  { key: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  { key: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle }
];

const PRIORITY_LEVELS = [
  { key: 'low', label: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { key: 'medium', label: 'Medium', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { key: 'high', label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100' }
];

export default function TasksPage() {
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState<CreateTaskRequest>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    tags: []
  });

  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch,
  } = useTasks({
    search: searchTerm,
    status: selectedStatus,
    priority: selectedPriority,
    limit: 100,
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask(newTask);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        tags: []
      });
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.contactId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.dealId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });


  const toggleTaskStatus = async (taskId: string) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      if (task) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        await updateTask(taskId, { status: newStatus });
      }
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error("Failed to delete task:", err);
        alert("Failed to delete task. Please try again.");
      }
    }
  };

  const getStatusConfig = (status: string) => {
    return TASK_STATUSES.find(s => s.key === status) || TASK_STATUSES[0];
  };

  const getPriorityConfig = (priority: string) => {
    return PRIORITY_LEVELS.find(p => p.key === priority) || PRIORITY_LEVELS[1];
  };

  const getTasksCount = (status?: string, priority?: string) => {
    return tasks.filter(task => {
      const matchesStatus = !status || task.status === status;
      const matchesPriority = !priority || task.priority === priority;
      return matchesStatus && matchesPriority;
    }).length;
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'completed' && new Date(dueDate) < new Date();
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading tasks...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-gray-600">You need to be logged in to access tasks.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error Loading Tasks</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-2">Manage your tasks and stay productive</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {getTasksCount('pending')}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
                <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getTasksCount('in_progress')}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {getTasksCount('completed')}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              {TASK_STATUSES.map(status => (
                <option key={status.key} value={status.key}>{status.label}</option>
              ))}
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              {PRIORITY_LEVELS.map(priority => (
                <option key={priority.key} value={priority.key}>{priority.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Add Task Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Task Title *"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                />
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value as 'low' | 'medium' | 'high'})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PRIORITY_LEVELS.map(priority => (
                    <option key={priority.key} value={priority.key}>{priority.label}</option>
                  ))}
                </select>
                <Input
                  type="date"
                  placeholder="Due Date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
              <textarea
                placeholder="Task Description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20"
              />
              <div className="flex gap-2">
                <Button type="submit">Add Task</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Quick Priority Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {PRIORITY_LEVELS.map(priority => {
          const count = getTasksCount(undefined, priority.key);
          return (
            <Card key={priority.key} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedPriority(priority.key)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{priority.label} Priority</p>
                    <p className={`text-xl font-bold ${priority.color}`}>{count}</p>
                  </div>
                  <div className={`p-2 rounded-full ${priority.bgColor}`}>
                    <Flag className={`h-4 w-4 ${priority.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Task List ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const statusConfig = getStatusConfig(task.status);
              const priorityConfig = getPriorityConfig(task.priority);
              const StatusIcon = statusConfig.icon;
              const overdue = task.dueDate ? isOverdue(task.dueDate, task.status) : false;

              return (
                <div key={task._id} className={`border rounded-lg p-4 transition-colors ${
                  task.status === 'completed' ? 'bg-gray-50 opacity-75' : 'hover:bg-gray-50'
                } ${overdue ? 'border-l-4 border-l-red-500' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleTaskStatus(task._id)}
                        className={`mt-1 p-1 rounded-full transition-colors ${
                          task.status === 'completed' 
                            ? 'text-green-600 hover:text-green-700' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                      >
                        <CheckCircle2 className={`h-5 w-5 ${
                          task.status === 'completed' ? 'fill-current' : ''
                        }`} />
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-lg font-semibold ${
                            task.status === 'completed' ? 'line-through text-gray-500' : ''
                          }`}>
                            {task.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color} ${priorityConfig.bgColor}`}>
                            {priorityConfig.label}
                          </span>
                          {overdue && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Overdue
                            </span>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className={`text-sm mb-3 ${
                            task.status === 'completed' ? 'text-gray-500' : 'text-gray-600'
                          }`}>
                            {task.description}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                          {task.dueDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span className={overdue ? 'text-red-600 font-medium' : ''}>
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {task.contactId && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{task.contactId.name} {task.contactId.company && `at ${task.contactId.company}`}</span>
                            </div>
                          )}
                          {task.dealId && (
                            <div className="flex items-center gap-2">
                              <Flag className="h-4 w-4" />
                              <span>{task.dealId.title}</span>
                            </div>
                          )}
                        </div>
                        
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {task.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          Created: {new Date(task.createdAt).toLocaleDateString()}
                          {task.status === 'completed' && task.updatedAt && (
                            <span> • Completed: {new Date(task.updatedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteTask(task._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredTasks.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No tasks found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
