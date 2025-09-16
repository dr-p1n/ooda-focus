import { useState, useEffect } from 'react';
import { Task, Project } from '@/types/task';
import { calculateTaskMetrics } from '@/utils/taskCalculations';
import { UnifiedInfographic } from '@/components/UnifiedInfographic';
import { TaskFormDialog } from '@/components/TaskFormDialog';
import { ProjectDialog } from '@/components/ProjectDialog';
import { InviteDialog } from '@/components/InviteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Target, Edit, ListTodo, FolderPlus, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SimplifiedDashboardProps {
  tasks: Task[];
  onTaskUpdate: (tasks: Task[]) => void;
}

export function SimplifiedDashboard({ tasks, onTaskUpdate }: SimplifiedDashboardProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Work');
  const [newTaskProject, setNewTaskProject] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    if (error) {
      console.error('Error fetching projects:', error);
      return;
    }
    
    if (data) {
      setProjects(data.map(p => ({
        ...p,
        created_at: new Date(p.created_at),
        updated_at: new Date(p.updated_at)
      })));
    }
  };

  const createTask = () => {
    if (!newTaskTitle.trim() || !user) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: '',
      category: newTaskCategory,
      project_id: newTaskProject || undefined,
      user_id: user.id,
      importance: 3,
      urgency: 3,
      impact: 3,
      effort: 3,
      estimatedTime: 60,
      status: 'incomplete',
      createdAt: new Date(),
      modifiedAt: new Date(),
      yearAssignment: new Date().getFullYear(),
      monthAssignment: new Date().getMonth() + 1,
    };

    onTaskUpdate([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskProject('');
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating project:', error);
      return;
    }

    if (data) {
      const newProject: Project = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };
      setProjects([...projects, newProject]);
      toast({
        title: "Success",
        description: "Project created successfully!",
      });
    }
  };

  const inviteUserToTask = async (taskId: string, email: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('task_invitations')
      .insert({
        task_id: taskId,
        invited_by: user.id,
        invited_email: email
      });

    if (error) {
      throw error;
    }
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, status, modifiedAt: new Date() } : task
    );
    onTaskUpdate(updatedTasks);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'complete': return 'bg-success/20 text-success border-success/30';
      case 'in-progress': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const incompleteTasks = tasks.filter(t => t.status !== 'complete');
  const completedCount = tasks.filter(t => t.status === 'complete').length;
  
  const getProjectForTask = (task: Task) => {
    return task.project_id ? projects.find(p => p.id === task.project_id) : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Strategic Task Manager</h1>
          <p className="text-muted-foreground">
            OODA Loop optimization through unified task analysis
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ProjectDialog onSave={createProject} />
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-primary" />
            <span>{incompleteTasks.length} active</span>
            <span className="text-muted-foreground">•</span>
            <span>{completedCount} completed</span>
          </div>
        </div>
      </div>

      {/* Quick Task Creation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Add New Task</label>
              <Input
                placeholder="Enter task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createTask()}
                className="text-base"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Learning">Learning</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Creative">Creative</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Project</label>
              <Select value={newTaskProject} onValueChange={setNewTaskProject}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={createTask} className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                Task Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority Score</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => {
                    const metrics = calculateTaskMetrics(task);
                    return (
                      <TableRow 
                        key={task.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedTask(task)}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {task.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`font-mono ${
                                metrics.priorityScore >= 6 ? 'bg-destructive/20 text-destructive border-destructive/30' :
                                metrics.priorityScore >= 4 ? 'bg-warning/20 text-warning border-warning/30' :
                                'bg-success/20 text-success border-success/30'
                              }`}
                            >
                              {metrics.priorityScore.toFixed(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {task.deadline ? task.deadline.toLocaleDateString() : '—'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {task.createdAt.toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={task.status} 
                            onValueChange={(value) => updateTaskStatus(task.id, value as Task['status'])}
                          >
                            <SelectTrigger className={`w-28 text-xs ${getStatusColor(task.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="incomplete">To Do</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="complete">Complete</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const project = getProjectForTask(task);
                            return project ? (
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: project.color }}
                                />
                                <span className="text-sm">{project.name}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TaskFormDialog 
                              task={task}
                              projects={projects}
                              onSave={(taskData) => {
                                const updatedTasks = tasks.map(t => 
                                  t.id === task.id 
                                    ? { ...taskData, id: task.id, createdAt: task.createdAt, modifiedAt: new Date() }
                                    : t
                                );
                                onTaskUpdate(updatedTasks);
                              }}
                              onDelete={(taskId) => {
                                const filteredTasks = tasks.filter(t => t.id !== taskId);
                                onTaskUpdate(filteredTasks);
                              }}
                              trigger={
                                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <InviteDialog 
                              taskId={task.id}
                              taskTitle={task.title}
                              onInvite={inviteUserToTask}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Unified Infographic */}
        <div>
          <UnifiedInfographic 
            tasks={tasks} 
            selectedTask={selectedTask}
            onTaskSelect={setSelectedTask}
          />
        </div>
      </div>
    </div>
  );
}