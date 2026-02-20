import { NextResponse } from "next/server";

// Placeholder route for quotes (devis) operations.
// TODO: Implement quotes API backed by Prisma and PostgreSQL.

export async function GET() {
  return NextResponse.json(
    { message: "Quotes API not implemented yet" },
    { status: 501 },
  );
}

