// app/api/register/route.js
import connectToDatabase from '../../../db'; // Adjust path based on db.js 
// 
// location

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse the request body
    const { username, password } = await request.json();

    // Basic validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await connectToDatabase();
    const collection = db.collection('users');

    // Check if username exists
    const existingUser = await collection.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Insert the new user
    const result = await collection.insertOne({
      username,
      password, // In production, hash this!
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        userId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}