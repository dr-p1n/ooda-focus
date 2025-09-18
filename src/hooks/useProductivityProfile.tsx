import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { UserProductivityProfile } from '@/types/productivity';
import { getDefaultProfile } from '@/utils/productivityPersonalities';
import { toast } from 'sonner';

export function useProductivityProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProductivityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user's productivity profile from localStorage for now
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load from localStorage for now
      const stored = localStorage.getItem(`productivity-profile-${user.id}`);
      if (stored) {
        const profileData = JSON.parse(stored);
        setProfile(profileData);
      } else {
        // Create default profile
        const defaultProfile = getDefaultProfile(user.id);
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading productivity profile:', error);
      toast.error('Failed to load productivity settings');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (profileData: Partial<UserProductivityProfile>) => {
    if (!user || !profileData) return false;

    try {
      setSaving(true);
      
      // Save to localStorage for now
      const updatedProfile = { ...profile, ...profileData };
      localStorage.setItem(`productivity-profile-${user.id}`, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      
      toast.success('Productivity settings saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving productivity profile:', error);
      toast.error('Failed to save productivity settings');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (!user) return;
    
    const defaultProfile = getDefaultProfile(user.id);
    setProfile(defaultProfile);
  };

  return {
    profile,
    loading,
    saving,
    saveProfile,
    resetToDefaults,
    refreshProfile: loadProfile,
  };
}