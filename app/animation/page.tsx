"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "./animation.css";

export default function AnimationDona() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/accueil");
    }, 6000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="dona-animation">
      <svg
        className="wardrobe-svg"
        viewBox="0 0 700 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ARMOIRE */}
        <g className="wardrobe">

          {/* Couronne supérieure */}
          <path
            d="M150 145 Q350 65 550 145"
            className="line"
          />
          <path
            d="M145 145 Q350 105 555 145"
            className="line"
          />

          <path d="M155 145 L165 180 L535 180 L545 145" className="line" />

          {/* Structure */}
          <rect
            x="165"
            y="180"
            width="370"
            height="500"
            className="line"
          />

          {/* Intérieur */}
          <rect
            x="190"
            y="205"
            width="320"
            height="285"
            className="inside"
          />

          {/* Profondeur intérieure */}
          <path d="M190 205 L215 230 L485 230 L510 205" className="inside" />
          <path d="M215 230 L215 465" className="inside" />
          <path d="M485 230 L485 465" className="inside" />

          {/* Étagère */}
          <path d="M190 490 L510 490 L485 465 L215 465 Z" className="inside" />

          {/* Tiroir */}
          <rect
            x="190"
            y="515"
            width="320"
            height="80"
            rx="3"
            className="line"
          />

          <circle cx="275" cy="555" r="8" className="handle" />
          <circle cx="425" cy="555" r="8" className="handle" />

          {/* Pieds */}
          <path d="M165 680 L165 710 L205 710 L220 680" className="line" />
          <path d="M480 680 L495 710 L535 710 L535 680" className="line" />

          {/* Barre à vêtements */}
          <line x1="220" y1="270" x2="480" y2="270" className="clothes-bar" />

          {/* Cintres gauche */}
          <g className="hangers">
            <path d="M245 270 Q245 255 255 255 Q265 255 265 270 L290 305 L220 305 Z" className="hanger" />
            <path d="M275 270 Q275 255 285 255 Q295 255 295 270 L320 305 L250 305 Z" className="hanger" />
            <path d="M305 270 Q305 255 315 255 Q325 255 325 270 L350 305 L280 305 Z" className="hanger" />
          </g>

          {/* Cintres droite */}
          <g className="hangers">
            <path d="M405 270 Q405 255 415 255 Q425 255 425 270 L450 305 L380 305 Z" className="hanger" />
            <path d="M435 270 Q435 255 445 255 Q455 255 455 270 L480 305 L410 305 Z" className="hanger" />
          </g>

          {/* LOGO DONA */}
          <g className="logo">
            <path
              d="M350 270 L350 245 Q350 232 362 232 Q374 232 374 245"
              className="logo-line"
            />

            <path
              d="M350 270 L310 295 L390 295 Z"
              className="logo-line"
            />

            <text
              x="350"
              y="330"
              textAnchor="middle"
              className="dona-text"
            >
              dona
            </text>

            {/* petits éclats */}
            <path d="M295 325 L300 325" className="sparkle" />
            <path d="M400 325 L405 325" className="sparkle" />
            <path d="M350 350 L350 356" className="sparkle" />
          </g>

          {/* CŒUR */}
          <path
            className="heart"
            d="M350 390
               C330 365 295 390 350 425
               C405 390 370 365 350 390 Z"
          />

          {/* PORTE GAUCHE */}
          <g className="door door-left">
            <rect
              x="165"
              y="180"
              width="185"
              height="310"
              className="door-line"
            />

            <rect
              x="190"
              y="205"
              width="135"
              height="260"
              className="door-line"
            />

            <circle cx="340" cy="335" r="9" className="handle" />
          </g>

          {/* PORTE DROITE */}
          <g className="door door-right">
            <rect
              x="350"
              y="180"
              width="185"
              height="310"
              className="door-line"
            />

            <rect
              x="375"
              y="205"
              width="135"
              height="260"
              className="door-line"
            />

            <circle cx="360" cy="335" r="9" className="handle" />
          </g>
        </g>
      </svg>
    </main>
  );
}