import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserPlus, Send, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectInviteDialogProps {
  projectId: string;
  projectName: string;
  onInvite: (projectId: string, email: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export function ProjectInviteDialog({ projectId, projectName, onInvite, trigger }: ProjectInviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onInvite(projectId, email.trim());
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${email} for project "${projectName}".`,
      });
      setEmail('');
      setOpen(false);
    } catch (error) {
      toast({
        title: "Failed to Send Invitation",
        description: "There was an error sending the invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateInviteLink = () => {
    // Generate a shareable invite link for the project
    const inviteLink = `${window.location.origin}/project/invite/${projectId}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link Copied",
      description: "Project invite link copied to clipboard.",
    });
  };

  const handleCancel = () => {
    setEmail('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Collaborators to Project</DialogTitle>
          <DialogDescription>
            Invite people to collaborate on "{projectName}"
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address..."
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={generateInviteLink}
              className="flex-1"
            >
              <Link className="h-4 w-4 mr-2" />
              Copy Invite Link
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleInvite} disabled={!email.trim() || isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}