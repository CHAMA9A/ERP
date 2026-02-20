import { NextResponse } from "next/server";

// Placeholder route for planning and calendar operations.
// TODO: Implement planning API backed by Prisma and PostgreSQL.

export async function GET() {
  return NextResponse.json(
    { message: "Planning API not implemented yet" },
    { status: 501 },
  );
}

