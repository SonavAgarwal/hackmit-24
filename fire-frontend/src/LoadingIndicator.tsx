import chroma from "chroma-js";
import { motion } from "framer-motion";

interface Props {
    width: number;
    color?: string;
    delay?: number;
}

const LoadingIndicator = ({ width, color = "#ef4444", delay = 0 }: Props) => {
    const ANIMATION_CONFIG = {
        backgroundColor: [
            chroma(color).alpha(0.2).hex(),
            chroma(color).alpha(0.3).hex(),
            chroma(color).alpha(0.2).hex(),
        ],
    };

    const TRANSITION_CONFIG = {
        duration: 1,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        repeat: Infinity,
        repeatDelay: 0.5,
    };
    return (
        <div
            className="relative flex items-center justify-center"
            style={{
                width: width,
                height: width,
            }}
        >
            <motion.div
                animate={ANIMATION_CONFIG}
                transition={{
                    ...TRANSITION_CONFIG,
                    delay: 0.6 + delay,
                }}
                className="absolute h-full w-full rounded-full bg-red-500 bg-opacity-10"
            >
                <motion.div
                    style={{
                        width: (width / 5) * 3,
                        height: (width / 5) * 3,
                    }}
                    animate={ANIMATION_CONFIG}
                    transition={{
                        ...TRANSITION_CONFIG,
                        delay: 0.3 + delay,
                    }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-red-500 bg-opacity-10"
                >
                    <motion.div
                        style={{
                            width: width / 5,
                            height: width / 5,
                        }}
                        animate={ANIMATION_CONFIG}
                        transition={{
                            ...TRANSITION_CONFIG,
                            delay: 0 + delay,
                        }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-red-500 bg-opacity-10"
                    ></motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoadingIndicator;
