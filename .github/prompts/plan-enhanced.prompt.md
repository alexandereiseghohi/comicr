# ComicWise – Enhanced Master Prompt (Advanced Search, Admin Uploads, Parallelization)

## Executive Summary

This prompt is tailored for the current project phase, focusing on advanced search/filtering (TASK003), launching the Admin Panel for comic uploads (and TASK-011), and parallelizing UI, test, and image migration enhancements. For completed items, only suggest improvements if best practices have changed.

---

## 1. Current Focus Areas

### A. Advanced Search & Filtering (TASK003)

- Complete and optimize advanced search UI and backend.
- Implement multi-criteria filtering (genre, author, status, tags, etc.).
- Ensure search is fast, paginated, and accessible.
- Add Playwright E2E tests for search flows.
- Document search API and UI usage in README.

### B. Admin Panel for Comic Uploads & TASK-011

- Build admin UI for uploading new comics, chapters, and images.
- Integrate with seeding system to ensure deterministic public URLs (TASK-011).
- Add validation, error handling, and progress feedback.
- Restrict access to admin users only.
- Add unit and E2E tests for upload flows.

### C. Parallelized Enhancements

- UI: Refine accessibility, ARIA, and responsive design.
- Test Coverage: Expand Vitest and Playwright coverage for new and existing features.
- Image Migration: Move all images to `next/image` and modern formats (AVIF/WebP).
- Performance: Profile and optimize bundle size, caching, and lazy loading.

---

## 2. Operational Rules

- For completed items, only suggest improvements if best practices have changed since last implementation.
- All new features must follow strict TypeScript, Zod validation, and Next.js 16+ conventions.
- Use DRY, modular, and accessible patterns throughout.
- Log all major lifecycle events and errors (Sentry).
- Update documentation and memory bank files for all new features and changes.

---

## 3. Acceptance Criteria

- Advanced search/filtering is fully functional, tested, and documented.
- Admin panel supports secure, robust comic uploads with deterministic URLs.
- UI, test, and image migration enhancements are parallelized and tracked.
- All new code passes `pnpm validate`, is accessible, and follows latest best practices.
- For completed items, improvements are only made if justified by new standards.

---

## 4. Next Steps

1. Complete TASK003: Advanced Search & Filtering.
2. Launch Admin Panel for Comic Uploads and implement TASK-011.
3. Parallelize UI, test, and image migration improvements.
4. Review completed items for best practice updates; suggest changes only if warranted.
5. Update documentation and memory bank to reflect progress.

---

> Use this prompt as the authoritative guide for the next project phase. Update as new priorities emerge.
