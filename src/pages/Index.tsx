import { useState } from 'react';
import { Task } from '@/types/task';
import { ProductivityDashboard } from '@/components/ProductivityDashboard';
import { TaskFormDialog } from '@/components/TaskFormDialog';
import { useToast } from '@/hooks/use-toast';

// Sample data for demonstration
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Complete quarterly financial review',
    description: 'Analyze Q3 performance metrics and prepare strategic recommendations for Q4',
    category: 'Work',
    importance: 5,
    urgency: 4,
    impact: 5,
    effort: 3,
    estimatedTime: 180,
    status: 'incomplete',
    createdAt: new Date('2024-01-15'),
    modifiedAt: new Date('2024-01-15'),
    deadline: new Date('2024-02-01'),
    yearAssignment: 2024,
    monthAssignment: 1,
  },
  {
    id: '2',
    title: 'Optimize website performance',
    description: 'Implement lazy loading, compress images, and optimize database queries',
    category: 'Work',
    importance: 4,
    urgency: 2,
    impact: 4,
    effort: 4,
    estimatedTime: 240,
    status: 'in-progress',
    createdAt: new Date('2024-01-10'),
    modifiedAt: new Date('2024-01-12'),
    yearAssignment: 2024,
    monthAssignment: 1,
  },
  {
    id: '3',
    title: 'Learn TypeScript fundamentals',
    description: 'Complete online course and build a small project to practice',
    category: 'Learning',
    importance: 4,
    urgency: 2,
    impact: 5,
    effort: 2,
    estimatedTime: 300,
    status: 'incomplete',
    createdAt: new Date('2024-01-12'),
    modifiedAt: new Date('2024-01-12'),
    yearAssignment: 2024,
    monthAssignment: 1,
  },
  {
    id: '4',
    title: 'Respond to urgent client email',
    description: 'Address concerns about project timeline and deliverables',
    category: 'Work',
    importance: 2,
    urgency: 5,
    impact: 2,
    effort: 1,
    estimatedTime: 30,
    status: 'incomplete',
    createdAt: new Date('2024-01-16'),
    modifiedAt: new Date('2024-01-16'),
    deadline: new Date('2024-01-17'),
    yearAssignment: 2024,
    monthAssignment: 1,
  },
  {
    id: '5',
    title: 'Plan weekend hiking trip',
    description: 'Research trails, check weather, and pack equipment',
    category: 'Personal',
    importance: 2,
    urgency: 2,
    impact: 3,
    effort: 2,
    estimatedTime: 90,
    status: 'incomplete',
    createdAt: new Date('2024-01-14'),
    modifiedAt: new Date('2024-01-14'),
    yearAssignment: 2024,
    monthAssignment: 1,
  },
  {
    id: '6',
    title: 'Update portfolio website',
    description: 'Add recent projects and optimize for better performance',
    category: 'Creative',
    importance: 3,
    urgency: 1,
    impact: 4,
    effort: 3,
    estimatedTime: 120,
    status: 'incomplete',
    createdAt: new Date('2024-01-11'),
    modifiedAt: new Date('2024-01-11'),
    yearAssignment: 2024,
    monthAssignment: 1,
  },
  {
    id: '7',
    title: 'Schedule annual health checkup',
    description: 'Book appointments with doctor and dentist',
    category: 'Health',
    importance: 4,
    urgency: 3,
    impact: 4,
    effort: 1,
    estimatedTime: 15,
    status: 'incomplete',
    createdAt: new Date('2024-01-13'),
    modifiedAt: new Date('2024-01-13'),
    yearAssignment: 2024,
    monthAssignment: 1,
  },
  {
    id: '8',
    title: 'Organize digital photo collection',
    description: 'Sort, tag, and backup family photos from last year',
    category: 'Personal',
    importance: 2,
    urgency: 1,
    impact: 2,
    effort: 4,
    estimatedTime: 180,
    status: 'incomplete',
    createdAt: new Date('2024-01-09'),
    modifiedAt: new Date('2024-01-09'),
    yearAssignment: 2024,
    monthAssignment: 1,
  },
  {
    id: '9',
    title: 'Prepare presentation for team meeting',
    description: 'Create slides on new project methodology and implementation plan',
    category: 'Work',
    importance: 4,
    urgency: 4,
    impact: 3,
    effort: 2,
    estimatedTime: 120,
    status: 'complete',
    createdAt: new Date('2024-01-08'),
    modifiedAt: new Date('2024-01-10'),
    deadline: new Date('2024-01-11'),
    yearAssignment: 2024,
    monthAssignment: 1,
  },
  {
    id: '10',
    title: 'Research investment opportunities',
    description: 'Analyze market trends and identify potential growth sectors',
    category: 'Finance',
    importance: 3,
    urgency: 2,
    impact: 4,
    effort: 3,
    estimatedTime: 150,
    status: 'incomplete',
    createdAt: new Date('2024-01-07'),
    modifiedAt: new Date('2024-01-07'),
    yearAssignment: 2024,
    monthAssignment: 1,
  },
];

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'modifiedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
    
    setTasks(prev => [...prev, newTask]);
    
    toast({
      title: "Task Created",
      description: `"${newTask.title}" has been added to your task list.`,
      variant: "default",
    });
  };

  const handleUpdateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'modifiedAt'>) => {
    if (!selectedTask) return;
    
    const updatedTask: Task = {
      ...taskData,
      id: selectedTask.id,
      createdAt: selectedTask.createdAt,
      modifiedAt: new Date(),
    };
    
    setTasks(prev => prev.map(task => 
      task.id === selectedTask.id ? updatedTask : task
    ));
    
    setSelectedTask(null);
    
    toast({
      title: "Task Updated",
      description: `"${updatedTask.title}" has been updated successfully.`,
      variant: "default",
    });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8">
        <ProductivityDashboard
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onCreateTask={() => {/* This will be handled by the dialog trigger */}}
        />
        
        {/* Task Creation Dialog */}
        <TaskFormDialog
          onSave={handleCreateTask}
        />
        
        {/* Task Edit Dialog */}
        {selectedTask && (
          <TaskFormDialog
            task={selectedTask}
            onSave={handleUpdateTask}
            trigger={<div />} // Hidden trigger since we control open state
          />
        )}
      </div>
    </div>
  );
};

export default Index;