import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
// Ensure the import path and export are correct. If the file does not exist, create a stub in src/lib/actions/contact.ts
import { sendContactEmailAction } from "@/lib/actions/contact";
import { type ContactInput, contactSchema } from "@/schemas/contact.schema";

("use client");
/* eslint-disable react/no-unescaped-entities */

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactInput) {
    setIsSubmitting(true);
    try {
      const result = await sendContactEmailAction(data);
      if (result.ok) {
        toast.success(
          "Message sent! Thank you for contacting us. We'll get back to you soon.",
        );
        form.reset();
      } else {
        toast.error(
          result.error || "Failed to send message. Please try again later.",
        );
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          Get in Touch
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Have a question, feedback, or need support? We'd love to hear from
          you.
        </p>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        {/* Contact Information */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <Mail className="text-primary mb-2 h-8 w-8" />
              <CardTitle>Email Us</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Send us an email and we'll respond within 24-48 hours.
              </CardDescription>
              <p className="mt-2 text-sm font-medium">support@comicwise.app</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="text-primary mb-2 h-8 w-8" />
              <CardTitle>Community</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Join our community to connect with other readers and get quick
                answers.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="text-primary mb-2 h-8 w-8" />
              <CardTitle>Office</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                ComicWise Platform
                <br />
                Digital Services
                <br />
                United States
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you as soon as
              possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@example.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-37.5 resize-none"
                          placeholder="Tell us how we can help you..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  className="w-full"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Redirect */}
      <section className="mt-16 text-center">
        <p className="text-muted-foreground">
          Looking for quick answers? Check out our{" "}
          <a className="text-primary underline underline-offset-4" href="/help">
            Help Center
          </a>{" "}
          for frequently asked questions.
        </p>
      </section>
    </div>
  );
}
