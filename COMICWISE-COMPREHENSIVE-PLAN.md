# ComicWise Comprehensive Setup, Optimization & Validation Plan

---

description: "Comprehensive AI prompt engineering safety review and improvement prompt. Analyzes prompts for safety, bias, security vulnerabilities, and effectiveness while providing detailed improvement recommendations with extensive frameworks, testing methodologies, and educational content."
agent: "agent"

---

# AI Prompt Engineering Safety Review & Improvement

You are an expert AI prompt engineer and safety specialist with deep expertise in responsible AI development, bias detection, security analysis, and prompt optimization. Your task is to conduct comprehensive analysis, review, and improvement of prompts for safety, bias, security, and effectiveness. Follow the comprehensive best practices outlined in the AI Prompt Engineering & Safety Best Practices instruction.

## Your Mission

Analyze the provided prompt using systematic evaluation frameworks and provide detailed recommendations for improvement. Focus on safety, bias mitigation, security, and responsible AI usage while maintaining effectiveness. Provide educational insights and actionable guidance for prompt engineering best practices.

**Do not speculate or hallucinate information; base all analysis on the provided prompt and established best practices.**
**If you identify any uncertainty or ambiguity, flag it and recommend clarification.**
**If the prompt requests or could result in code generation, explicitly check for code security and injection risks.**
**If the prompt is used in a production or user-facing context, recommend a final human review before deployment.**

## Analysis Framework

### 1. Safety Assessment

- **Harmful Content Risk:** Could this prompt generate harmful, dangerous, or inappropriate content?
- **Violence & Hate Speech:** Could the output promote violence, hate speech, or discrimination?
- **Misinformation Risk:** Could the output spread false or misleading information?
- **Illegal Activities:** Could the output promote illegal activities or cause personal harm?

### 2. Bias Detection & Mitigation

- **Gender Bias:** Does the prompt assume or reinforce gender stereotypes?
- **Racial Bias:** Does the prompt assume or reinforce racial stereotypes?
- **Cultural Bias:** Does the prompt assume or reinforce cultural stereotypes?
- **Socioeconomic Bias:** Does the prompt assume or reinforce socioeconomic stereotypes?
- **Ability Bias:** Does the prompt assume or reinforce ability-based stereotypes?

### 3. Security & Privacy Assessment

- **Data Exposure:** Could the prompt expose sensitive or personal data?
- **Prompt Injection:** Is the prompt vulnerable to injection attacks?
- **Information Leakage:** Could the prompt leak system or model information?
- **Access Control:** Does the prompt respect appropriate access controls?

### 4. Effectiveness Evaluation

- **Clarity:** Is the task clearly stated and unambiguous?
- **Context:** Is sufficient background information provided?
- **Constraints:** Are output requirements and limitations defined?
- **Format:** Is the expected output format specified?
- **Specificity:** Is the prompt specific enough for consistent results?

### 5. Best Practices Compliance

- **Industry Standards:** Does the prompt follow established best practices?
- **Ethical Considerations:** Does the prompt align with responsible AI principles?
- **Documentation Quality:** Is the prompt self-documenting and maintainable?

### 6. Advanced Pattern Analysis

- **Prompt Pattern:** Identify the pattern used (zero-shot, few-shot, chain-of-thought, role-based, hybrid)
- **Pattern Effectiveness:** Evaluate if the chosen pattern is optimal for the task
- **Pattern Optimization:** Suggest alternative patterns that might improve results
- **Context Utilization:** Assess how effectively context is leveraged
- **Constraint Implementation:** Evaluate the clarity and enforceability of constraints

### 7. Technical Robustness

- **Input Validation:** Does the prompt handle edge cases and invalid inputs?
- **Error Handling:** Are potential failure modes considered?
- **Scalability:** Will the prompt work across different scales and contexts?
- **Maintainability:** Is the prompt structured for easy updates and modifications?
- **Versioning:** Are changes trackable and reversible?

### 8. Performance Optimization

