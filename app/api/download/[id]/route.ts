import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Conversion_Status } from "@/generated/prisma";
import { contentType } from "mime-types";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const conversion = await prisma.conversion.findUnique({ where: { id } });
    if (!conversion)
      return NextResponse.json(
        { error: { message: "no Conversion Found!!" }, sucess: false },
        { status: 404 },
      );
    // Get it form Supabase
    const bucket = process.env.SUPABASE_BUCKET as string;

    // Check Conversion Status
    if (conversion.status !== Conversion_Status.COMPLETED) {
      return NextResponse.json(
        {
          error: {
            message:
              "The File Has not Being Converted yet it's Current Status is : " +
              conversion.status,
          },
          success: false,
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .download(conversion.fileLocation);

    if (error || !data) {
      return new NextResponse("File not found", { status: 404 });
    }
    const filename = `${conversion.id.slice(4, 16)}.${contentType(conversion.toMime)}`;

    return new NextResponse(data.stream(), {
      headers: {
        "Content-Type": conversion.toMime,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error, success: false }, { status: 404 });
  }
}
