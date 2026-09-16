import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CartItem } from "@/stores/cartStore";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { items } = body;

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: 'Cart is empty' },
                { status: 400 }
            );
        }

        const orderNumber = 'ORD-' + Date.now();
        const total = items.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);

        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    orderNumber,
                    total,
                    items: {
                        create: items.map((item: CartItem) => ({
                            productId: item.productId,
                            productName: item.name,
                            category: item.category,
                            price: item.price,
                            quantity: item.quantity
                        }))
                    }
                }
            });

            for (const item of items as CartItem[]) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { quantity: { decrement: item.quantity } }
                })
            }

            return order;
        });

        return NextResponse.json({
            message: 'Order created successfully',
            order: result
        },
            { status: 201 })

    } catch (error) {
        console.error('Order creation failed: '+ error);
    return NextResponse.json(
        { error: 'Order creation failed. Please try again.'  },
        { status: 500 }
    );
    }
}