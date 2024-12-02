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
  warningThreshold: 1000,
  warningFadeDuration: 600,
  warningBaseColor: { background: "#FFFAF0", text: "#FFA500" },
};

const LIMIT_OPTIONS = [10, 100, 1000, 3000];

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
  const [rangeLimit, setRangeLimit] = useState<number>(LIMIT_OPTIONS[1]);
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
    const iterations = Math.max(1, newPower);
    const newApproximation = calculatePi(iterations);

    if (newPower >= CONFIG.warningThreshold) {
      setWarningMessage(
        "Advertencia: El cálculo puede ser muy pesado para tu navegador y puede fallar."
      );
    } else {
      setWarningMessage(null);
    }

    const newIterations = Array.from({ length: iterations }, (_, i) => i + 1);
    const newValues = newIterations.map((iter) => calculatePi(iter));

    setPower(iterations);
    setApproximation(newApproximation);
    setChartData({ iterations: newIterations, values: newValues });
  };

  const handleSliderChange = (value: number) => {
    updateApproximation(value);
  };

  const handleLimitChange = (limit: number) => {
    setRangeLimit(limit);
    setPower(CONFIG.initialPower);
    setApproximation(CONFIG.initialApproximation);
    setChartData({ iterations: [], values: [] });
    setWarningMessage(null);
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
      <div className="p-6 bg-white shadow-lg rounded-lg space-y-6">
        {/* Título principal */}
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Configuración de Aproximación
        </h2>

        {/* Selector de límites */}
        <section className="space-y-4 justify-center flex flex-col w-full">
          <h3 className="text-lg font-semibold text-gray-700 text-center">
            Selecciona el Límite
          </h3>
          <div className="inline-flex justify-center">
            {LIMIT_OPTIONS.map((limit, index) => (
              <button
                key={limit}
                onClick={() => handleLimitChange(limit)}
                className={`px-4 py-2 border transition-colors ${
                  rangeLimit === limit
                    ? "border-gray-700 bg-gray-700 text-white"
                    : "border-gray-700 text-gray-700 hover:bg-slate-100"
                } ${
                  index === 0
                    ? "rounded-l-sm"
                    : index === LIMIT_OPTIONS.length - 1
                      ? "rounded-r-sm"
                      : ""
                }`}
              >
                {limit}
              </button>
            ))}
          </div>
        </section>

        {/* Control deslizante */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 text-center">
            Ajusta el Nivel de Aproximación
          </h3>
          <input
            id="approximationSlider"
            type="range"
            min={1}
            max={rangeLimit}
            value={power}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-700"
            onChange={(e) => handleSliderChange(Number(e.target.value))}
          />
          <p className="text-center text-gray-600 text-sm">
            Desliza para ajustar entre 1 y {rangeLimit}.
          </p>
        </section>

        {/* Mensaje de advertencia */}
        {warningMessage && (
          <div
            ref={warningRef}
            className="p-3 text-sm rounded-md text-center"
            style={{
              backgroundColor: CONFIG.warningBaseColor.background,
              color: CONFIG.warningBaseColor.text,
              transition: "background-color 0.3s ease, color 0.3s ease",
            }}
          >
            {warningMessage}
          </div>
        )}

        {/* Nivel actual de aproximación */}
        <section className="space-y-2">
          <h3 className="text-lg font-ligh text-gray-700 text-center">
            Nivel Actual: <span className="font-semibold">{power}</span>
          </h3>
        </section>

        {/* Resultado de la aproximación */}
        <section className="space-y-2">
          <div className="text-lg font-mono text-center text-gray-800 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-6 text-gray-700 text-center">
              Resultado de la Aproximación:
            </h3>
            {approximation}
          </div>
        </section>
      </div>

      <div className="p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Gráfico de Aproximaciones
        </h2>
        <Line data={chartDataset} />
      </div>
    </div>
  );
};

export default Counter;
