import "dotenv/config";
import { Conversion, Conversion_Status } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
// import { PNG_TO_JPEG } from "./converters/images";
import { randomUUID } from "crypto";
import { findConverter } from "./converters/graph";

const convert = async (c: Conversion) => {
  const bucket = process.env.SUPABASE_BUCKET as string;
  console.log("Getting the File form Supabase....");
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(c.fileLocation);

  if (error) {
    throw new Error("Conversion Failed !!");
  }
  console.log("==> File Received");
  console.log("Converting the File to " + c.toMime + " Format ...");
  const buffer = Buffer.from(await data.arrayBuffer());
  const converters = findConverter(c.fromMime, c.toMime);
  console.log(converters);
  if (!converters) {
    console.error("No Converter Found for " + c.fromMime + " to " + c.toMime);
    await prisma.conversion.update({
      where: { id: c.id },
      data: {
        status: Conversion_Status.FAILED,
      },
    });
    return;
  }

  // let converted = null;
  // for (const edge of converters) {
  const converter = findConverter(c.fromMime, c.toMime);
  if (!converter) {
    console.log("No Converter Found for " + c.fromMime + " to " + c.toMime);
    await prisma.conversion.update({
      where: { id: c.id },
      data: {
        status: Conversion_Status.FAILED,
      },
    });
    return;
  }
  console.log(
    "Converter Found : Conerting From " +
      converter.from +
      " --> " +
      converter.to,
  );
  const converted = await converter(buffer);
  if (!converted) {
    console.error("Conversion Failed for " + c.fromMime + " to " + c.toMime);
    await prisma.conversion.update({
      where: { id: c.id },
      data: {
        status: Conversion_Status.FAILED,
      },
    });
    return;
  }

  console.log("==> File was converted to " + c.toMime);
  console.log("Uplaoding the file back to Supabase...");
  const key = `${randomUUID().replaceAll("-", "")}`;
  const fileLocation = `uploads/${key}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileLocation, converted);
  if (uploadError) {
    throw new Error("Error while ReUploading the Converted File");
  }
  console.log("==> File Uploaded");
  console.log("Updating the file loc in the DB...");
  const conversions = await prisma.conversion.update({
    where: { id: c.id },
    data: {
      status: Conversion_Status.COMPLETED,
      fileLocation: fileLocation,
      currentMime: c.toMime,
    },
  });
  console.log("DONE !!");
};
const main = async () => {
  const conversions = await prisma.conversion.findMany({
    where: { status: Conversion_Status.PENDING },
  });
  console.log(
    "--------------- Found " +
      conversions.length +
      " to Converte ----------------------",
  );

  for (const c of conversions) {
    await convert(c);
  }
};

const loop = async () => {
  while (true) {
    await main();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

loop().catch(console.error);
