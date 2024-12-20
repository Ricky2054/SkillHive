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
                    display: false,
                    color: "rgba(70, 130, 180, 1)",
                },
                grid: {
                    color: "rgba(135, 206, 250, 0.3)",
                    lineWidth: 1,
                },
            },
            y: {
                ticks: {
                    display: false,
                    color: "rgba(70, 130, 180, 1)",
                },
                grid: {
                    color: "rgba(135, 206, 250, 0.3)",
                    lineWidth: 1,
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
        const data = [100, 104, 108, 112, 120, 152, 160, 174, 143, 173, 202, 419, 310, 501, 380, 172, 210, 252, 260, 274, 243, 273, 312, 419, 112, 214, 158, 162, 170, 152, 130, 174, 153, 223, 292, 510];
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
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            }}
        >
            <Line data={chartData} options={options} />
        </div>
    );
};

export default GrowingLineChart;
