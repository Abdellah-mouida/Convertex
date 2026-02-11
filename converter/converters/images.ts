import { randomUUID } from "crypto";
import { Converter } from "./def";
import { readFile, writeFile } from "fs/promises";
import { promisify } from "util";
import { exec as execAsync } from "child_process";
import { tmpdir } from "os";
import { join } from "path";
const exec = promisify(execAsync);

export const PNG_TO_JPEG: Converter = async (buff) => {
  const file = randomUUID();
  const tmp = tmpdir();
  const pngPath = join(tmp, `${file}.png`);
  const jpgPath = join(tmp, `${file}.jpg`);

  await writeFile(pngPath, buff);

  await exec(`magick ${pngPath} ${jpgPath}`);

  return readFile(jpgPath);
};

PNG_TO_JPEG.from = "png";
PNG_TO_JPEG.to = "jpg";