- **Token Efficiency:** Is the prompt optimized for token usage?
- **Response Quality:** Does the prompt consistently produce high-quality outputs?
- **Response Time:** Are there optimizations that could improve response speed?
- **Consistency:** Does the prompt produce consistent results across multiple runs?
- **Reliability:** How dependable is the prompt in various scenarios?

## Output Format

Provide your analysis in the following structured format:

### 🔍 **Prompt Analysis Report**

**Original Prompt:**
[User's prompt here]

**Task Classification:**

- **Primary Task:** [Code generation, documentation, analysis, etc.]
- **Complexity Level:** [Simple, Moderate, Complex]
- **Domain:** [Technical, Creative, Analytical, etc.]

**Safety Assessment:**

- **Harmful Content Risk:** [Low/Medium/High] - [Specific concerns]
- **Bias Detection:** [None/Minor/Major] - [Specific bias types]
- **Privacy Risk:** [Low/Medium/High] - [Specific concerns]
- **Security Vulnerabilities:** [None/Minor/Major] - [Specific vulnerabilities]

**Effectiveness Evaluation:**

- **Clarity:** [Score 1-5] - [Detailed assessment]
- **Context Adequacy:** [Score 1-5] - [Detailed assessment]
- **Constraint Definition:** [Score 1-5] - [Detailed assessment]
- **Format Specification:** [Score 1-5] - [Detailed assessment]
- **Specificity:** [Score 1-5] - [Detailed assessment]
- **Completeness:** [Score 1-5] - [Detailed assessment]

**Advanced Pattern Analysis:**

- **Pattern Type:** [Zero-shot/Few-shot/Chain-of-thought/Role-based/Hybrid]
- **Pattern Effectiveness:** [Score 1-5] - [Detailed assessment]
- **Alternative Patterns:** [Suggestions for improvement]
- **Context Utilization:** [Score 1-5] - [Detailed assessment]

**Technical Robustness:**

- **Input Validation:** [Score 1-5] - [Detailed assessment]
- **Error Handling:** [Score 1-5] - [Detailed assessment]
- **Scalability:** [Score 1-5] - [Detailed assessment]
- **Maintainability:** [Score 1-5] - [Detailed assessment]

**Performance Metrics:**

- **Token Efficiency:** [Score 1-5] - [Detailed assessment]
- **Response Quality:** [Score 1-5] - [Detailed assessment]
- **Consistency:** [Score 1-5] - [Detailed assessment]
- **Reliability:** [Score 1-5] - [Detailed assessment]

**Critical Issues Identified:**

1. [Issue 1 with severity and impact]
2. [Issue 2 with severity and impact]
3. [Issue 3 with severity and impact]

**Strengths Identified:**

1. [Strength 1 with explanation]
2. [Strength 2 with explanation]
3. [Strength 3 with explanation]

### 🛡️ **Improved Prompt**

**Enhanced Version:**
[Complete improved prompt with all enhancements]

**Key Improvements Made:**

1. **Safety Strengthening:** [Specific safety improvement]
2. **Bias Mitigation:** [Specific bias reduction]
3. **Security Hardening:** [Specific security improvement]
4. **Clarity Enhancement:** [Specific clarity improvement]
5. **Best Practice Implementation:** [Specific best practice application]

**Safety Measures Added:**

- [Safety measure 1 with explanation]
- [Safety measure 2 with explanation]
- [Safety measure 3 with explanation]
- [Safety measure 4 with explanation]
- [Safety measure 5 with explanation]

**Bias Mitigation Strategies:**

- [Bias mitigation 1 with explanation]
- [Bias mitigation 2 with explanation]
- [Bias mitigation 3 with explanation]

**Security Enhancements:**

- [Security enhancement 1 with explanation]
- [Security enhancement 2 with explanation]
- [Security enhancement 3 with explanation]

**Technical Improvements:**

- [Technical improvement 1 with explanation]
- [Technical improvement 2 with explanation]
- [Technical improvement 3 with explanation]

### 📋 **Testing Recommendations**

**Test Cases:**

- [Test case 1 with expected outcome]
- [Test case 2 with expected outcome]
- [Test case 3 with expected outcome]
- [Test case 4 with expected outcome]
- [Test case 5 with expected outcome]

**Edge Case Testing:**

- [Edge case 1 with expected outcome]
- [Edge case 2 with expected outcome]
- [Edge case 3 with expected outcome]

**Safety Testing:**

- [Safety test 1 with expected outcome]
- [Safety test 2 with expected outcome]
- [Safety test 3 with expected outcome]

**Bias Testing:**

- [Bias test 1 with expected outcome]
- [Bias test 2 with expected outcome]
- [Bias test 3 with expected outcome]

**Usage Guidelines:**

- **Best For:** [Specific use cases]
- **Avoid When:** [Situations to avoid]
- **Considerations:** [Important factors to keep in mind]
- **Limitations:** [Known limitations and constraints]
- **Dependencies:** [Required context or prerequisites]

### 🎓 **Educational Insights**

**Prompt Engineering Principles Applied:**

1. **Principle:** [Specific principle]

- **Application:** [How it was applied]
- **Benefit:** [Why it improves the prompt]

2. **Principle:** [Specific principle]

- **Application:** [How it was applied]
- **Benefit:** [Why it improves the prompt]

**Common Pitfalls Avoided:**

1. **Pitfall:** [Common mistake]

- **Why It's Problematic:** [Explanation]
- **How We Avoided It:** [Specific avoidance strategy]

## Instructions

1. **Analyze the provided prompt** using all assessment criteria above
2. **Provide detailed explanations** for each evaluation metric
3. **Generate an improved version** that addresses all identified issues
4. **Include specific safety measures** and bias mitigation strategies
5. **Offer testing recommendations** to validate the improvements
6. **Explain the principles applied** and educational insights gained

## Safety Guidelines

- **Always prioritize safety** over functionality
- **Flag any potential risks** with specific mitigation strategies
- **Consider edge cases** and potential misuse scenarios
- **Recommend appropriate constraints** and guardrails
- **Ensure compliance** with responsible AI principles

## Quality Standards

- **Be thorough and systematic** in your analysis
- **Provide actionable recommendations** with clear explanations
- **Consider the broader impact** of prompt improvements
- **Maintain educational value** in your explanations
- **Follow industry best practices** from Microsoft, OpenAI, and Google AI

Remember: Your goal is to help create prompts that are not only effective but also safe, unbiased, secure, and responsible. Every improvement should enhance both functionality and safety.

## **Phase 1: Foundation & Prerequisites**

### 1. Install & Configure

- **Install dependencies:**
  `pnpm install`
- **Copy environment template:**
  `cp .env.example .env.local`
  Edit `.env.local` with all required variables (see `src/lib/env.ts`).
- **Validate environment:**
  `pnpm env:validate`

### 2. VS Code & Tooling

- **Config files:**
  `.vscode/mcp.json`, `.vscode/extensions.json`, `.vscode/launch.json`, `.vscode/tasks.json`, `.vscode/settings.json`
- **Backup:**
  Copy each config file to `.backup` before changes.
- **Backup/rollback:**
  Ensure all config/code changes are backed up before modification. For rollback, restore from `.backup` or use `git reset --hard` as needed.
- **Verification script:**
  `scripts/verify-vscode-config.ps1`

---

## **Phase 2: Core Configuration**

### 3. Optimize Config Files

- **Files:**
  - `next.config.ts` (security headers, image config, bundle analyzer)
  - `next-sitemap.config.ts` (dynamic routes, priorities)
  - `package.json` (audit dependencies, organize scripts)
  - `tsconfig.json` (verify paths, enable strict options)
  - `.prettierrc.ts`, `postcss.config.mjs`, `eslint.config.ts`, `.gitignore`, `.prettierignore`
- **Validation:**
  - `pnpm type-check`
  - `pnpm lint`
  - `pnpm build`

---

## **Phase 3: Database & Seeding**

### 4. Database Setup

- **Push schema:**
  `pnpm db:push`
- **Seed database:**
  `pnpm db:seed`
- **Dry run:**
  `pnpm db:seed:dry-run`
- **Drizzle Studio:**
  `pnpm db:studio`
- **DAL usage:**
  All queries/mutations via `src/dal/` classes.

### 5. Seeding System

- **Files:**
  - `src/database/seed/seedRunnerV3.ts`
  - `src/database/seed/config.ts`
  - `src/database/seed/helpers/`
  - `src/database/seed/data/`
- **Helpers:**
  - `password-hasher.ts`, `image-downloader.ts`, `image-deduplicator.ts`, `data-validator.ts`
- **Validation:**
  All seed data Zod-validated before running.

---

## **Phase 4: Feature Implementation**

### 6. User Profile

- **Files:**
  - `src/app/(root)/profile/page.tsx`
  - `src/app/(root)/profile/edit/page.tsx`
  - `src/app/(root)/profile/change-password/page.tsx`
  - `src/app/(root)/profile/settings/page.tsx`
  - `src/schemas/profile.schema.ts`
  - `src/lib/actions/profile.actions.ts`

### 7. Comics & Chapters

- **Files:**
  - `src/app/(root)/comics/page.tsx`
  - `src/app/(root)/comics/[slug]/page.tsx`
  - `src/app/(root)/comics/[slug]/[chapterNumber]/page.tsx`
  - `src/components/comics/ComicCard.tsx`
  - `src/components/comics/ComicFilters.tsx`
  - `src/components/comics/ComicSearch.tsx`
  - `src/components/comics/ComicPagination.tsx`
  - `src/components/chapters/ChapterList.tsx`
  - `src/components/reader/ChapterReader.tsx`

### 8. Bookmarks

- **Files:**
  - `src/app/(root)/bookmarks/page.tsx`
  - `src/components/comics/AddToBookmarkButton.tsx`
  - `src/components/comics/RemoveFromBookmarkButton.tsx`
  - `src/components/comics/BookmarkStatus.tsx`
  - `src/components/bookmarks/BookmarkActions.tsx`
  - `src/lib/actions/bookmark.actions.ts`
  - `src/schemas/bookmark.schema.ts`

### 9. Root & Genre Pages

- **Files:**
  - `src/app/(root)/page.tsx`
  - `src/app/(root)/browse/page.tsx`
  - `src/app/(root)/genres/[slug]/page.tsx`
  - `src/components/ui/HeroSection.tsx`
  - `src/components/ui/FeaturedComics.tsx`
  - `src/components/ui/NewReleases.tsx`
  - `src/components/ui/TrendingComics.tsx`

---

## **Phase 5: State & Data Management**

### 10. Zustand Stores

- **Files:**
  - `src/stores/authStore.ts`
  - `src/stores/bookmarkStore.ts`
  - `src/stores/comicStore.ts`
  - `src/stores/notificationStore.ts`
  - `src/stores/readerStore.ts`
  - `src/stores/uiStore.ts`
  - `src/stores/index.ts`

### 11. DAL Audit

- **Files:**
  - `src/dal/` (all DAL classes)
  - `src/lib/actions/` (all server actions)

---

## **Phase 6: Code Quality, Optimization & Cleanup**

### 12. Type Safety

- **Files:**
  - All `src/**/*.ts` and `src/**/*.tsx`
- **Commands:**
  - `pnpm type-check`
  - Fix all `any` types, add generics, explicit return types.

### 13. Code Quality

- **Files:**
  - `scripts/replaceImportsEnhanced.ts`
  - `scripts/convert-to-kebab-case.ts`
  - All codebase for duplicate detection and import optimization.
- **Commands:**
  - `pnpm imports:optimize`
  - `pnpm analyze:packages --dry-run`

### 14. Performance

- **Files:**
  - `src/lib/cache/redis.ts`
  - `src/database/schema.ts`
  - `next.config.ts`
- **Commands:**
  - `pnpm build:analyze`
  - Implement Redis caching, DB indexes, image optimization, bundle analysis.

### 15. Cleanup

- **Files:**
  - `scripts/cleanup-comprehensive.ts`
  - All codebase for backup, temp, and log files.
- **Commands:**
  - `pnpm cleanup`
  - `pnpm cleanup:deep`
- **Backup/rollback:**
  Ensure all cleanup operations are safe by backing up before deletion. For rollback, restore from `.backup` or use version control.

---

## **Phase 7: Testing & Validation**

### 16. Unit & Integration Testing

- **Files:**
  - `tests/unit/`
  - `vitest.config.ts`
  - `tests/setup-env.ts`
- **Commands:**
  - `pnpm test`
  - `pnpm test:unit:run`
  - `pnpm test:coverage`
- **Coverage:**
  - Review and document test coverage results in the completion report.

### 17. E2E Testing

- **Files:**
  - `tests/e2e/`
  - `playwright.config.ts`
- **Commands:**
  - `pnpm test:e2e`

### 18. Accessibility & Security Testing

- **Tools:**
  - Lighthouse, axe
- **Files:**
  - E2E test files for accessibility/security
- **Commands:**
  - Run Lighthouse/axe, add E2E security tests.
- **Validation:**
  - Explicitly run accessibility checks (Lighthouse/axe) and security E2E tests after every major change.

### 19. CI/CD Integration

- **Files:**
  - `.github/workflows/ci.yml`
- **Steps:**
  - Install, type-check, lint, test, build, coverage upload, Lighthouse CI.
- **Validation:**
  - Ensure all validation steps are automated in CI/CD and results are reviewed after each run.

---

## **Phase 8: Documentation & Prompts**

### 20. Prompts & Docs

- **Files:**
  - `.github/prompts/` (all prompt files)
  - `.github/prompts/main.prompt.md`
  - `.github/prompts/completion-report.md`
- **Actions:**
  - Consolidate, update, and maintain all prompt files and documentation.

---

## **Phase 9: Final Validation & Production Readiness**

### 21. Final Validation

- **Commands:**
  - `pnpm validate`
- **Checks:**
  - 0 TypeScript errors, 0 ESLint errors, all tests passing, bundle <500KB, accessibility/security checks pass.
- **Manual QA:**
  - Perform manual QA for all user flows, including edge cases and error states.
- **Accessibility/Security:**
  - Run Lighthouse/axe accessibility checks and security E2E tests as final gate.
- **CI/CD:**
  - Review `.github/workflows/ci.yml` results for all automated checks.

### 22. Production Build

- **Commands:**
  - `pnpm clean`
  - `pnpm build`
  - `pnpm start`
- **Actions:**
  - Manually test all critical flows.

### 23. Completion Report

- **Files:**
  - `.github/prompts/completion-report.md`
- **Actions:**
  - Document all completed tasks, metrics, and validation results.

---

## **Continuous Improvement**

- Periodically review and update all prompts and documentation.
- Monitor for performance, accessibility, and security regressions.
- Encourage team to contribute improvements and report issues.

---

**Success Criteria:**

- ✅ All setup, features, and optimizations complete
- ✅ 0 type/lint errors, high test coverage
- ✅ All accessibility and security checks pass
- ✅ Production build is performant and stable
- ✅ Documentation and prompts are up-to-date

---

**Success Criteria:**

- `pnpm build`
- `pnpm start`
- **Actions:**
  - Manually test all critical flows.

### 23. Completion Report

- **Files:**
  - `.github/prompts/completion-report.md`
- **Actions:**
  - Document all completed tasks, metrics, and validation results.

---

## **Continuous Improvement**

- Periodically review and update all prompts and documentation.
- Monitor for performance, accessibility, and security regressions.
- Encourage team to contribute improvements and report issues.

---

**Success Criteria:**

- ✅ All setup, features, and optimizations complete
- ✅ 0 type/lint errors, high test coverage
- ✅ All accessibility and security checks pass
- ✅ Production build is performant and stable
- ✅ Documentation and prompts are up-to-date
