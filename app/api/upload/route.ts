import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";
import prisma from "@/lib/prisma";
import { Conversion_Status } from "@/generated/prisma";
import { extname } from "path";
import { v4 as uuid } from "uuid";
import { supabase } from "@/lib/supabase";
import { error } from "console";
export const POST = async (request: NextRequest) => {
  // load the file from server
  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;
  const to = data.get("to") as string;
  const from = extname(file.name).replace(".", "");
  if (!file) {
    return NextResponse.json(
      { message: "NO File Found", success: false },
      { status: 400 },
    );
  }
  if (!to) {
    return NextResponse.json(
      { message: "NO 'to' Found", success: false },
      { status: 400 },
    );
  }

  // upload the file to S3
  const key = `${uuid()}.${from}`;
  const fileLocation = `uploads/${key}`;
  const bucket = process.env.SUPABASE_BUCKET as string;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileLocation, file);

  if (uploadError) {
    return NextResponse.json(
      { message: uploadError.message, success: false },
      { status: 400 },
    );
  }
  console.log("File Loc : " + uploadData.fullPath);

  // save metadata to Postgres

  try {
    const conversion = await prisma.conversion.create({
      data: {
        fileLocation,
        from,
        to,
        current: from,
        status: Conversion_Status.PENDING,
      },
    });

    return NextResponse.json({
      message: "The File uploaded successfully",
      id: conversion.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "ERR Creating the Conversion",
      },
      { status: 500 },
    );
  }

  // Return UUID
};
