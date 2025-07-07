// components/EditableBio.tsx
'use client';

import React, { useState, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type EditableBioProps = {
  profileId: string;
  initialBio: string | null;
  onBioChange: (newBio: string) => void;
};

export function EditableBio({ profileId, initialBio, onBioChange }: EditableBioProps) {
  const [bio, setBio] = useState(initialBio || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ bio: bio.trim() })
      .eq('id', profileId);

    if (error) {
      console.error('Error updating bio:', error);
      toast.error('Failed to update bio.');
    } else {
      onBioChange(bio.trim());
      toast.success('Bio updated successfully!');
      setIsEditing(false);
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setBio(initialBio || '');
    setIsEditing(false);
  };

  return (
    <div className="mb-4 text-center">
      {isEditing ? (
        <div className="flex flex-col items-center gap-2">
          <Textarea
            value={bio}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
            className="w-full max-w-xs text-center resize-none"
            rows={3}
            disabled={isLoading}
            placeholder="Tell us about yourself..."
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isLoading}
              variant="outline"
              className="text-sm border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <p className="text-gray-700 whitespace-pre-line break-words">
            {initialBio || 'Click "Edit Bio" to add your story!'}
          </p>
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            className="text-blue-500 hover:text-blue-600 text-sm p-0 h-auto cursor-pointer"
          >
            Edit Bio
          </Button>
        </div>
      )}
    </div>
  );
}