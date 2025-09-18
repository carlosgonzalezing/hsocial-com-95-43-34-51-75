
export interface ReelUser {
  id: string;
  username: string;
  avatar_url?: string | null;
}

export interface Reel {
  id: string;
  user: ReelUser;
  video_url: string;
  caption: string;
  likes_count?: number;
  comments_count?: number;
  is_muted?: boolean;
  created_at: string;
}
