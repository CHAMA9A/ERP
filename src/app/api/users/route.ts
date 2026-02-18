import { NextResponse } from "next/server";

// Placeholder route for user CRUD operations.
// TODO: Implement users API backed by Prisma and PostgreSQL.

export async function GET() {
  return NextResponse.json(
    { message: "Users API not implemented yet" },
    { status: 501 },
  );
}

