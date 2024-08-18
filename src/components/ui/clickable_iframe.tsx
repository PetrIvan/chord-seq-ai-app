import React, { useRef, useEffect, useState } from "react";

interface ClickableIframeProps
  extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  src: string;
  onInferredClick: () => void;
}

export default function ClickableIframe({
  src,
  onInferredClick,
  ...props
}: ClickableIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [hasClicked, setHasClicked] = useState<boolean>(false);

  useEffect(() => {
    const handleBlur = (): void => {
      if (document.activeElement === iframeRef.current && !hasClicked) {
        setHasClicked(true);
        onInferredClick();
      }
    };

    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, [onInferredClick, hasClicked]);

  return <iframe ref={iframeRef} src={src} {...props} />;
}
