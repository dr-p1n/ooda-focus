import { useState } from 'react';
import { Task } from '@/types/task';
import { SimplifiedDashboard } from '@/components/SimplifiedDashboard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// Sample data for demonstration
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Complete quarterly financial review',
    description: 'Analyze Q3 performance metrics and prepare strategic recommendations for Q4',
    category: 'Work',
    importance: 3,
    urgency: 3,
    impact: 3,
    effort: 2,
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
    importance: 3,
    urgency: 1,
    impact: 3,
    effort: 3,
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
    importance: 3,
    urgency: 1,
    impact: 3,
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
    urgency: 3,
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
    importance: 1,
    urgency: 1,
    impact: 2,
    effort: 1,
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
    importance: 2,
    urgency: 1,
    impact: 3,
    effort: 2,
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
    importance: 3,
    urgency: 2,
    impact: 3,
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
    importance: 1,
    urgency: 1,
    impact: 1,
    effort: 3,
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
    importance: 3,
    urgency: 3,
    impact: 2,
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
    importance: 2,
    urgency: 1,
    impact: 3,
    effort: 2,
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
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8">
        {/* User Menu */}
        <div className="flex justify-end mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                {user?.email}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <SimplifiedDashboard
          tasks={tasks}
          onTaskUpdate={setTasks}
        />
      </div>
    </div>
  );
};

export default Index;