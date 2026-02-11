import "dotenv/config";
import { Conversion, Conversion_Status } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { PNG_TO_JPEG } from "./converters/images";
import { randomUUID } from "crypto";

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
  const converted = await PNG_TO_JPEG(buffer);
  console.log("==> File was converted to " + c.toMime);
  console.log("Uplaoding the file back to Supabase...");
  const key = `${randomUUID()}_${randomUUID()}`.replace("\-\g", "");
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
