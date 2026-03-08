export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  website: string | null
  github: string | null
  twitter: string | null
  linkedin: string | null
  instagram: string | null
  discord: string | null
  badges: string[]
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string
  color: string
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Post {
  id: string
  title: string
  content: string
  author_id: string
  category_id: string | null
  is_pinned: boolean
  is_locked: boolean
  view_count: number
  created_at: string
  updated_at: string
  // Joins
  author?: Profile
  category?: Category
  tags?: Tag[]
  comment_count?: number
  vote_score?: number
  user_vote?: number | null
}

export interface Comment {
  id: string
  content: string
  post_id: string
  author_id: string
  parent_id: string | null
  created_at: string
  updated_at: string
  // Joins
  author?: Profile
  vote_score?: number
  user_vote?: number | null
  replies?: Comment[]
}

export interface Vote {
  id: string
  user_id: string
  post_id: string | null
  comment_id: string | null
  vote_type: 1 | -1
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  actor_id: string
  type: 'comment' | 'reply' | 'upvote' | 'downvote' | 'mention'
  post_id: string | null
  comment_id: string | null
  is_read: boolean
  created_at: string
  // Joins
  actor?: Profile
  post?: Pick<Post, 'id' | 'title'>
}

export type VoteType = 1 | -1

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PostFilters {
  category?: string
  tag?: string
  search?: string
  sortBy?: 'latest' | 'top' | 'oldest'
}
