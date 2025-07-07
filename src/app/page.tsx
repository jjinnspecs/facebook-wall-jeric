'use client';

import { useState, useEffect, useCallback } from 'react'; 
import { supabase } from '@/lib/supabase';
import { Profile, Post } from '@/types';

import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area'; 


import { SidebarProfile } from '@/components/SidebarProfile';
import { PostInput } from '@/components/PostInput';
import { PostCard } from '@/components/PostCard';


import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const DEFAULT_PROFILE_ID = "ef26dd17-d200-4cda-b18d-65fb7ff825de"; 

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postCount, setPostCount] = useState<number>(0);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (id: string) => {
    setIsLoadingProfile(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error.message);

      if (error.code === 'PGRST116') {
        console.warn(`Profile with ID ${id} not found. Creating a temporary profile for posting.`);
        setProfile({
          id: id,
          username: `retro_user_${id.substring(0, 8)}`,
          avatar_url: '/default-avatar.png',
          bio: 'Welcome to RetroWall! Edit your profile.',
        });
        toast.warning('Profile not found, a temporary one was created for you. You can edit it!');
      } else {
        toast.error('Failed to load profile. Check console for details.');
        setProfile(null);
        setError(error.message);
      }
    } else if (data) {
      setProfile(data);
    }
    setIsLoadingProfile(false);
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (
          id, username, avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error.message);
      toast.error('Failed to load posts.');
      setPosts([]);
      setError(error.message);
    } else if (data) {
      setPosts(data as Post[]);
    }
    setIsLoadingPosts(false);
  }, []);

  const handlePostCreated = useCallback((newPost: Post) => {

    const postWithProfile: Post = {
        ...newPost,
        profiles: profile ?? undefined,
    };
    setPosts(prevPosts => [postWithProfile, ...prevPosts]);
  }, [profile]);


  const handlePostCountChange = useCallback((newCount: number) => {
    setProfile(prev => prev ? { ...prev, post_count: newCount } : null);
  }, []);


  useEffect(() => {

    if (DEFAULT_PROFILE_ID) {
        fetchProfile(DEFAULT_PROFILE_ID);
    } else {
        console.warn("DEFAULT_PROFILE_ID is not set in app/page.tsx. Profile and posting functionality may be limited.");
        setIsLoadingProfile(false);
        setProfile(null);
        setError("Please set DEFAULT_PROFILE_ID in app/page.tsx with a valid UUID.");
    }
    fetchPosts();
  }, [fetchProfile, fetchPosts, DEFAULT_PROFILE_ID]);

  if (isLoadingProfile || isLoadingPosts) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#E9EBF1] font-sans text-gray-800">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-blue-700">Loading Facebook...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-50 font-sans text-gray-800">
        <p className="text-red-700 p-4 border border-red-300 rounded-md bg-red-100 text-center">
          Fatal Error: {error || "Profile data not available. Please ensure DEFAULT_PROFILE_ID is set correctly and Supabase is configured."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E9EBF1] p-4 font-sans text-gray-800">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row gap-4">

        <aside className="w-full md:w-1/4">
          <Card className="p-4 bg-white border-blue-200 border-1 shadow-sm">
            <CardContent className="flex flex-col items-center p-0">

              <SidebarProfile
                initialProfile={profile}
              />
            </CardContent>
          </Card>
        </aside>

        <main className="w-full md:w-3/4">
          <Card className="p-4 bg-white border-blue-200 border-1 shadow-sm">
            <CardContent className="p-0">
              <PostInput
                profileId={profile.id}
                onPostCreated={handlePostCreated}
                onPostCountChange={handlePostCountChange}
              />

              <h2 className="text-2xl font-bold text-blue-800 mt-6 mb-4 border-b pb-2">Wall Feed</h2>

              {posts.length === 0 ? (
                <p className="text-center text-gray-500 text-lg py-10">
                  No posts yet! Be the first one to share your thoughts.
                </p>
              ) : (

                <ScrollArea className="h-[calc(100vh-200px)] w-full pr-4"> 
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
