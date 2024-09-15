import chroma from "chroma-js";
import { motion } from "framer-motion";
import { FaCircleInfo, FaFire, FaHouseFire, FaTruck } from "react-icons/fa6";
import { useSearchParams } from "react-router-dom";

const RiskCopy = {
    0: "Your property is in a safe zone and does not pose a fire risk. Keep up the good work!",
    0.25: "Your property is in a low-risk zone and meets basic fire safety requirements. Consider additional precautions to reduce fire risk.",
    0.5: "Your property is in a moderate-risk zone and may require additional fire safety measures. Take steps to reduce fire risk and protect your home.",
    0.75: "Your property has been identified as a potential fire code violation due to overgrown vegetation and insufficient defensible space around the home. These conditions increase the risk of fire spreading and do not comply with current fire safety regulations. Please address these issues by clearing brush and ensuring proper spacing between structures to avoid further action.",
};

const FirePage = () => {
    let [searchParams, setSearchParams] = useSearchParams();

    // extract lat, lon, width, height from searchParams
    const lat = searchParams.get("lat") || "40.7128";
    const lon = searchParams.get("lon") || "-74.0060";
    const width = searchParams.get("width") || "100";
    const height = searchParams.get("height") || "100";

    const score = 0.75;
    const email = "sophia.sharif@gmail.com";
    const addressLine1 = "1234 Elm St";
    const addressLine2 = "Springfield, IL 62701";

    const scale = chroma.scale(["green", "orange", "red"]);
    const bgColor = (a: number) => scale(score).alpha(a).hex();

    const ANIMATION_CONFIG = {
        backgroundColor: [bgColor(0.1), bgColor(0.2), bgColor(0.1)],
    };

    const TRANSITION_CONFIG = {
        duration: 1,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        repeat: Infinity,
        repeatDelay: 1.5,
    };

    function getCopy(score: number) {
        if (score < 0.25) {
            return RiskCopy[0];
        } else if (score < 0.5) {
            return RiskCopy[0.25];
        } else if (score < 0.75) {
            return RiskCopy[0.5];
        } else {
            return RiskCopy[0.75];
        }

        return RiskCopy[0];
    }

    return (
        <div className="flex h-screen w-screen flex-row">
            <div className="flex h-full flex-1 flex-col gap-4 p-[6vh]">
                <h1 className="text-4xl font-bold text-gray-900">
                    {email}
                    {/* {addressLine1} */}
                    {/* <br />
                    {addressLine2} */}
                </h1>
                <h1 className="-mt-2 text-xl text-gray-400">
                    {lat}, {lon}
                </h1>

                <h2 className="mt-4 text-2xl font-bold text-gray-600">
                    Risk Report
                </h2>
                {/* risk bar */}
                <div
                    className="flex w-full flex-col gap-2 rounded-xl p-4"
                    style={{
                        backgroundColor: bgColor(0.1),
                    }}
                >
                    <h2 className="text-lg font-bold text-gray-700">
                        🔥 Risk Level ~ {Math.floor(score * 100)}%
                    </h2>

                    <div
                        className="h-4 w-full rounded-full"
                        style={{
                            backgroundColor: bgColor(0.1),
                        }}
                    >
                        <motion.div
                            className="h-full rounded-full"
                            style={{
                                backgroundColor: bgColor(1),
                                width: 0,
                            }}
                            animate={{
                                width: `${score * 90 + 10}%`,
                            }}
                            transition={{
                                delay: 0.5,
                            }}
                        />
                    </div>
                </div>

                <p className="text-lg text-gray-700">{getCopy(score)}</p>

                {/* Resources */}
                <h2 className="mt-4 text-2xl font-bold text-gray-600">
                    Resources
                </h2>
                <div className="flex gap-4">
                    <a
                        href="https://readyforwildfire.org/prepare-for-wildfire/defensible-space/"
                        target="_blank"
                        className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg bg-black bg-opacity-5 p-6"
                    >
                        <FaCircleInfo size={24} color="dodgerblue" />
                        <p className="text-center text-lg text-blue-500">
                            Preparing your Home
                        </p>
                    </a>
                    <a
                        href="https://www.fire.ca.gov/incidents"
                        target="_blank"
                        className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg bg-black bg-opacity-5 p-6"
                    >
                        <FaFire size={24} color="dodgerblue" />
                        <p className="text-center text-lg text-blue-500">
                            Current Fires
                        </p>
                    </a>
                    {/* contact local fire department */}
                    <a
                        href="https://www.google.com/search?q=fire+department+near+me"
                        target="_blank"
                        className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg bg-black bg-opacity-5 p-6"
                    >
                        <FaHouseFire size={24} color="dodgerblue" />
                        <p className="text-center text-lg text-blue-500">
                            Your Local Fire Department
                        </p>
                    </a>
                </div>
            </div>

            <div className="relative h-full w-[100vh]">
                <motion.div
                    className="fixed h-full w-[100vh] rounded-bl-full rounded-tl-full p-[6vh]"
                    animate={ANIMATION_CONFIG}
                    transition={{
                        ...TRANSITION_CONFIG,
                        delay: 0.9,
                    }}
                >
                    <motion.div
                        className="h-full w-full rounded-full p-[6vh]"
                        animate={ANIMATION_CONFIG}
                        transition={{
                            ...TRANSITION_CONFIG,
                            delay: 0.6,
                        }}
                    >
                        <motion.div
                            className="h-full w-full rounded-full p-[6vh]"
                            animate={ANIMATION_CONFIG}
                            transition={{
                                ...TRANSITION_CONFIG,
                                delay: 0.3,
                            }}
                        >
                            <motion.div
                                className="h-full w-full rounded-full p-[6vh]"
                                animate={ANIMATION_CONFIG}
                                transition={{
                                    ...TRANSITION_CONFIG,
                                    delay: 0,
                                }}
                            >
                                <img
                                    className="h-full w-full rounded-full"
                                    src="https://storage.googleapis.com/support-forums-api/attachment/message-13353878-5028426867080247630.png"
                                />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default FirePage;
