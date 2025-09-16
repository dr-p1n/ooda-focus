import { useState } from 'react';
import { Task, Project } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskFormDialogProps {
  task?: Task;
  trigger?: React.ReactNode;
  projects: Project[];
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'modifiedAt'>) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskFormDialog({ task, trigger, projects, onSave, onDelete }: TaskFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [category, setCategory] = useState(task?.category || 'Work');
  const [notes, setNotes] = useState(task?.notes || '');
  const [projectId, setProjectId] = useState(task?.project_id || '');
  const [importance, setImportance] = useState([task?.importance || 3]);
  const [urgency, setUrgency] = useState([task?.urgency || 3]);
  const [impact, setImpact] = useState([task?.impact || 3]);
  const [effort, setEffort] = useState([task?.effort || 3]);
  const [estimatedTime, setEstimatedTime] = useState([task?.estimatedTime || 60]);
  const [status, setStatus] = useState<Task['status']>(task?.status || 'incomplete');
  const [deadline, setDeadline] = useState<Date | undefined>(task?.deadline);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title,
      description,
      category,
      notes,
      project_id: projectId || undefined,
      user_id: '', // This will be set by the parent component
      importance: importance[0],
      urgency: urgency[0],
      impact: impact[0],
      effort: effort[0],
      estimatedTime: estimatedTime[0],
      status: status as Task['status'],
      deadline,
      yearAssignment: new Date().getFullYear(),
      monthAssignment: new Date().getMonth() + 1,
    });
    setOpen(false);
  };

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update task details and scoring' : 'Create a new task with detailed scoring'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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

            <div className="grid gap-2">
              <Label htmlFor="project">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project (optional)" />
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
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Importance: {importance[0]}</Label>
              <Slider
                value={importance}
                onValueChange={setImportance}
                max={5}
                min={1}
                step={1}
              />
            </div>
            <div className="grid gap-2">
              <Label>Urgency: {urgency[0]}</Label>
              <Slider
                value={urgency}
                onValueChange={setUrgency}
                max={5}
                min={1}
                step={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Impact: {impact[0]}</Label>
              <Slider
                value={impact}
                onValueChange={setImpact}
                max={5}
                min={1}
                step={1}
              />
            </div>
            <div className="grid gap-2">
              <Label>Effort: {effort[0]}</Label>
              <Slider
                value={effort}
                onValueChange={setEffort}
                max={5}
                min={1}
                step={1}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Estimated Time: {estimatedTime[0]} minutes</Label>
            <Slider
              value={estimatedTime}
              onValueChange={setEstimatedTime}
              max={480}
              min={15}
              step={15}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as Task['status'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incomplete">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Deadline (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <div>
            {task && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the task.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}