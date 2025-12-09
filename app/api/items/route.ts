import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const items = await db.item.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching items:", error);
        return NextResponse.json(
            { error: "Failed to fetch items" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, serial, category, brand, type, vehicle, statusState, statusLevel } = body;

        const item = await db.item.create({
            data: {
                id,
                serial,
                category,
                brand,
                type,
                vehicle,
                statusState,
                statusLevel: statusLevel ? parseInt(statusLevel) : null,
            },
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error("Error creating item:", error);
        return NextResponse.json(
            { error: "Failed to create item" },
            { status: 500 }
        );
    }
}
