import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const GrowingLineChart = () => {
    const [chartData, setChartData] = useState({
        labels: [], // Empty initially
        datasets: [
            {
                fill: false,
                data: [], // Empty initially
                borderColor: "rgba(135, 206, 250, 1)",
                backgroundColor: "rgba(30, 144, 255, 1)",
                pointBackgroundColor: "rgba(65, 105, 225, 1)",
                tension: 0.4,
                borderWidth: 2,
            },
        ],
    });

    const options = {
        responsive: true,
        scales: {
            x: {
                ticks: {
                    color: "rgba(70, 130, 180, 1)", // Steel Blue for x-axis
                },
                grid: {
                    color: "rgba(173, 216, 230, 0.2)", // Light Blue grid lines
                },
            },
            y: {
                ticks: {
                    color: "rgba(70, 130, 180, 1)", // Steel Blue for y-axis
                },
                grid: {
                    color: "rgba(173, 216, 230, 0.2)", // Light Blue grid lines
                },
            },
        },
        layout: {
            padding: 20,  // Adding some padding
            backgroundColor: "rgba(173, 216, 230, 1)", // Light Blue background color
        }
    };

    useEffect(() => {
        const labels = ["Jan, 2022", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan, 2023", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan, 2024", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const data = [0, 4, 8, 12, 20, 52, 60, 74, 43, 73, 102, 319, 210, 401, 280, 72, 110, 152, 160, 174, 143, 173, 212, 319, 12, 114, 58, 62, 70, 52, 30, 74, 53, 123, 192, 410];
        let index = 0;

        const interval = setInterval(() => {
            if (index < labels.length) {
                setChartData((prev) => ({
                    labels: [...prev.labels, labels[index]],
                    datasets: [
                        {
                            ...prev.datasets[0],
                            data: [...prev.datasets[0].data, data[index]],
                        },
                    ],
                }));
                index++;
            } else {
                clearInterval(interval);
            }
        }, 200); // Add new point every 200ms

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            style={{
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            }}
        >
            <Line data={chartData} options={options} />
        </div>
    );
};

export default GrowingLineChart;
