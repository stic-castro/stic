import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';

interface CardProps {
  title: string;
  image: StaticImageData | string;
  link?: string;
  width: number
  height: number
}

export default function Card({ title, image, link, width, height }: CardProps) {
  return (
    <div className="tarjeta">
      {link ? (
        <Link href={link} className="tarjeta-content">
          <p className="tarjeta-texto">{title}</p>
          <Image
            src={image}
            alt={title}
            className="tarjeta-img"
            width={width} 
            height={height} 
          />
        </Link>
      ) : (
        <div className="kit-card">
          <Image
            src={image}
            alt={title}
            width={width} 
            height={height} 
          />
          <p>{title}</p>
        </div>
      )}
    </div>
  );
}
