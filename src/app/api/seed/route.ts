/**
 * POST /api/seed
 * Protected endpoint to seed the database with initial data
 * Requires SEED_TOKEN environment variable to match
 */

import { NextRequest, NextResponse } from 'next/server';
import { seed } from '@/database/seed/seed';

export async function POST(request: NextRequest) {
  try {
    // Check for seed token
    const token = request.headers.get('x-seed-token') || request.nextUrl.searchParams.get('token');
    const expectedToken = process.env.SEED_TOKEN;

    if (!expectedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Seeding is not configured. Set SEED_TOKEN environment variable.',
        },
        { status: 500 }
      );
    }

    if (!token || token !== expectedToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing seed token' },
        { status: 401 }
      );
    }

    // Execute seed
    const result = await seed();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, reports: result.reports },
        { status: 500 }
      );
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      reports: result.reports,
      summary: result.report,
    });
  } catch (error) {
    console.error('Seed endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check for seed token
    const token = request.nextUrl.searchParams.get('token');
    const expectedToken = process.env.SEED_TOKEN;

    if (!expectedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Seeding is not configured. Set SEED_TOKEN environment variable.',
        },
        { status: 500 }
      );
    }

    if (!token || token !== expectedToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing seed token' },
        { status: 401 }
      );
    }

    // Execute seed
    const result = await seed();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, reports: result.reports },
        { status: 500 }
      );
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      reports: result.reports,
      summary: result.report,
    });
  } catch (error) {
    console.error('Seed endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
