/* eslint-disable react/no-unescaped-entities */
import { BookOpen, Heart, Users, Zap } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About ComicWise - Your Ultimate Comic Reading Platform",
  description:
    "Learn about ComicWise's mission to provide the best comic reading experience with a vast library, multiple reading modes, and personalized features.",
  openGraph: {
    title: "About ComicWise",
    description: "Discover the story behind your favorite comic reading platform",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">About ComicWise</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
          Bringing comic enthusiasts together with the stories they love through innovative reading experiences and
          community-driven features.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="mb-16">
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="text-primary h-6 w-6" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To create the most accessible and enjoyable comic reading platform that empowers readers to discover,
                track, and engage with their favorite stories while supporting creators and building a vibrant
                community.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="text-primary h-6 w-6" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To be the world's leading platform where comic enthusiasts of all backgrounds can explore diverse
                content, connect with fellow readers, and experience stories in ways that enhance their reading journey.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Key Features */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Why Choose ComicWise?</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <BookOpen className="text-primary mb-2 h-8 w-8" />
              <CardTitle className="text-lg">Vast Library</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access thousands of comics across multiple genres, from manga and manhwa to webtoons and graphic novels.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="text-primary mb-2 h-8 w-8" />
              <CardTitle className="text-lg">Multiple Reading Modes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Choose from single-page, continuous scroll, or double-page reading modes optimized for your device.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="text-primary mb-2 h-8 w-8" />
              <CardTitle className="text-lg">Personalized Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Bookmark favorites, track reading progress, and get personalized recommendations based on your
                preferences.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="text-primary mb-2 h-8 w-8" />
              <CardTitle className="text-lg">Active Community</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Engage with fellow readers through ratings, reviews, and comments. Share your thoughts on the latest
                chapters.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Meet the Team</h2>
        <p className="text-muted-foreground mb-8 text-center">
          ComicWise is built by a passionate team of developers, designers, and comic enthusiasts dedicated to creating
          the best reading experience.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="from-primary to-primary/60 mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br" />
              <CardTitle className="text-center">Development Team</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Building robust, scalable infrastructure with modern technologies and best practices.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="from-primary to-primary/60 mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br" />
              <CardTitle className="text-center">Design Team</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Crafting intuitive, beautiful interfaces that enhance the reading experience across all devices.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="from-primary to-primary/60 mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-to-br" />
              <CardTitle className="text-center">Community Team</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Supporting users, moderating content, and fostering a welcoming environment for all readers.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <Card className="from-primary/10 to-primary/5 mx-auto max-w-2xl bg-gradient-to-br">
          <CardHeader>
            <CardTitle className="text-2xl">Start Your Reading Journey</CardTitle>
            <CardDescription className="text-base">
              Join thousands of readers who trust ComicWise for their daily comic fix
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/comics">Browse Comics</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-up">Create Free Account</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Contact Section */}
      <section className="mt-16 text-center">
        <p className="text-muted-foreground">
          Have questions or feedback?{" "}
          <Link className="text-primary underline underline-offset-4" href="/contact">
            Get in touch with us
          </Link>
        </p>
      </section>
    </div>
  );
}
