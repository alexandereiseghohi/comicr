CREATE TYPE "public"."comic_status" AS ENUM('Ongoing', 'Hiatus', 'Completed', 'Dropped', 'Season End', 'Coming Soon');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'moderator');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "artist" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"bio" text,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"searchVector" text
);
--> statement-breakpoint
CREATE TABLE "authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_userId_credentialID_pk" PRIMARY KEY("userId","credentialID"),
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE "author" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"bio" text,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"searchVector" text
);
--> statement-breakpoint
CREATE TABLE "bookmark" (
	"userId" text NOT NULL,
	"comicId" integer NOT NULL,
	"lastReadChapterId" integer,
	"status" text DEFAULT 'Reading' NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookmark_userId_comicId_pk" PRIMARY KEY("userId","comicId")
);
--> statement-breakpoint
CREATE TABLE "chapter" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"chapterNumber" integer NOT NULL,
	"releaseDate" timestamp NOT NULL,
	"comicId" integer NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"url" text,
	"content" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chapter_comic_number_unique" UNIQUE("comicId","chapterNumber")
);
--> statement-breakpoint
CREATE TABLE "chapterImage" (
	"id" serial PRIMARY KEY NOT NULL,
	"chapterId" integer NOT NULL,
	"imageUrl" text NOT NULL,
	"pageNumber" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comic" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"coverImage" text NOT NULL,
	"status" "comic_status" DEFAULT 'Ongoing' NOT NULL,
	"publicationDate" timestamp NOT NULL,
	"rating" numeric(10, 1) DEFAULT '0',
	"views" integer DEFAULT 0 NOT NULL,
	"url" text,
	"serialization" text,
	"authorId" integer,
	"artistId" integer,
	"typeId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"searchVector" text,
	CONSTRAINT "comic_title_unique" UNIQUE("title"),
	CONSTRAINT "comic_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "comicImage" (
	"id" serial PRIMARY KEY NOT NULL,
	"comicId" integer NOT NULL,
	"imageUrl" text NOT NULL,
	"imageOrder" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comicToGenre" (
	"comicId" integer NOT NULL,
	"genreId" integer NOT NULL,
	CONSTRAINT "comicToGenre_comicId_genreId_pk" PRIMARY KEY("comicId","genreId")
);
--> statement-breakpoint
CREATE TABLE "comment" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"userId" text NOT NULL,
	"chapterId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genre" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "genre_name_unique" UNIQUE("name"),
	CONSTRAINT "genre_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"link" text,
	"read" boolean DEFAULT false NOT NULL,
	"comicId" integer,
	"chapterId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passwordResetToken" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "passwordResetToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "rating" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"comicId" integer NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"review" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "userComicRatingUnique" UNIQUE("userId","comicId")
);
--> statement-breakpoint
CREATE TABLE "readingProgress" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"comicId" integer NOT NULL,
	"chapterId" integer NOT NULL,
	"pageNumber" integer DEFAULT 0 NOT NULL,
	"scrollPosition" integer DEFAULT 0 NOT NULL,
	"totalPages" integer DEFAULT 0 NOT NULL,
	"progressPercent" integer DEFAULT 0 NOT NULL,
	"completedAt" timestamp,
	"lastReadAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"password" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"status" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_comicId_comic_id_fk" FOREIGN KEY ("comicId") REFERENCES "public"."comic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmark" ADD CONSTRAINT "bookmark_lastReadChapterId_chapter_id_fk" FOREIGN KEY ("lastReadChapterId") REFERENCES "public"."chapter"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapter" ADD CONSTRAINT "chapter_comicId_comic_id_fk" FOREIGN KEY ("comicId") REFERENCES "public"."comic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapterImage" ADD CONSTRAINT "chapterImage_chapterId_chapter_id_fk" FOREIGN KEY ("chapterId") REFERENCES "public"."chapter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comic" ADD CONSTRAINT "comic_authorId_author_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."author"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comic" ADD CONSTRAINT "comic_artistId_artist_id_fk" FOREIGN KEY ("artistId") REFERENCES "public"."artist"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comic" ADD CONSTRAINT "comic_typeId_type_id_fk" FOREIGN KEY ("typeId") REFERENCES "public"."type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comicImage" ADD CONSTRAINT "comicImage_comicId_comic_id_fk" FOREIGN KEY ("comicId") REFERENCES "public"."comic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comicToGenre" ADD CONSTRAINT "comicToGenre_comicId_comic_id_fk" FOREIGN KEY ("comicId") REFERENCES "public"."comic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comicToGenre" ADD CONSTRAINT "comicToGenre_genreId_genre_id_fk" FOREIGN KEY ("genreId") REFERENCES "public"."genre"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_chapterId_chapter_id_fk" FOREIGN KEY ("chapterId") REFERENCES "public"."chapter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_comicId_comic_id_fk" FOREIGN KEY ("comicId") REFERENCES "public"."comic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_chapterId_chapter_id_fk" FOREIGN KEY ("chapterId") REFERENCES "public"."chapter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_comicId_comic_id_fk" FOREIGN KEY ("comicId") REFERENCES "public"."comic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "readingProgress" ADD CONSTRAINT "readingProgress_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "readingProgress" ADD CONSTRAINT "readingProgress_comicId_comic_id_fk" FOREIGN KEY ("comicId") REFERENCES "public"."comic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "readingProgress" ADD CONSTRAINT "readingProgress_chapterId_chapter_id_fk" FOREIGN KEY ("chapterId") REFERENCES "public"."chapter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookmarkUserIdIdx" ON "bookmark" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "bookmarkComicIdIdx" ON "bookmark" USING btree ("comicId");--> statement-breakpoint
