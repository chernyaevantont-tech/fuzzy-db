import React, { useEffect, useRef, useCallback } from 'react';
import { mapRange } from '../../helpers/mapRange';

type GraphUnit = {
    a: number;
    b: number;
    c: number;
    d: number;
    is_triangle: boolean;
}

interface FuzzyGraphProps {
    start: number;
    end: number;
    units: GraphUnit[];
}

// Color palette for membership functions
const COLORS = [
    '#e74c3c', // red
    '#3498db', // blue
    '#2ecc71', // green
    '#9b59b6', // purple
    '#f39c12', // orange
    '#1abc9c', // teal
    '#e91e63', // pink
    '#00bcd4', // cyan
    '#ff5722', // deep orange
    '#8bc34a', // light green
];

const FuzzyGraph: React.FC<FuzzyGraphProps> = ({ start, end, units }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "gray";

        const graphTopCoord = 10;
        const graphLeftCoord = 35;
        const graphBottomCoord = canvas.height - 25;
        const graphRightCoord = canvas.width - 15;

        // Draw axes
        ctx.beginPath()
        ctx.moveTo(graphLeftCoord, graphTopCoord);
        ctx.lineTo(graphLeftCoord, graphBottomCoord);
        ctx.lineTo(graphRightCoord, graphBottomCoord);
        ctx.stroke();

        const drawHorizontalDash = (y: number) => {
            ctx.beginPath()
            ctx.moveTo(graphLeftCoord - 5, y);
            ctx.lineTo(graphLeftCoord + 5, y);
            ctx.stroke();
        }

        const drawVerticalDash = (x: number) => {
            ctx.beginPath()
            ctx.moveTo(x, graphBottomCoord - 5);
            ctx.lineTo(x, graphBottomCoord + 5);
            ctx.stroke();
        }

        drawHorizontalDash(graphTopCoord)
        drawHorizontalDash(graphTopCoord + 0.33 * (graphBottomCoord - graphTopCoord))
        drawHorizontalDash((graphTopCoord + graphBottomCoord) / 2)
        drawHorizontalDash(graphTopCoord + 0.67 * (graphBottomCoord - graphTopCoord))
        drawHorizontalDash(graphBottomCoord)

        drawVerticalDash(graphLeftCoord);
        drawVerticalDash(graphLeftCoord + 0.25 * (graphRightCoord - graphLeftCoord));
        drawVerticalDash((graphLeftCoord + graphRightCoord) / 2);
        drawVerticalDash(graphLeftCoord + 0.75 * (graphRightCoord - graphLeftCoord));
        drawVerticalDash(graphRightCoord);

        ctx.fillStyle = "gray";
        ctx.font = "14px Arial";
        ctx.textAlign = "right";
        ctx.fillText("1", graphLeftCoord - 8, graphTopCoord + 5);
        ctx.fillText("0.67", graphLeftCoord - 8, graphTopCoord + 0.33 * (graphBottomCoord - graphTopCoord) + 5);
        ctx.fillText("0.5", graphLeftCoord - 8, (graphTopCoord + graphBottomCoord) / 2 + 5);
        ctx.fillText("0.33", graphLeftCoord - 8, graphTopCoord + 0.67 * (graphBottomCoord - graphTopCoord) + 5);
        ctx.fillText("0", graphLeftCoord - 8, graphBottomCoord + 5);

        ctx.textAlign = "center"
        ctx.fillText(start.toFixed(2).toString(), graphLeftCoord, graphBottomCoord + 20);
        ctx.fillText((start + 0.25 * (end - start)).toFixed(2).toString(), graphLeftCoord + 0.25 * (graphRightCoord - graphLeftCoord), graphBottomCoord + 20);
        ctx.fillText(((end + start) / 2).toFixed(2).toString(), (graphLeftCoord + graphRightCoord) / 2, graphBottomCoord + 20);
        ctx.fillText((start + 0.75 * (end - start)).toFixed(2).toString(), graphLeftCoord + 0.75 * (graphRightCoord - graphLeftCoord), graphBottomCoord + 20);
        ctx.fillText(end.toFixed(2).toString(), graphRightCoord, graphBottomCoord + 20);

        const valueToGraphXCoord = (value: number) => mapRange(value, start, end, graphLeftCoord, graphRightCoord);
        const membershipToGraphYCoord = (membership: number) => mapRange(membership, 0, 1, graphBottomCoord, graphTopCoord);

        // Sort units by 'a' value for proper ordering
        const sortedUnits = [...units].sort((u1, u2) => u1.a - u2.a);

        // Draw each membership function
        sortedUnits.forEach((unit, index) => {
            const color = COLORS[index % COLORS.length];
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;

            ctx.beginPath();

            if (unit.is_triangle) {
                // Triangle: a=d (left foot), b=c (peak)
                // Shape: starts at 0, goes up to peak at (b,1), goes back down to 0 at d
                ctx.moveTo(valueToGraphXCoord(unit.a), membershipToGraphYCoord(0));
                ctx.lineTo(valueToGraphXCoord(unit.b), membershipToGraphYCoord(1));
                ctx.lineTo(valueToGraphXCoord(unit.d), membershipToGraphYCoord(0));
            } else {
                // Trapezoidal: a (left foot), b (left shoulder), c (right shoulder), d (right foot)
                // Shape: 0 at a, rises to 1 at b, stays 1 until c, drops to 0 at d
                ctx.moveTo(valueToGraphXCoord(unit.a), membershipToGraphYCoord(0));
                ctx.lineTo(valueToGraphXCoord(unit.b), membershipToGraphYCoord(1));
                ctx.lineTo(valueToGraphXCoord(unit.c), membershipToGraphYCoord(1));
                ctx.lineTo(valueToGraphXCoord(unit.d), membershipToGraphYCoord(0));
            }

            ctx.stroke();
        });

        // Reset line width
        ctx.lineWidth = 1;
    }, [units, start, end]);

    useEffect(() => {
        draw();
    }, [draw]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (!canvas.parentElement) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.target === canvas.parentElement) {
                    canvas.width = canvas.parentElement.clientWidth - canvas.offsetLeft;
                    draw();
                }
            }
        });


        observer.observe(canvas.parentElement);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <canvas ref={canvasRef} height={300} />
    );
};

export default FuzzyGraph;