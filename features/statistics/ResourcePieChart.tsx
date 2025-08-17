/**
 * @copyright Copyright (c) 2025 Tsutomu FUNADA
 * @license
 * This software is licensed for:
 * - Non-commercial use under the MIT License (see LICENSE-NC.txt)
 * - Commercial use requires a separate commercial license (contact author)
 * You may not use this software for commercial purposes under the MIT License.
 */

import { Box, Heading } from "@chakra-ui/react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const ResourcePieChart = ({
  data,
  title,
  colors,
}: {
  data: Record<string, number>;
  title: string;
  colors: Record<string, string>;
}) => {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: Object.keys(data).map(
          (key) => colors[key] || "#cccccc"
        ), // resourceMenu の色を適用
        hoverBackgroundColor: Object.keys(data).map(
          (key) => colors[key] || "#cccccc"
        ),
      },
    ],
  };

  const options: import("chart.js").ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
    },
    animation: {
      duration: 800,
      easing: "easeInOutQuart",
    },
  };

  return (
    <Box
      width="100%"
      maxWidth="400px"
      height="400px"
      p={2}
      bg="gray.100"
      borderRadius="md"
    >
      <Heading size="sm">{title}</Heading>
      <Pie data={chartData} options={options} />
    </Box>
  );
};

export default ResourcePieChart;
