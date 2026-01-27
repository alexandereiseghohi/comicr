// auth.ts
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github"; // Example provider

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        // ... add more providers here
    ],
});
