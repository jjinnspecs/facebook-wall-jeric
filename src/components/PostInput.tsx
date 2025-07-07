'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ImagePreview } from './ImagePreview';
import { PreviewImage, Post } from '@/types';
import { toast } from 'sonner';
import { ImageIcon, Loader2 } from 'lucide-react';

const MAX_CHARS = 280;
const MAX_IMAGES = 4;

type PostInputProps = {
  profileId: string;
  onPostCreated: (newPost: Post) => void;
  onPostCountChange: (newCount: number) => void;
};

export function PostInput({ profileId, onPostCreated, onPostCountChange }: PostInputProps) {
  const [body, setBody] = useState<string>('');
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = body.length;
  const charColor =
    charCount > MAX_CHARS ? 'text-red-500' : charCount > MAX_CHARS * 0.8 ? 'text-orange-500' : 'text-gray-500';

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`You can only upload up to ${MAX_IMAGES} images.`);
      return;
    }

    const newPreviewImages: PreviewImage[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`File "${file.name}" is not an image.`);
        continue;
      }
      newPreviewImages.push({
        file: file,
        url: URL.createObjectURL(file),
      });
    }

    setImages((prev) => [...prev, ...newPreviewImages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSharePost = async () => {
    if (!body.trim() && images.length === 0) {
      toast.error('Post cannot be empty.');
      return;
    }
    if (charCount > MAX_CHARS) {
      toast.error(`Message exceeds ${MAX_CHARS} characters.`);
      return;
    }

    setIsSubmitting(true);
    let imageUrls: string[] = [];

    try {
      if (images.length > 0) {
        const uploadPromises = images.map(async (img) => {
          const filePath = `${profileId}/posts/${Date.now()}-${img.file.name}`;
          const { data, error } = await supabase.storage
            .from('post-images')
            .upload(filePath, img.file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (error) throw new Error(`Failed to upload image ${img.file.name}: ${error.message}`);

          const { data: publicUrlData } = supabase.storage
            .from('post-images')
            .getPublicUrl(data.path);
          return publicUrlData.publicUrl;
        });

        imageUrls = await Promise.all(uploadPromises);
      }

      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: profileId,
          body: body.trim(),
          image_urls: imageUrls.length > 0 ? imageUrls : null,
        })
        .select()
        .single();

      if (postError) throw new Error(`Failed to create post: ${postError.message}`);

      toast.success('Post shared successfully!');
      setBody('');
      setImages([]);
      onPostCreated(newPost);
      onPostCountChange(1);
    } catch (error: any) {
      console.error('Error sharing post:', error);
      toast.error(error.message || 'Failed to share post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-sm p-4 shadow-sm font-sans text-sm max-w-xl mx-auto">
      <h3 className="text-[#3b5998] font-semibold text-sm mb-2">What’s on your mind?</h3>

      <Textarea
        placeholder="Write something..."
        value={body}
        onChange={handleTextChange}
        rows={3}
        maxLength={MAX_CHARS + 50}
        disabled={isSubmitting}
        className="w-full resize-y border border-gray-300 focus-visible:ring-1 focus-visible:ring-blue-500 text-sm"
      />

      <div className="flex justify-between items-center mt-2">
        <span className={`text-xs ${charColor}`}>{charCount} / {MAX_CHARS}</span>

        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          ref={fileInputRef}
          className="hidden"
          disabled={isSubmitting || images.length >= MAX_IMAGES}
        />

        <Label
          htmlFor="image-upload"
          className={`text-xs cursor-pointer text-blue-600 hover:underline ${
            isSubmitting || images.length >= MAX_IMAGES ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <ImageIcon className="inline h-3 w-3 mr-1" /> Add Photos
        </Label>
      </div>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {images.map((img, index) => (
            <ImagePreview key={index} image={img} onRemove={() => handleRemoveImage(index)} />
          ))}
        </div>
      )}

      <Button
        onClick={handleSharePost}
        disabled={isSubmitting || (!body.trim() && images.length === 0) || charCount > MAX_CHARS}
        className="w-full mt-4 bg-[#3b5998] hover:bg-[#334d84] text-white text-sm rounded-sm cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sharing...
          </>
        ) : (
          'Share'
        )}
      </Button>
    </div>
  );
}
