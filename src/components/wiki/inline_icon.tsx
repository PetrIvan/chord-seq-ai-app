import Image from "next/image";

interface Props {
  src: string;
  alt?: string;
  size?: "s" | "m" | "l";
}

export default function InlineIcon({ src, alt = "", size = "m" }: Props) {
  return (
    <Image
      className={`inline-block pb-1 ${
        size === "s" ? "w-4 h-4" : size === "m" ? "w-5 h-5" : "w-6 h-6"
      } `}
      src={src}
      alt={alt}
      width={100}
      height={100}
    />
  );
}
