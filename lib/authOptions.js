// import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
// import { connectDB } from "./db";
//  import User from "@/models/User";

// export const authOptions = {
//   session: { strategy: "jwt" },
//   providers: [
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         await connectDB();
//         const user = await User.findOne({ email: credentials.email });
//         if (!user) throw new Error("User not found");

//         const isValid = await bcrypt.compare(credentials.password, user.password);
//         if (!isValid) throw new Error("Invalid credentials");

//         return { id: user._id, name: user.name, email: user.email };
//       },
//     }),
//   ],
//   callbacks: {
//     async session({ session, token }) {
//       session.user.id = token.sub;
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: { signIn: "/login" },
// };

// lib/authOptions.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials"; // If you want to keep email/password
import { connectDB } from "@/lib/db"; // Assuming you have a DB connection
import User from "@/models/User"; // Your User model
import bcrypt from "bcryptjs"; // For password hashing (if using Credentials)

export const authOptions = {
	providers: [
		// Credentials Provider (optional, for email/password login)
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
		// Google Provider (required for Classroom API)
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
						"https://www.googleapis.com/auth/classroom.rosters.readonly",
						"https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
						"https://www.googleapis.com/auth/classroom.topics.readonly",
						"https://www.googleapis.com/auth/classroom.teacherlessons.readonly",
						"https://www.googleapis.com/auth/classroom.studentlessons.readonly",
						"https://www.googleapis.com/auth/admin.directory.user.readonly",
					].join(" "),
				},
			},
		}),
	],
	callbacks: {
		async jwt({ token, user, account }) {
			if (account && user) {
				return {
					...token,
					accessToken: account.access_token,
					refreshToken: account.refresh_token,
					userId: user.id,
					email: user.email,
					provider: account.provider,
				};
			}
			return token;
		},
		async session({ session, token }) {
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

export default NextAuth(authOptions);
