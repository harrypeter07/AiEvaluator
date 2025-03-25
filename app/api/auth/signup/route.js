/* eslint-disable @typescript-eslint/no-unused-vars */
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import jwt from "jsonwebtoken";

export async function POST(request) {
	try {
		await connectDB();
		const { username, email, password } = await request.json();

		// Enhanced input validation
		if (!username || !email || !password) {
			return NextResponse.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		// Email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: "Invalid email format" },
				{ status: 400 }
			);
		}

		// Password strength validation
		if (password.length < 6) {
			return NextResponse.json(
				{ error: "Password must be at least 6 characters long" },
				{ status: 400 }
			);
		}

		// Username validation
		if (username.length < 3) {
			return NextResponse.json(
				{ error: "Username must be at least 3 characters long" },
				{ status: 400 }
			);
		}

		// Check if user already exists with detailed message
		const existingUser = await User.findOne({
			$or: [{ email }, { username }],
		});

		if (existingUser) {
			const field = existingUser.email === email ? "email" : "username";
			return NextResponse.json(
				{ error: `This ${field} is already registered` },
				{ status: 400 }
			);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create new user
		const newUser = await User.create({
			username,
			email,
			password: hashedPassword,
		});

		// Generate JWT token
		const token = jwt.sign(
			{ userId: newUser._id, email: newUser.email },
			process.env.NEXTAUTH_SECRET,
			{ expiresIn: "7d" }
		);

		// Create the response
		const response = NextResponse.json(
			{
				message: "User created successfully",
				user: {
					id: newUser._id,
					username: newUser.username,
					email: newUser.email,
				},
			},
			{ status: 201 }
		);

		// Set the token in a cookie
		response.cookies.set("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60, // 7 days
		});

		return response;
	} catch (error) {
		console.error("Signup error:", error);
		return NextResponse.json(
			{ error: "Failed to create user. Please try again." },
			{ status: 500 }
		);
	}
}
