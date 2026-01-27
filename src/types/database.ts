/**
 * Database Type Definitions
 * @description Types for database entities and operations
 */

import type { UUID } from './validation';

/**
 * Base database entity with common fields
 */
export interface BaseEntity {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User entity
 */
export interface User extends BaseEntity {
  email: string;
  name?: string;
  image?: string;
  emailVerified?: Date;
  role: 'admin' | 'moderator' | 'user';
  isActive: boolean;
}

/**
 * Comic entity
 */
export interface Comic extends BaseEntity {
  title: string;
  description?: string;
  coverImage?: string;
  slug: string;
  status: 'Ongoing' | 'Completed' | 'OnHold';
  authorId: UUID;
  artistId?: UUID;
  views: number;
  rating: number;
  isPublished: boolean;
}

/**
 * Chapter entity
 */
export interface Chapter extends BaseEntity {
  comicId: UUID;
  title: string;
  description?: string;
  number: number;
  content?: string;
  images?: string[];
  isPublished: boolean;
  publishedAt?: Date;
}

/**
 * Comment entity
 */
export interface Comment extends BaseEntity {
  userId: UUID;
  comicId?: UUID;
  chapterId?: UUID;
  content: string;
  likes: number;
  isApproved: boolean;
  parentCommentId?: UUID;
}

/**
 * Bookmark/Favorite entity
 */
export interface Bookmark extends BaseEntity {
  userId: UUID;
  comicId: UUID;
  notes?: string;
  isPrivate: boolean;
}

/**
 * Author entity
 */
export interface Author extends BaseEntity {
  name: string;
  description?: string;
  avatar?: string;
  biography?: string;
  website?: string;
  socialMedia?: {
    twitter?: string;
    instagram?: string;
    discord?: string;
  };
}

/**
 * Artist entity
 */
export interface Artist extends BaseEntity {
  name: string;
  description?: string;
  avatar?: string;
  biography?: string;
  portfolio?: string;
  website?: string;
}

/**
 * Genre entity
 */
export interface Genre extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  comicCount: number;
}

/**
 * Content Type entity
 */
export interface ContentType extends BaseEntity {
  name: 'Manga' | 'Manhwa' | 'Manhua' | 'Comic' | 'Light Novel';
  description?: string;
}

/**
 * Database query options
 */
export interface DbQueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  include?: string[];
}

/**
 * Database mutation result
 */
export interface DbMutationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Batch operation result
 */
export interface BatchOperationResult {
  total: number;
  success: number;
  failed: number;
  errors?: string[];
}
