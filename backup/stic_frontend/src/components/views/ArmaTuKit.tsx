"use client";

import React from "react";
import "../../styles/armaTuKit.css";
import engranajeImg from "@/assets/image/engranaje.png";
import poleaImg from "@/assets/image/poleas.png";
import separadorImg from "@/assets/image/separadores.png";
import Card from "../UI/Card"; 
import FloatingCart from "../UI/FloatingChat";

export default function ArmaTuKit() {
  return (
      <div className="arma-container">
        <h1 className="arma-title">Arma tu kit</h1>
        <div className="tarjetas-container">
          <Card title="Engranaje" image={engranajeImg} link="/engranajes" width={200} height={200}/>
          <Card title="Poleas" image={poleaImg} link="/poleas" width={200} height={200}/>
          <Card title="Separadores" image={separadorImg} link="/separadores" width={200} height={200}/>
        </div>
        <FloatingCart />
      </div>
  );
}
