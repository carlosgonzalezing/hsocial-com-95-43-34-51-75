export interface Post {
  id: string;
  content?: string | null;
  user_id: string;
  author_id?: string; // Add author_id as optional since some code uses it
  media_url?: string | null;
  media_type?: string | null;
  visibility: 'public' | 'friends' | 'private' | 'incognito';
  created_at: string;
  updated_at: string;
  shared_post_id?: string | null;
  shared_from?: string | null;
  shared_post?: Post | null;
  profiles?: {
    username?: string;
    avatar_url?: string;
    id?: string;
  } | null;
  poll?: Poll | null;
  idea?: Idea | null;
  marketplace?: Marketplace | null;
  post_type?: string | null;
  is_pinned?: boolean | null;
  reactions?: ReactionSummary | any[]; // Allow both formats for flexibility
  reactions_count?: number;
  user_reaction?: string | null;
  comments_count?: number;
  userHasReacted?: boolean; // Add missing property
  content_style?: ContentStyle | null; // Add content style for background/text formatting
}

export interface ContentStyle {
  backgroundKey: string;
  textColor: string;
  isTextOnly: boolean;
}

export interface ReactionSummary {
  count: number;
  by_type: Record<string, number>;
}

export interface Poll {
  question: string;
  options: Array<PollOption>;
  total_votes: number;
  user_vote: string | null;
}

export interface PollOption {
  id: string;
  content: string;
  text?: string; // Add text property for compatibility
  votes: number;
}

export interface Idea {
  id?: string;
  title: string;
  description: string;
  user_id?: string;
  participants: Array<IdeaParticipant>;
  needed_roles?: Array<NeededRole>;
  project_phase?: 'ideation' | 'planning' | 'execution' | 'launch' | 'scaling';
  category?: string;
  estimated_duration?: string;
  expected_impact?: string;
  resources_needed?: Array<string>;
  collaboration_type?: 'remote' | 'hybrid' | 'in-person';
  location_preference?: string;
}

export interface NeededRole {
  title: string;
  description: string;
  skills_desired?: Array<string>;
  commitment_level: 'low' | 'medium' | 'high';
  is_filled?: boolean;
}

export interface IdeaParticipant {
  user_id: string;
  profession: string;
  joined_at: string;
  username?: string;
  avatar_url?: string;
}

export interface Marketplace {
  id?: string;
  title: string;
  description: string;
  subject: string;
  price: number;
  document_preview_url?: string;
  document_full_url?: string;
  contact_info?: string;
  seller_id?: string;
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  parent_id?: string | null;
  created_at: string;
  updated_at: string;
  media_url?: string | null;
  media_type?: string | null;
  profiles?: {
    username?: string;
    avatar_url?: string;
    id?: string;
  } | null;
  reactions?: any[];
  user_reaction?: string | null;
  likes_count?: number; // Add missing property
  replies?: Comment[]; // Add missing property for nested comments
}

export interface CreatePostData {
  content?: string;
  media_url?: string;
  media_type?: string;
  visibility?: 'public' | 'friends' | 'private' | 'incognito';
  poll?: Poll;
  idea?: Idea;
}
