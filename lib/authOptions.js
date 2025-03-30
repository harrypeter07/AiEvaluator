// lib/authOptions.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Invalid credentials");
				}
				await connectDB();
				const user = await User.findOne({ email: credentials.email });
				if (!user || !user?.password) {
					throw new Error("Invalid credentials");
				}
				const isCorrectPassword = await bcrypt.compare(
					credentials.password,
					user.password
				);
				if (!isCorrectPassword) {
					throw new Error("Invalid credentials");
				}
				return user;
			},
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			authorization: {
				params: {
					scope: [
						"openid",
						"email",
						"profile",
						"https://www.googleapis.com/auth/classroom.courses.readonly",
						"https://www.googleapis.com/auth/classroom.coursework.me",
						"https://www.googleapis.com/auth/classroom.coursework.students",
						"https://www.googleapis.com/auth/classroom.addons.student",
"https://www.googleapis.com/auth/classroom.addons.teacher"
					].join(" "),
					access_type: "offline", // Ensure refresh token
					prompt: "consent", // Force consent screen
				},
			},
		}),
	],
	callbacks: {
		async jwt({ token, user, account }) {
			if (account && user) {
				console.log("New token issued:", {
					accessToken: account.access_token,
					refreshToken: account.refresh_token,
					expiresIn: account.expires_in,
				});
				return {
					...token,
					accessToken: account.access_token,
					refreshToken: account.refresh_token,
					accessTokenExpires: Date.now() + account.expires_in * 1000,
					userId: user.id,
					email: user.email,
					provider: account.provider,
				};
			}

			if (Date.now() > token.accessTokenExpires) {
				console.log("Token expired, attempting refresh...");
				const refreshedToken = await refreshAccessToken(token);
				return refreshedToken;
			}

			return token;
		},
		async session({ session, token }) {
			if (token.error) {
				console.log("Session error:", token.error);
				// Optionally force sign-out if refresh fails
				if (token.error === "RefreshTokenError") {
					return null; // This will trigger unauthenticated state
				}
			}
			return {
				...session,
				accessToken: token.accessToken,
				refreshToken: token.refreshToken,
				userId: token.userId,
				provider: token.provider,
			};
		},
	},
	pages: {
		signIn: "/login",
		signUp: "/signup",
	},
	session: {
		strategy: "jwt",
	},
};

async function refreshAccessToken(token) {
	if (!token.refreshToken) {
		console.error("No refresh token available, cannot refresh.");
		return { ...token, error: "NoRefreshToken" };
	}

	try {
		const response = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				client_id: process.env.GOOGLE_CLIENT_ID,
				client_secret: process.env.GOOGLE_CLIENT_SECRET,
				refresh_token: token.refreshToken,
				grant_type: "refresh_token",
			}),
		});
		const refreshedTokens = await response.json();
		if (!response.ok)
			throw new Error(refreshedTokens.error || "Failed to refresh token");

		console.log("Token refreshed successfully:", {
			accessToken: refreshedTokens.access_token,
			expiresIn: refreshedTokens.expires_in,
		});
		return {
			...token,
			accessToken: refreshedTokens.access_token,
			accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
			refreshToken: refreshedTokens.refresh_token || token.refreshToken,
			error: null,
		};
	} catch (error) {
		console.error("Error refreshing token:", error);
		return { ...token, error: "RefreshTokenError" };
	}
}

export default NextAuth(authOptions);
