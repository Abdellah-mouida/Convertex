import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type StatusParams = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: StatusParams) {
  const { id } = await params;

  try {
    const conversion = await prisma.conversion.findUnique({ where: { id } });
    return NextResponse.json({ status: conversion?.status, sucess: true });
  } catch (error) {
    return NextResponse.json({ error: error, sucess: false }, { status: 404 });
  }

  return NextResponse.json({ message: "Status API works" });
}
