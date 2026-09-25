import { useState } from 'react';

interface Props {
  src: string;
  title: string;
  size?: 'md' | 'sm';
}

// Falls back to a placeholder if the image fails to load.
// alt is empty since the title is already shown next to it.
export function BookCover({ src, title, size = 'md' }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`cover cover--${size} cover--fallback`} aria-hidden="true">
        {title.charAt(0)}
      </div>
    );
  }

  return (
    <img
      className={`cover cover--${size}`}
      src={src}
      alt=""
      width={size === 'md' ? 80 : 40}
      height={size === 'md' ? 120 : 60}
      onError={() => setFailed(true)}
    />
  );
}
