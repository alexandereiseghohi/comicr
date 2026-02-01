/**
 * Data Access Layer (DAL) Exports
 * Provides centralized typed access to database operations
 * @usage import { comicDAL, userDAL } from '@/dal'
 */

export { BaseDAL } from "./base-dal";

// Entity DALs
export { ArtistDAL, artistDAL } from "./artist-dal";
export { AuthorDAL, authorDAL } from "./author-dal";
export { BookmarkDAL, bookmarkDAL } from "./bookmark-dal";
export { ChapterDAL, chapterDAL } from "./chapter-dal";
export { ComicDAL, comicDAL } from "./comic-dal";
export { CommentDAL, commentDAL } from "./comment-dal";
export { GenreDAL, genreDAL } from "./genre-dal";
export { NotificationDAL, notificationDAL } from "./notification-dal";
export { RatingDAL, ratingDAL } from "./rating-dal";
export { ReadingProgressDAL, readingProgressDAL } from "./reading-progress-dal";
export { TypeDAL, typeDAL } from "./type-dal";
export { UserDAL, userDAL } from "./user-dal";

// Image DALs
export { ChapterImageDAL, chapterImageDAL } from "./chapter-image-dal";
export { ComicImageDAL, comicImageDAL } from "./comic-image-dal";
