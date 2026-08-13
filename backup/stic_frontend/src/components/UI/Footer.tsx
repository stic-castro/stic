import "../../styles/footer.css";
import instagram from "@/assets/image/instagram.png";
import facebook from "@/assets/image/facebook.png";
import whatsApp from "@/assets/image/whatsApp.png";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white pt-10 pb-5 px-6 md:px-16">
      <div className="footer-container">
        <div className="footer-socials">
          <a href="https://www.facebook.com/people/STIC/100085433059639/" target="_blank" rel="noreferrer">
            <Image
              src={whatsApp}
              alt="WhatsApp"
              className="footer-icon"
              width={30}
              height={30}
            />
          </a>
          <a href="https://www.facebook.com/people/STIC/100085433059639/" target="_blank" rel="noreferrer">
            <Image
              src={facebook}
              alt="Facebook"
              className="footer-icon"
              width={30}
              height={30}
            />
          </a>
          <a href="https://www.facebook.com/people/STIC/100085433059639/" target="_blank" rel="noreferrer">
            <Image
              src={instagram}
              alt="Instagram"
              className="footer-icon"
              width={30}
              height={30}
            />
          </a>
        </div>

        <div className="footer-columns">
          <div className="footer-column">
            <h3>STIC</h3>
            <p>
              Fabricado de maquinarias industriales, fresado de herramientas y
              separadores de aros de vehículos.
            </p>
          </div>
          <div className="footer-column">
            <h3>INDUSTRIA</h3>
            <a href="/about">Acerca de nosotros</a>
          </div>
          <div className="footer-column">
            <h3>AYUDA</h3>
            <a href="/terms">Términos & Condiciones</a>
            <br />
            <a href="/support">Soporte</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
