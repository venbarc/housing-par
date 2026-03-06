import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

interface Props {
    value: number;
    format?: (v: number) => string;
}

export default function AnimatedValue({ value, format }: Props) {
    const ref = useRef<HTMLSpanElement>(null);
    const prevValue = useRef(value);
    const [display, setDisplay] = useState(format ? format(value) : String(value));

    useEffect(() => {
        const from = prevValue.current;
        const to = value;
        prevValue.current = value;

        if (from === to) return;

        const controls = animate(from, to, {
            duration: 0.4,
            ease: 'easeOut',
            onUpdate(v) {
                setDisplay(format ? format(Math.round(v)) : String(Math.round(v)));
            },
        });

        return () => controls.stop();
    }, [value, format]);

    return <span ref={ref}>{display}</span>;
}
