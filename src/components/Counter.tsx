import React, { useState, useEffect, useRef } from "react";
import Decimal from "decimal.js";
import anime from "animejs";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
);

const CONFIG = {
  initialPower: 1,
  initialApproximation: "4.0000000000000000000",
  minPower: 1,
  maxPower: 10000,
  warningThreshold: 3000,
  warningFadeDuration: 600,
  warningBaseColor: { background: "#FFFAF0", text: "#FFA500" },
};

const Counter = () => {
  const [power, setPower] = useState(CONFIG.initialPower);
  const [approximation, setApproximation] = useState(
    CONFIG.initialApproximation
  );
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{
    iterations: number[];
    values: string[];
  }>({
    iterations: [],
    values: [],
  });
  const warningRef = useRef<HTMLDivElement>(null);

  const calculatePi = (iterations: number): string => {
    let result = new Decimal(0);
    for (let i = 0; i < iterations; i++) {
      const term = new Decimal((-1) ** i).div(2 * i + 1);
      result = result.plus(term);
    }
    return result.mul(4).toFixed(19);
  };

  const updateApproximation = (newPower: number) => {
    const iterations = Math.max(CONFIG.minPower, newPower);
    const newApproximation = calculatePi(iterations);

    if (newPower >= CONFIG.warningThreshold) {
      setWarningMessage(
        "Advertencia: El cálculo puede ser muy pesado para tu navegador y puede fallar."
      );
    } else {
      setWarningMessage(null);
    }

    setPower(iterations);
    setApproximation(newApproximation);

    setChartData((prev) => {
      const index = prev.iterations.indexOf(iterations);

      if (index >= 0) {
        return {
          iterations: prev.iterations.slice(0, index + 1),
          values: prev.values.slice(0, index + 1),
        };
      }

      return {
        iterations: [...prev.iterations, iterations],
        values: [...prev.values, newApproximation],
      };
    });
  };

  const handleSliderChange = (value: number) => {
    updateApproximation(value);
  };

  useEffect(() => {
    if (warningMessage && warningRef.current) {
      anime({
        targets: warningRef.current,
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: CONFIG.warningFadeDuration,
        easing: "easeOutExpo",
      });
    }
  }, [warningMessage]);

  const getWarningStyles = (
    value: number
  ): { backgroundColor: string; color: string } => {
    if (value <= CONFIG.warningThreshold) {
      return {
        backgroundColor: CONFIG.warningBaseColor.background,
        color: CONFIG.warningBaseColor.text,
      };
    }
    const intensity = Math.min(
      (value - CONFIG.warningThreshold) /
        (CONFIG.maxPower - CONFIG.warningThreshold),
      1
    );
    const red = 255;
    const green = Math.round(165 - intensity * 165);
    const color = `rgb(${red}, ${green}, 0)`;
    const backgroundColor = `rgba(${red}, ${green}, 0, 0.1)`;
    return { backgroundColor, color };
  };

  const chartDataset = {
    labels: chartData.iterations,
    datasets: [
      {
        label: "Aproximación de π",
        data: chartData.values.map((v) => parseFloat(v)),
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 gap-6 min-h-screen w-full p-4 lg:p-8">
      <div className="p-6 bg-white shadow-lg rounded-lg space-y-4">
        <div className="text-center space-y-4">
          <label
            htmlFor="approximationSlider"
            className="block text-lg font-medium text-gray-700"
          >
            Ajusta el Nivel de Aproximación
          </label>
          <input
            id="approximationSlider"
            type="range"
            min={CONFIG.minPower}
            max={CONFIG.maxPower}
            value={power}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            onChange={(e) => handleSliderChange(Number(e.target.value))}
          />
        </div>

        {warningMessage && (
          <div
            ref={warningRef}
            className="p-2 text-sm rounded-md"
            style={{
              ...getWarningStyles(power),
              transition: "background-color 0.3s ease, color 0.3s ease",
            }}
          >
            {warningMessage}
          </div>
        )}

        <div className="text-2xl font-mono text-gray-700 text-center">
          Nivel de Aproximación: {power}
        </div>

        <div className="text-lg font-mono text-center text-gray-800 p-4 bg-gray-50 rounded-md border border-gray-200">
          Aproximación: {approximation}
        </div>
      </div>

      <div className="p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-lg font-medium text-gray-700 text-center mb-4">
          Gráfico de Aproximaciones
        </h2>
        <Line data={chartDataset}/>
      </div>
    </div>
  );
};

export default Counter;
