// Re-export for compatibility with imports using kebab-case
export * from "./bookmark.mutations";

// Compatibility exports for API and page imports
import * as impl from "./bookmark.mutations";
// Removed isBookmarked export as it does not exist in impl
export const createBookmark = impl.addBookmark;
export const deleteBookmark = impl.removeBookmark;
