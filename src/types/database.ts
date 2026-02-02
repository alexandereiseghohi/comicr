import { type UUID } from "./validation";

/**
 * Base database entity with common fields
 */
export interface BaseEntity {
  createdAt: Date;
  id: UUID;
  updatedAt: Date;
}

/**
 * User entity
 */
export interface User extends BaseEntity {
  email: string;
  emailVerified?: Date;
  image?: string;
  isActive: boolean;
  name?: string;
  role: "admin" | "moderator" | "user";
}

/**
 * Comic entity
 */
export interface Comic extends BaseEntity {
  artistId?: UUID;
  authorId: UUID;
  coverImage?: string;
  description?: string;
  isPublished: boolean;
  rating: number;
  slug: string;
  status: "Completed" | "Ongoing" | "OnHold";
  title: string;
  views: number;
}

/**
 * Chapter entity
 */
export interface Chapter extends BaseEntity {
  comicId: UUID;
  content?: string;
  description?: string;
  images?: string[];
  isPublished: boolean;
  number: number;
  publishedAt?: Date;
  title: string;
}

/**
 * Comment entity
 */
export interface Comment extends BaseEntity {
  chapterId?: UUID;
  comicId?: UUID;
  content: string;
  isApproved: boolean;
  likes: number;
  parentCommentId?: UUID;
  userId: UUID;
}

/**
 * Bookmark/Favorite entity
 */
export interface Bookmark extends BaseEntity {
  comicId: UUID;
  isPrivate: boolean;
  notes?: string;
  userId: UUID;
}

/**
 * Author entity
 */
export interface Author extends BaseEntity {
  avatar?: string;
  biography?: string;
  description?: string;
  name: string;
  socialMedia?: {
    discord?: string;
    instagram?: string;
    twitter?: string;
  };
  website?: string;
}

/**
 * Artist entity
 */
export interface Artist extends BaseEntity {
  avatar?: string;
  biography?: string;
  description?: string;
  name: string;
  portfolio?: string;
  website?: string;
}

/**
 * Genre entity
 */
export interface Genre extends BaseEntity {
  comicCount: number;
  description?: string;
  icon?: string;
  name: string;
  slug: string;
}

/**
 * Content Type entity
 */
export interface ContentType extends BaseEntity {
  description?: string;
  name: "Comic" | "Light Novel" | "Manga" | "Manhua" | "Manhwa";
}

/**
 * Database query options
 */
export interface DbQueryOptions {
  include?: string[];
  limit?: number;
  order?: "asc" | "desc";
  page?: number;
  sort?: string;
}

/**
 * Database mutation result
 */
export interface DbMutationResult<T> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * Batch operation result
 */
export interface BatchOperationResult {
  errors?: string[];
  failed: number;
  success: number;
  total: number;
}
