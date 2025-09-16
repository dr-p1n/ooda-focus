import { useState } from 'react';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Target, Zap, Weight, Clock, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskFormDialogProps {
  task?: Task;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'modifiedAt'>) => void;
  onDelete?: (taskId: string) => void;
  trigger?: React.ReactNode;
}

export function TaskFormDialog({ task, onSave, onDelete, trigger }: TaskFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    category: task?.category || 'Work',
    notes: task?.notes || '',
    importance: task?.importance || 2,
    urgency: task?.urgency || 2,
    impact: task?.impact || 2,
    effort: task?.effort || 2,
    estimatedTime: task?.estimatedTime || 60,
    status: task?.status || 'incomplete' as const,
    deadline: task?.deadline,
    yearAssignment: task?.yearAssignment || new Date().getFullYear(),
    monthAssignment: task?.monthAssignment || new Date().getMonth() + 1,
    weekAssignment: task?.weekAssignment,
  });

  const categories = [
    'Work', 'Personal', 'Learning', 'Health', 'Finance', 
    'Creative', 'Maintenance', 'Strategic'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      ...formData,
      scheduledDate: formData.deadline,
    });
    
    setOpen(false);
    
    // Reset form if creating new task
    if (!task) {
      setFormData({
        title: '',
        description: '',
        category: 'Work',
        notes: '',
        importance: 2,
        urgency: 2,
        impact: 2,
        effort: 2,
        estimatedTime: 60,
        status: 'incomplete',
        deadline: undefined,
        yearAssignment: new Date().getFullYear(),
        monthAssignment: new Date().getMonth() + 1,
        weekAssignment: undefined,
      });
    }
  };

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
      setOpen(false);
    }
  };

  const calculatePreviewScore = () => {
    return formData.importance + formData.urgency + formData.impact - formData.effort;
  };

  const getScoreColor = (score: number) => {
    if (score >= 6) return 'text-danger';
    if (score >= 4) return 'text-warning';
    if (score >= 2) return 'text-success';
    return 'text-muted-foreground';
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="What needs to be done?"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => 
                  setFormData({...formData, category: value})
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => 
                  setFormData({...formData, status: value as any})
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incomplete">Incomplete</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Provide more details about this task..."
                rows={2}
              />
            </div>
          </div>

          {/* Scoring System */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Task Scoring
              </CardTitle>
              <Badge variant="outline" className={cn("font-mono w-fit", getScoreColor(calculatePreviewScore()))}>
                Priority Score: {calculatePreviewScore()}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-analytics" />
                    Importance: {formData.importance}/3
                  </Label>
                  <Slider
                    value={[formData.importance]}
                    onValueChange={([value]) => setFormData({...formData, importance: value})}
                    min={1}
                    max={3}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    1: Low • 2: Medium • 3: High
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-danger" />
                    Urgency: {formData.urgency}/3
                  </Label>
                  <Slider
                    value={[formData.urgency]}
                    onValueChange={([value]) => setFormData({...formData, urgency: value})}
                    min={1}
                    max={3}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    1: Can wait • 2: Soon • 3: Urgent
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-success" />
                    Impact: {formData.impact}/3
                  </Label>
                  <Slider
                    value={[formData.impact]}
                    onValueChange={([value]) => setFormData({...formData, impact: value})}
                    min={1}
                    max={3}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    1: Small • 2: Moderate • 3: High impact
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-warning" />
                    Effort: {formData.effort}/3
                  </Label>
                  <Slider
                    value={[formData.effort]}
                    onValueChange={([value]) => setFormData({...formData, effort: value})}
                    min={1}
                    max={3}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    1: Easy • 2: Moderate • 3: Difficult
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Estimated Time: {formatTime(formData.estimatedTime)}
                </Label>
                <Slider
                  value={[formData.estimatedTime]}
                  onValueChange={([value]) => setFormData({...formData, estimatedTime: value})}
                  min={15}
                  max={480}
                  step={15}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Optional Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Deadline (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline ? format(formData.deadline, "PPP") : "Set deadline"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.deadline}
                    onSelect={(date) => setFormData({...formData, deadline: date})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div>
              {task && onDelete && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-primary">
                {task ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}