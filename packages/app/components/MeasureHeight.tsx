import React, { FC, HTMLAttributes, useEffect, useLayoutEffect, useRef } from 'react';

import { debounce } from 'app/functions';

interface Props extends HTMLAttributes<HTMLDivElement> {
    onMeasure: (height: number) => void;
}

const MeasureHeight: FC<Props> = ({ onMeasure, ...props }) => {
    const elRef = useRef<HTMLDivElement>(null);

    // The ref is updated after the commit, since the render may be discarded
    const onMeasureRef = useRef(onMeasure);
    useLayoutEffect(() => {
        onMeasureRef.current = onMeasure;
    });

    useEffect(() => {
        const measure = () => {
            requestAnimationFrame(() => {
                if (!elRef.current) {
                    return;
                }

                onMeasureRef.current(elRef.current.getBoundingClientRect().height);
            });
        };

        // Run initial measurement
        measure();

        // The size may change on each animation frame (e.g. while the height is being animated),
        // so the measurements are debounced to not trigger the state update on each frame
        const enqueueMeasurement = debounce(measure, 100);

        // ResizeObserver might not be available in very old browsers or unit tests
        let resizeObserver: ResizeObserver | undefined;

        if (elRef.current && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(enqueueMeasurement);
            resizeObserver.observe(elRef.current);
        }

        return () => {
            resizeObserver?.disconnect();
            enqueueMeasurement.clear();
        };
    }, []);

    return <div ref={elRef} {...props} />;
};

export default MeasureHeight;
