import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  // load the file from server

  // upload the file to S3

  // save metadata to Postgres

  // Return UUID

  return NextResponse.json({ message: "File uploaded successfully" });
};
