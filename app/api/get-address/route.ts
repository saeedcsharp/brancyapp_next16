import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ message: "Missing lat or lng" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.neshan.org/v5/reverse?lat=${lat}&lng=${lng}`, {
      headers: {
        "Api-Key": "service.c6d687920283496f80d2e7a02dccfa33",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Neshan API Error" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ address: data.formatted_address }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error }, { status: 500 });
  }
}
