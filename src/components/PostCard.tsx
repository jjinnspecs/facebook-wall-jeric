'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNowStrict } from 'date-fns';
import { Post } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ImageModal from '@/components/ImageModal';

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  const avatarUrl = post.profiles?.avatar_url || '/default-avatar.png';
  const username = post.profiles?.username || 'Facebook User';
  const timeAgo = formatDistanceToNowStrict(new Date(post.created_at), { addSuffix: true });
  const [activeImage, setActiveImage] = useState<string | null>(null);
  
  return (
    <Card className="w-full max-w-2xl mx-auto bg-white border border-gray-300 border-t-[4px] border-t-[#3B5998] rounded-sm shadow-none font-[Verdana] text-sm">
      <CardHeader className="flex items-start gap-3 px-4 py-3">
        <Avatar className="h-10 w-10 border border-gray-400 rounded-sm shrink-0">
          <AvatarImage src={avatarUrl} alt={`${username}'s avatar`} />
          <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <p className="font-bold text-[#3B5998] text-sm leading-tight">{username}</p>
          <p className="text-xs text-gray-600">{timeAgo}</p>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0">
        {post.body && (
          <p className="text-gray-900 text-sm mb-2 whitespace-pre-wrap leading-snug break-words">
            {post.body}
          </p>
        )}

        {post.image_urls && post.image_urls.length > 0 && (
        <div
            className={`grid gap-2 mt-2 ${
            post.image_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
            }`}
        >
            {post.image_urls.map((url, index) => (
            <div
                key={index}
                className="relative w-full h-[120px] sm:h-[140px] md:h-[160px] border border-gray-200 rounded-sm overflow-hidden cursor-pointer"
                onClick={() => setActiveImage(url)}
            >
                <Image
                src={url}
                alt={`Post image ${index + 1}`}
                fill
                className="object-cover transition-transform hover:scale-105"
                />
            </div>
            ))}
        </div>
        )}
        {activeImage && <ImageModal src={activeImage} onClose={() => setActiveImage(null)} />}

      </CardContent>
    </Card>
  );
}
