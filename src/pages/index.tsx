import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import { useRef, useEffect } from "react";
import style from "./main.module.scss";
import Image from "next/image";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pixelSize = 10;
    const letterSpacing = 1;

    const textPattern = [
      [
        [1, 1, 1, 0, 0],
        [1, 0, 0, 1, 0],
        [1, 0, 0, 1, 0],
        [1, 0, 0, 1, 0],
        [1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0],
      ],
      [
        [0, 1, 1, 1, 0, 0],
        [1, 0, 0, 0, 0, 0],
        [0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0],
        [1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ],
      [[0], [0], [0], [0], [0], [0]],
      [
        [1, 0, 0, 1, 0],
        [1, 0, 1, 0, 0],
        [1, 1, 0, 0, 0],
        [1, 0, 1, 0, 0],
        [1, 0, 0, 1, 0],
        [0, 0, 0, 0, 0],
      ],
      [
        [0, 1, 1, 1, 0, 0],
        [1, 0, 0, 0, 1, 0],
        [1, 1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1, 0],
        [1, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0],
      ],
      [
        [1, 0, 0, 0, 1, 0],
        [1, 1, 0, 0, 1, 0],
        [1, 0, 1, 0, 1, 0],
        [1, 0, 0, 1, 1, 0],
        [1, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0],
      ],
      [
        [1, 1, 1, 0, 0],
        [1, 0, 0, 1, 0],
        [1, 1, 1, 0, 0],
        [1, 0, 0, 1, 0],
        [1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0],
      ],
      [
        [0, 1, 1, 1, 0, 0],
        [1, 0, 0, 0, 1, 0],
        [1, 1, 1, 1, 1, 0],
        [1, 0, 0, 0, 1, 0],
        [1, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0],
      ],
      [
        [1, 0, 0, 0, 1, 0],
        [1, 1, 0, 0, 1, 0],
        [1, 0, 1, 0, 1, 0],
        [1, 0, 0, 1, 1, 0],
        [1, 0, 0, 0, 1, 0],
      ],
    ];

    const drawLetter = (letter: number[][], xOffset: number) => {
      letter.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          ctx.fillStyle = cell ? "#007bff" : "#fff";
          ctx.fillRect(xOffset + colIndex * pixelSize, rowIndex * pixelSize, pixelSize, pixelSize);
        });
      });
    };

    const clearCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const drawTextWithAnimation = () => {
      let xOffset = 0;

      textPattern.forEach((letter, index) => {
        setTimeout(() => {
          drawLetter(letter, xOffset);
          xOffset += letter[0].length * pixelSize + letterSpacing * pixelSize;
        }, index * 900);
      });

      setTimeout(() => {
        setTimeout(() => {
          clearCanvas();
          drawTextWithAnimation();
        }, 10000);
      }, textPattern.length * 600);
    };

    drawTextWithAnimation();
  }, []);

  return (
    <div className={style.main}>
      <Header />
      <div className={style.main__content}>
        <canvas ref={canvasRef} width={530} height={50} className={style.canvas} />
        <Image src="/img/we.gif" alt="img" width={530} height={200} style={{ borderRadius: "10px" }} priority />
      </div>
      <Footer />
    </div>
  );
}
//test
