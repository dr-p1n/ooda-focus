import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PRODUCTIVITY_PERSONALITIES, getPersonalityById } from '@/utils/productivityPersonalities';
import { useProductivityProfile } from '@/hooks/useProductivityProfile';
import { UserProductivityProfile } from '@/types/productivity';
import { Loader2 } from 'lucide-react';

interface ProductivityConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductivityConfigDialog({ open, onOpenChange }: ProductivityConfigDialogProps) {
  const { profile, saving, saveProfile, resetToDefaults } = useProductivityProfile();
  const [selectedPersonality, setSelectedPersonality] = useState('');
  const [currentProfile, setCurrentProfile] = useState<UserProductivityProfile | null>(profile);

  // Update local state when profile changes
  useEffect(() => {
    if (profile) {
      setCurrentProfile(profile);
      setSelectedPersonality(profile.basedOnTemplate);
    }
  }, [profile]);

  const handlePersonalitySelect = (personalityId: string) => {
    const personality = getPersonalityById(personalityId);
    if (!personality || !currentProfile) return;

    setSelectedPersonality(personalityId);
    setCurrentProfile({
      ...currentProfile,
      basedOnTemplate: personalityId,
      scoringWeights: { ...personality.scoringWeights },
      schedulingPreferences: { ...personality.schedulingPreferences },
      energyCurve: [...personality.energyCurve],
    });
  };

  const handleWeightChange = (key: keyof typeof currentProfile.scoringWeights, value: number[]) => {
    if (!currentProfile) return;
    
    setCurrentProfile({
      ...currentProfile,
      scoringWeights: {
        ...currentProfile.scoringWeights,
        [key]: value[0]
      }
    });
  };

  const handleSchedulingChange = (key: keyof typeof currentProfile.schedulingPreferences, value: any) => {
    if (!currentProfile) return;
    
    setCurrentProfile({
      ...currentProfile,
      schedulingPreferences: {
        ...currentProfile.schedulingPreferences,
        [key]: value
      }
    });
  };

  const handleSave = async () => {
    if (!currentProfile) return;
    
    const success = await saveProfile(currentProfile);
    if (success) {
      onOpenChange(false);
    }
  };

  if (!currentProfile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Productivity Configuration</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personalities" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personalities">Personalities</TabsTrigger>
            <TabsTrigger value="weights">Scoring Weights</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="personalities" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRODUCTIVITY_PERSONALITIES.map((personality) => (
                <Card 
                  key={personality.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPersonality === personality.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handlePersonalitySelect(personality.id)}
                >
                  <CardHeader className="text-center">
                    <div className="text-3xl mb-2">{personality.icon}</div>
                    <CardTitle className="text-lg">{personality.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {personality.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(currentProfile.scoringWeights).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()} ({value.toFixed(1)})
                  </Label>
                  <Slider
                    value={[value]}
                    onValueChange={(val) => handleWeightChange(key as any, val)}
                    min={0.1}
                    max={3.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Algorithm</Label>
                <Select 
                  value={currentProfile.schedulingPreferences.algorithm}
                  onValueChange={(value) => handleSchedulingChange('algorithm', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weighted">Weighted Score</SelectItem>
                    <SelectItem value="matrixHybrid">Matrix Hybrid</SelectItem>
                    <SelectItem value="oodaOptimized">OODA Optimized</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Tasks Per Day</Label>
                <Input
                  type="number"
                  value={currentProfile.schedulingPreferences.maxTasksPerDay}
                  onChange={(e) => handleSchedulingChange('maxTasksPerDay', parseInt(e.target.value))}
                  min={1}
                  max={20}
                />
              </div>

              <div className="space-y-2">
                <Label>Working Hours Start</Label>
                <Input
                  type="time"
                  value={currentProfile.schedulingPreferences.workingHoursStart}
                  onChange={(e) => handleSchedulingChange('workingHoursStart', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Working Hours End</Label>
                <Input
                  type="time"
                  value={currentProfile.schedulingPreferences.workingHoursEnd}
                  onChange={(e) => handleSchedulingChange('workingHoursEnd', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Max Cognitive Hours</Label>
                <Input
                  type="number"
                  value={currentProfile.schedulingPreferences.maxCognitiveHours}
                  onChange={(e) => handleSchedulingChange('maxCognitiveHours', parseInt(e.target.value))}
                  min={1}
                  max={12}
                />
              </div>

              <div className="space-y-2">
                <Label>Deep Work Blocks</Label>
                <Input
                  type="number"
                  value={currentProfile.schedulingPreferences.deepWorkBlocks}
                  onChange={(e) => handleSchedulingChange('deepWorkBlocks', parseInt(e.target.value))}
                  min={0}
                  max={6}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={currentProfile.schedulingPreferences.preferBatching}
                  onCheckedChange={(checked) => handleSchedulingChange('preferBatching', checked)}
                />
                <Label>Prefer Task Batching</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={currentProfile.schedulingPreferences.energyManagement}
                  onCheckedChange={(checked) => handleSchedulingChange('energyManagement', checked)}
                />
                <Label>Enable Energy Management</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Name</Label>
                <Input
                  value={currentProfile.profileName}
                  onChange={(e) => setCurrentProfile({...currentProfile, profileName: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Completion Rate Target (%)</Label>
                <Input
                  type="number"
                  value={(currentProfile.completionRateTarget * 100).toFixed(0)}
                  onChange={(e) => setCurrentProfile({
                    ...currentProfile, 
                    completionRateTarget: parseInt(e.target.value) / 100
                  })}
                  min={10}
                  max={100}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={currentProfile.adaptiveLearningEnabled}
                  onCheckedChange={(checked) => setCurrentProfile({
                    ...currentProfile, 
                    adaptiveLearningEnabled: checked
                  })}
                />
                <Label>Enable Adaptive Learning</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={currentProfile.autoAdjustWeights}
                  onCheckedChange={(checked) => setCurrentProfile({
                    ...currentProfile, 
                    autoAdjustWeights: checked
                  })}
                />
                <Label>Auto-Adjust Weights</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}