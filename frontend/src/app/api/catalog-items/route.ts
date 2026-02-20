import { NextResponse } from "next/server";
import prisma from "@/lib/db/db";

export async function GET() {
  try {
    const items = await prisma.catalogItem.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch catalog items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const created = await prisma.catalogItem.create({
      data: {
        name: body.name,
        reference: body.reference ?? null,
        description: body.description ?? null,
        unitPrice: body.unitPrice,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create catalog item" }, { status: 500 });
  }
}
