'use client';

import React, { useState, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type EditableNameProps = {
  profileId: string;
  initialName: string | null;
  onNameChange: (newName: string) => void;
};

export function EditableName({ profileId, initialName, onNameChange }: EditableNameProps) {
  const [name, setName] = useState(initialName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    setIsLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username: name.trim() })
      .eq('id', profileId);

    if (error) {
      console.error('Error updating name:', error);
      toast.error('Failed to update name.');
    } else {
      onNameChange(name.trim());
      toast.success('Name updated successfully!');
      setIsEditing(false);
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setName(initialName || '');
    setIsEditing(false);
  };

  return (
    <div className="mb-4 text-center">
      {isEditing ? (
        <div className="flex flex-col items-center gap-2">
          <Input
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="w-full max-w-xs text-center"
            disabled={isLoading}
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
          <h3 className="text-2xl font-bold text-blue-700">
            {initialName || 'Set Your Name'}
          </h3>
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            className="text-blue-500 hover:text-blue-600 text-sm p-0 h-auto cursor-pointer"
          >
            Edit Name
          </Button>
        </div>
      )}
    </div>
  );
}