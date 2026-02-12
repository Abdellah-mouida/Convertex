import { randomUUID } from "crypto";
import { Converter } from "./def";
import { readFile, writeFile } from "fs/promises";
import { promisify } from "util";
import { exec as execAsync } from "child_process";
import { tmpdir } from "os";
import { join } from "path";
import { extension, lookup } from "mime-types";
const exec = promisify(execAsync);

const buildConverter = (from: string, to: string): Converter => {
  const extFrom = extension(from);
  const exrTo = extension(to);
  if (!extFrom || !exrTo) {
    throw new Error("Could not find extension for " + from + " or " + to);
  }
  const converter: Converter = async (buff) => {
    const file = randomUUID();
    const tmp = tmpdir();
    const fromPath = join(tmp, `${file}.${extFrom}`);
    const toPath = join(tmp, `${file}.${exrTo}`);
    await writeFile(fromPath, buff);
    await exec(`magick ${fromPath} ${toPath}`);
    return readFile(toPath);
  };
  converter.from = from;
  converter.to = to;
  return converter;
};
const formats = [
  "jpg",
  "jpeg",
  "png",
  "bmp",
  "gif",
  "tiff",
  "heic",
  "webp",
  "avif",
  "heif",
  "ico",
];
for (const from of formats) {
  for (const to of formats) {
    const fromMime = lookup(from);
    const toMime = lookup(to);
    if (!fromMime || !toMime) {
      throw new Error("Could not find mime type for " + from + " or " + to);
    }
    if (from === to) continue;
    exports[`${from.toUpperCase()}_TO_${to.toUpperCase()}`] = buildConverter(
      fromMime,
      toMime,
    );
  }
}
