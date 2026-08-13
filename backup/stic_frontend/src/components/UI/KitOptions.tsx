import "../../styles/armaTuKit.css";
import Card from "./Card"; 
import engranajeImg from "@/assets/image/engranaje.png";
import poleaImg from "@/assets/image/poleas.png";
import separadorImg from "@/assets/image/separadores.png";

export default function KitOptions() {

  return (
    <section className="arma-container-kit">
      <h2 className="arma-title-kit">Arma tu kit</h2>
      <div className="tarjetas-container-kit">
        <Card title="Engranaje" image={engranajeImg} link="/engranajes" width={100} height={100}/>
        <Card title="Poleas" image={poleaImg} link="/poleas" width={100} height={100} />
        <Card title="Separadores" image={separadorImg} link="/separadores" width={100} height={100}/>
      </div>
    </section>
  );
}
