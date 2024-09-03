import Image from "next/image";
import fs from "fs/promises";
import { getPlaiceholder } from "plaiceholder";

interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default async function LargeImage({
  src,
  alt,
  width,
  height,
  className = "w-full h-full rounded-lg",
}: Props) {
  const buffer = await fs.readFile(`./public${src}`);
  const { base64 } = await getPlaiceholder(buffer);

  return (
    <Image
      className={className}
      src={src}
      alt={alt}
      width={width}
      height={height}
      placeholder="blur"
      blurDataURL={base64}
    />
  );
}
