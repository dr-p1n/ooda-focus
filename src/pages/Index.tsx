import { useState } from 'react';
import { Task } from '@/types/task';
import { SimplifiedDashboard } from '@/components/SimplifiedDashboard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, Loader2, UserPlus } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import Auth from './Auth';

// Sample data for demonstration
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Review quarterly goals',
    description: '',
    category: 'Work',
    user_id: 'sample-user',
    importance: 3,
    urgency: 3,
    impact: 3,
    effort: 2,
    estimatedTime: 120,
    status: 'incomplete',
    createdAt: new Date(),
    modifiedAt: new Date(),
    yearAssignment: new Date().getFullYear(),
    monthAssignment: new Date().getMonth() + 1,
  },
  {
    id: '2',
    title: 'Learn new skill',
    description: '',
    category: 'Learning',
    user_id: 'sample-user',
    importance: 3,
    urgency: 1,
    impact: 3,
    effort: 2,
    estimatedTime: 180,
    status: 'incomplete',
    createdAt: new Date(),
    modifiedAt: new Date(),
    yearAssignment: new Date().getFullYear(),
    monthAssignment: new Date().getMonth() + 1,
  },
  {
    id: '3',
    title: 'Quick email response',
    description: '',
    category: 'Work',
    user_id: 'sample-user',
    importance: 2,
    urgency: 3,
    impact: 2,
    effort: 1,
    estimatedTime: 30,
    status: 'incomplete',
    createdAt: new Date(),
    modifiedAt: new Date(),
    yearAssignment: new Date().getFullYear(),
    monthAssignment: new Date().getMonth() + 1,
  },
];

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();

  // Redirect to auth if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

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
              <DropdownMenuItem onClick={() => {
                const inviteLink = window.location.origin;
                navigator.clipboard.writeText(inviteLink);
                toast({
                  title: "Invite Link Copied",
                  description: "Share this link to invite others to join Agenta.",
                });
              }}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Users
              </DropdownMenuItem>
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