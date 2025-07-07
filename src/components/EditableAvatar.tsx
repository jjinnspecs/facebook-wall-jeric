'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type EditableAvatarProps = {
  profileId: string;
  initialAvatarUrl: string | null;
  onAvatarChange: (newUrl: string | null) => void;
};

const DEFAULT_AVATAR_PATH = '/default-avatar.jpg';

export function EditableAvatar({
  profileId,
  initialAvatarUrl,
  onAvatarChange,
}: EditableAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (initialAvatarUrl && initialAvatarUrl !== avatarUrl) {
      setAvatarUrl(initialAvatarUrl);
    }
  }, [initialAvatarUrl]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    setIsUploading(true);
    const fileName = `${profileId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar.');
      setIsUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    const newPublicUrl = publicUrlData.publicUrl;

    // Update profile in DB
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: newPublicUrl })
      .eq('id', profileId);

    if (updateError) {
      console.error('Error updating avatar URL in DB:', updateError);
      toast.error('Failed to save avatar URL.');
      setIsUploading(false);
      return;
    }

    setAvatarUrl(newPublicUrl);
    onAvatarChange(newPublicUrl);
    toast.success('Avatar updated successfully!');
    setIsUploading(false);
  };

  const displayUrl = avatarUrl || DEFAULT_AVATAR_PATH;

  return (
    <div className="flex flex-col items-center gap-2 mb-4">
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-blue-400">
        <Image
          src={displayUrl}
          alt="Avatar"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }} 
          className="rounded-full"
          priority
          onError={(e) => {

            (e.target as HTMLImageElement).src = DEFAULT_AVATAR_PATH;
          }}
        />
      </div>
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        disabled={isUploading}
      />


      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full text-sm bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
      >
        {isUploading ? 'Uploading...' : 'Change Avatar'}
      </Button>
      {isUploading && <p className="text-sm text-gray-500">Uploading...</p>}
    </div>
  );
}