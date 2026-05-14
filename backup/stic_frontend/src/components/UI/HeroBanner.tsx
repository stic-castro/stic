import "../../styles/heroBanner.css";
import Link from "next/link";
import { RiArrowRightSLine } from "react-icons/ri";

export default function HeroBanner() {
  return (
    <section className="hero-banner">
      <div className="overlay">
        <h1 className="hero-title">SEPARADORES DE ARO</h1>
        <Link href="/productos?categoryId=1" className="cta-btn">
          Ver ahora <RiArrowRightSLine className="arrow-icon" />
        </Link>
      </div>
    </section>
  );
}
