import { NextResponse } from "next/server";

// Placeholder route for tasks management.
// TODO: Implement tasks API backed by Prisma and PostgreSQL.

export async function GET() {
  return NextResponse.json(
    { message: "Tasks API not implemented yet" },
    { status: 501 },
  );
}

