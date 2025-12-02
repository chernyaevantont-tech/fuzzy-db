import React, { useEffect, useRef } from 'react';
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

const FuzzyGraph: React.FC<FuzzyGraphProps> = ({ start, end, units }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.strokeStyle = "gray";

        const graphTopCoord = 10;
        const graphLeftCoord = 35;
        const graphBottomCoord = canvas.height - 25;
        const graphRightCoord = canvas.width - 15;

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

        ctx.font = "14px Arial";
        ctx.fillText("1", graphLeftCoord - 15, graphTopCoord + 5);
        ctx.fillText("0.67", graphLeftCoord - 35, (graphTopCoord + graphBottomCoord) / 3 + 5)
        ctx.fillText("0.5", graphLeftCoord - 27, (graphTopCoord + graphBottomCoord) / 2 + 5)
        ctx.fillText("0.33", graphLeftCoord - 35, (graphTopCoord + graphBottomCoord) / 3 * 2 + 5)
        ctx.fillText("0", graphLeftCoord - 15, graphBottomCoord + 5);

        ctx.textAlign = "center"
        ctx.fillText(start.toFixed(2).toString(), graphLeftCoord, graphBottomCoord + 20);
        ctx.fillText((start + 0.25 * (end - start)).toFixed(2).toString(), graphLeftCoord + 0.25 * (graphRightCoord - graphLeftCoord), graphBottomCoord + 20);
        ctx.fillText(((end + start) / 2).toFixed(2).toString(), (graphLeftCoord + graphRightCoord) / 2, graphBottomCoord + 20);
        ctx.fillText((start + 0.75 * (end - start)).toFixed(2).toString(), graphLeftCoord + 0.75 * (graphRightCoord - graphLeftCoord), graphBottomCoord + 20);
        ctx.fillText(end.toFixed(2).toString(), graphRightCoord, graphBottomCoord + 20);

        const valueToGraphXCoord = (value: number) => mapRange(value, start, end, graphLeftCoord, graphRightCoord)

        ctx.strokeStyle = "red";
        const firstUnit = units[0];
        ctx.beginPath()
        ctx.moveTo(graphLeftCoord, graphTopCoord);
        ctx.lineTo(valueToGraphXCoord(firstUnit.c), graphTopCoord);
        ctx.lineTo(valueToGraphXCoord(firstUnit.d), graphBottomCoord)
        ctx.stroke();
    }

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