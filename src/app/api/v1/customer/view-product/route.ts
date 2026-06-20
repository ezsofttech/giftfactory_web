import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const customerId = session?.user?.customerId || session?.user?.id;
    const cookieName = customerId ? `product_views_${customerId}` : "product_views_guest";

    const cookieStore = await cookies();
    const viewsCookie = cookieStore.get(cookieName);
    let views: any[] = [];

    if (viewsCookie?.value) {
      try {
        views = JSON.parse(viewsCookie.value);
        if (!Array.isArray(views)) {
          views = [];
        }
      } catch (e) {
        views = [];
      }
    }

    return NextResponse.json({
      success: true,
      data: views,
    });
  } catch (error) {
    console.error("Failed to fetch product views:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product views" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { productId, categoryId, customerId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "ProductId is required" },
        { status: 400 }
      );
    }

    const session = await auth();
    const finalCustomerId = customerId || session?.user?.customerId || session?.user?.id;
    const cookieName = finalCustomerId ? `product_views_${finalCustomerId}` : "product_views_guest";

    const cookieStore = await cookies();
    const viewsCookie = cookieStore.get(cookieName);
    let views: any[] = [];

    if (viewsCookie?.value) {
      try {
        views = JSON.parse(viewsCookie.value);
        if (!Array.isArray(views)) {
          views = [];
        }
      } catch (e) {
        views = [];
      }
    }

    // Remove duplicates of this productId
    views = views.filter((item: any) => item.productId !== productId);

    // Prepend the new product view
    views.unshift({
      productId,
      categoryId: categoryId || undefined,
      createdAt: new Date().toISOString(),
    });

    // Limit to 20 entries
    views = views.slice(0, 20);

    // Save back to cookie
    cookieStore.set({
      name: cookieName,
      value: JSON.stringify(views),
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      data: { recorded: true },
    });
  } catch (error) {
    console.error("Failed to record product view:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record product view" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const customerId = session?.user?.customerId || session?.user?.id;
    const cookieName = customerId ? `product_views_${customerId}` : "product_views_guest";

    const cookieStore = await cookies();
    cookieStore.delete(cookieName);

    return NextResponse.json({
      success: true,
      message: "Product views cleared",
    });
  } catch (error) {
    console.error("Failed to clear product views:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear product views" },
      { status: 500 }
    );
  }
}
