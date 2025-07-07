export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export type Post = {
  id: string;
  user_id: string;
  body: string | null;
  image_urls: string[] | null;
  created_at: string; // ISO string format
  profiles?: Profile;
};

export type PreviewImage = {
  file: File;
  url: string;
};