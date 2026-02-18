import { NextResponse } from "next/server";

// Placeholder route for auth-related operations (login, register, etc.).
// TODO: Implement authentication logic with Prisma and PostgreSQL.

export async function GET() {
  return NextResponse.json(
    { message: "Auth API not implemented yet" },
    { status: 501 },
  );
}

