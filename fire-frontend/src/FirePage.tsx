import chroma from "chroma-js";
import { motion } from "framer-motion";
import { FaCircleInfo, FaFire, FaHouseFire } from "react-icons/fa6";
import { useSearchParams } from "react-router-dom";

const RiskCopy = {
    0: "Your property is well maintained and does not pose a fire risk. Keep up the good work!",
    0.25: "Your property low-risk and meets basic fire safety requirements. Consider additional precautions to reduce fire risk.",
    0.5: "Your property is a moderate-risk for spreading fire and may require additional fire safety measures. Take steps to reduce fire risk and protect your home.",
    0.75: "Your property has been identified as a potential fire code violation due to overgrown vegetation and insufficient defensible space around the home. These conditions increase the risk of fire spreading and do not comply with current fire safety regulations. Please address these issues by clearing brush and ensuring proper spacing between structures to avoid further action.",
};

function parseScore(score: string) {
    // y2022s0.1y2020s0.2 and so on
    const scoreMap: Record<string, number> = {};
    const scores = score.split("y");
    scores.forEach((s) => {
        const [year, value] = s.split("s");
        // MODIFYING SCORE TO BE 1 - SCORE
        scoreMap[parseInt(year)] = 1 - parseFloat(value);
    });
    return scoreMap;
}

function getOrderedScores(scoreMap: Record<string, number>) {
    return Object.keys(scoreMap)
        .sort()
        .map((year) => scoreMap[year]);
}

function roundToFivePlaces(num: number) {
    return Math.round(num * 100000) / 100000;
}

const FirePage = () => {
    let [searchParams] = useSearchParams();

    // extract lat, lon, width, height from searchParams
    const lat = roundToFivePlaces(
        parseFloat(searchParams.get("lat") || "40.7128"),
    );
    const lon = roundToFivePlaces(
        parseFloat(searchParams.get("lon") || "-74.0060"),
    );
    const width = searchParams.get("width") || "100";
    const height = searchParams.get("height") || "100";
    const image = searchParams.get("image") || "";
    const score = searchParams.get("score") || "y2016s0.7";
    const scoreMap = parseScore(score);
    const recentScore = getOrderedScores(scoreMap)[0];
    const email = searchParams.get("email") || "anonymous";
    const address = searchParams.get("address") || "Unknown Address";
    const llm = searchParams.get("llm") || "";
    console.log(llm);

    // first line of llm is the assessment, the rest is the recommendation
    const llmAssessment = llm.split("\n")[0];
    const llmRecommendation = llm.split("\n").slice(1).join("\n");

    console.log(lat, lon, width, height, score, email);

    const scale = chroma.scale(["green", "orange", "red"]);
    const bgColor = (a: number) => scale(recentScore).alpha(a).hex();

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
    }

    return (
        <div className="flex h-screen w-screen flex-row items-start">
            <div className="flex min-h-full flex-1 flex-col gap-4 p-[6vh]">
                <h1 className="text-xl text-gray-400">For {email}</h1>
                <h1 className="mt-4 text-4xl font-bold text-gray-900">
                    {/* {email} */}
                    {address}
                    {/* {addressLine1} */}
                    {/* <br />
                    {addressLine2} */}
                </h1>
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
                    target="_blank"
                >
                    <h1 className="-mt-2 text-xl text-gray-400 hover:underline">
                        {lat}, {lon}
                    </h1>
                </a>

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
                        🔥 Risk Level ~ {Math.floor(recentScore * 100)}%
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
                                width: `${recentScore * 90 + 10}%`,
                            }}
                            transition={{
                                delay: 0.5,
                            }}
                        />
                    </div>
                </div>

                <p className="text-lg text-gray-700">{getCopy(recentScore)}</p>

                {llm && (
                    <p className="text-lg text-gray-700">
                        <strong>Assessment:</strong> {llmAssessment} <br />
                        <strong>Recommendations:</strong> {llmRecommendation}
                    </p>
                )}

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
                                    src={
                                        image
                                            ? `https://firebasestorage.googleapis.com/v0/b/contest-submissions-575ab.appspot.com/o/fairefighter%2F${image}?alt=media`
                                            : "https://media.mkpcdn.com/prod/1000x/c7f6de01913f4321df173a0f4e82b8ba_119773.jpg"
                                    }
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