CREATE INDEX "chapterSlugIdx" ON "chapter" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "chapterComicIdIdx" ON "chapter" USING btree ("comicId");--> statement-breakpoint
CREATE INDEX "chapterNumberIdx" ON "chapter" USING btree ("chapterNumber");--> statement-breakpoint
CREATE INDEX "chapterReleaseDateIdx" ON "chapter" USING btree ("releaseDate");--> statement-breakpoint
CREATE INDEX "chapterComicChapterIdx" ON "chapter" USING btree ("comicId","chapterNumber");--> statement-breakpoint
CREATE INDEX "chapterImageChapterIdIdx" ON "chapterImage" USING btree ("chapterId");--> statement-breakpoint
CREATE INDEX "chapterImagePageNumberIdx" ON "chapterImage" USING btree ("pageNumber");--> statement-breakpoint
CREATE INDEX "comicSlugIdx" ON "comic" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "comicTitleIdx" ON "comic" USING btree ("title");--> statement-breakpoint
CREATE INDEX "comicStatusIdx" ON "comic" USING btree ("status");--> statement-breakpoint
CREATE INDEX "comicRatingIdx" ON "comic" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "comicViewsIdx" ON "comic" USING btree ("views");--> statement-breakpoint
CREATE INDEX "comicAuthorIdx" ON "comic" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "comicArtistIdx" ON "comic" USING btree ("artistId");--> statement-breakpoint
CREATE INDEX "comicTypeIdx" ON "comic" USING btree ("typeId");--> statement-breakpoint
CREATE INDEX "comicCreatedAtIdx" ON "comic" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "commentUserIdIdx" ON "comment" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "commentChapterIdIdx" ON "comment" USING btree ("chapterId");--> statement-breakpoint
CREATE INDEX "commentCreatedAtIdx" ON "comment" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "notificationUserIdIdx" ON "notification" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "notificationReadIdx" ON "notification" USING btree ("read");--> statement-breakpoint
CREATE INDEX "notificationTypeIdx" ON "notification" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notificationCreatedAtIdx" ON "notification" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "notificationUserReadIdx" ON "notification" USING btree ("userId","read");--> statement-breakpoint
CREATE INDEX "ratingUserIdIdx" ON "rating" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "ratingComicIdIdx" ON "rating" USING btree ("comicId");--> statement-breakpoint
CREATE INDEX "ratingValueIdx" ON "rating" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "ratingCreatedAtIdx" ON "rating" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "readingProgressUserIdIdx" ON "readingProgress" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "readingProgressComicIdIdx" ON "readingProgress" USING btree ("comicId");--> statement-breakpoint
CREATE INDEX "readingProgressChapterIdIdx" ON "readingProgress" USING btree ("chapterId");--> statement-breakpoint
CREATE INDEX "readingProgressLastReadIdx" ON "readingProgress" USING btree ("lastReadAt");--> statement-breakpoint
CREATE INDEX "readingProgressUserComicIdx" ON "readingProgress" USING btree ("userId","comicId");--> statement-breakpoint
CREATE INDEX "userEmailIdx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "userRoleIdx" ON "user" USING btree ("role");