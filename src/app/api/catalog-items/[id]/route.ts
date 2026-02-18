import { NextResponse } from "next/server";
import prisma from "@/lib/db/db";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const item = await prisma.catalogItem.findUnique({ where: { id } });

    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch catalog item" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!body?.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const updated = await prisma.catalogItem.update({
      where: { id },
      data: {
        name: body.name,
        reference: body.reference ?? null,
        description: body.description ?? null,
        unitPrice: body.unitPrice,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update catalog item" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.catalogItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete catalog item" }, { status: 500 });
  }
}
