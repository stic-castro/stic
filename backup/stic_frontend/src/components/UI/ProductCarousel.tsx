import { useState } from "react";
import ProductCard from "./ProductCard";
import Link from "next/link";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { Product } from "@/app/types/Products";

interface Props {
  title: string;
  products: Product[];
  categoryId: number;
}

export default function ProductCarousel({ title, products, categoryId }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const productsToShow = 6;

  const nextSlide = () => {
    if (currentIndex < products.length - productsToShow) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <section className="product-carousel">
      <h2 className="product-title product-title-home">{title}</h2>
      <div className="carousel-wrapper">
        <div
          className="carousel-products"
          style={{ transform: `translateX(-${currentIndex * 220}px)` }}
        >
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              image={p.image}
              name={p.name}
              price={p.price}
            />
          ))}
        </div>
      </div>
      {currentIndex > 0 && (
        <button className="arrow arrow-left" onClick={prevSlide}>
          <RiArrowLeftSLine className="arrow-icon" />
        </button>
      )}

      {currentIndex < products.length - productsToShow && (
        <button className="arrow arrow-right" onClick={nextSlide}>
          <RiArrowRightSLine className="arrow-icon" />
        </button>
      )}
      <Link className="view-more-btn" href={`/productos?categoryId=${categoryId}`}>
        Ver mas
      </Link>
    </section>
  );
}
