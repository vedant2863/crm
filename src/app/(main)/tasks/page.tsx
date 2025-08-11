"use client";

import { useState, useEffect } from "react";
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

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  assignedTo: string;
  contactName?: string;
  dealTitle?: string;
  createdAt: string;
  completedAt?: string;
  tags: string[];
}

const TASK_STATUSES = [
  { key: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { key: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  { key: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  { key: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle }
];

const PRIORITY_LEVELS = [
  { key: 'low', label: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { key: 'medium', label: 'Medium', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { key: 'high', label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { key: 'urgent', label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-100' }
];

export default function TasksPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    dueDate: "",
    contactName: "",
    dealTitle: ""
  });

  // Mock data for demo purposes
  useEffect(() => {
    if (status === "authenticated") {
      setTimeout(() => {
        setTasks([
          {
            id: "1",
            title: "Follow up with John Smith",
            description: "Call to discuss website redesign proposal and answer questions",
            status: "pending",
            priority: "high",
            dueDate: "2024-01-15",
            assignedTo: "You",
            contactName: "John Smith",
            dealTitle: "Website Redesign Project",
            createdAt: "2024-01-10",
            tags: ["follow-up", "proposal"]
          },
          {
            id: "2",
            title: "Prepare enterprise software demo",
            description: "Create customized demo for TechStart Inc showing key features",
            status: "in-progress",
            priority: "urgent",
            dueDate: "2024-01-12",
            assignedTo: "You",
            contactName: "Sarah Johnson",
            dealTitle: "Enterprise Software License",
            createdAt: "2024-01-08",
            tags: ["demo", "presentation"]
          },
          {
            id: "3",
            title: "Send marketing campaign proposal",
            description: "Draft and send comprehensive digital marketing strategy document",
            status: "completed",
            priority: "medium",
            dueDate: "2024-01-08",
            assignedTo: "You",
            contactName: "Mike Davis",
            dealTitle: "Marketing Campaign",
            createdAt: "2024-01-05",
            completedAt: "2024-01-08",
            tags: ["proposal", "marketing"]
          },
          {
            id: "4",
            title: "Research cloud migration tools",
            description: "Compare AWS, Azure, and GCP migration services for client presentation",
            status: "pending",
            priority: "medium",
            dueDate: "2024-01-20",
            assignedTo: "You",
            contactName: "Emily Chen",
            dealTitle: "Cloud Migration Services",
            createdAt: "2024-01-09",
            tags: ["research", "cloud"]
          },
          {
            id: "5",
            title: "Schedule team meeting",
            description: "Organize weekly team sync to discuss project progress",
            status: "pending",
            priority: "low",
            dueDate: "2024-01-16",
            assignedTo: "You",
            createdAt: "2024-01-11",
            tags: ["internal", "meeting"]
          },
          {
            id: "6",
            title: "Update CRM contact information",
            description: "Review and update contact details for recent leads",
            status: "cancelled",
            priority: "low",
            dueDate: "2024-01-10",
            assignedTo: "You",
            createdAt: "2024-01-05",
            tags: ["maintenance", "data"]
          }
        ]);
        setLoading(false);
      }, 1000);
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.dealTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: 'pending',
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      assignedTo: "You",
      contactName: newTask.contactName,
      dealTitle: newTask.dealTitle,
      createdAt: new Date().toISOString().split('T')[0],
      tags: []
    };
    setTasks([task, ...tasks]);
    setNewTask({ title: "", description: "", priority: "medium", dueDate: "", contactName: "", dealTitle: "" });
    setShowAddForm(false);
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        if (task.status === 'completed') {
          return { ...task, status: 'pending', completedAt: undefined };
        } else {
          return { ...task, status: 'completed', completedAt: new Date().toISOString().split('T')[0] };
        }
      }
      return task;
    }));
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
                  {getTasksCount('in-progress')}
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
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
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
                <Input
                  placeholder="Contact Name"
                  value={newTask.contactName}
                  onChange={(e) => setNewTask({...newTask, contactName: e.target.value})}
                />
                <Input
                  placeholder="Related Deal"
                  value={newTask.dealTitle}
                  onChange={(e) => setNewTask({...newTask, dealTitle: e.target.value})}
                  className="md:col-span-1"
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
              const overdue = isOverdue(task.dueDate, task.status);

              return (
                <div key={task.id} className={`border rounded-lg p-4 transition-colors ${
                  task.status === 'completed' ? 'bg-gray-50 opacity-75' : 'hover:bg-gray-50'
                } ${overdue ? 'border-l-4 border-l-red-500' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
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
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className={overdue ? 'text-red-600 font-medium' : ''}>
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          {task.contactName && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{task.contactName}</span>
                            </div>
                          )}
                          {task.dealTitle && (
                            <div className="flex items-center gap-2">
                              <Flag className="h-4 w-4" />
                              <span>{task.dealTitle}</span>
                            </div>
                          )}
                        </div>
                        
                        {task.tags.length > 0 && (
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
                          {task.completedAt && (
                            <span> • Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
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
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
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
