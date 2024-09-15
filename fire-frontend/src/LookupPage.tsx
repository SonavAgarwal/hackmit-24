import chroma from "chroma-js";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";
import { FaCircleInfo, FaFire, FaHouseFire } from "react-icons/fa6";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingIndicator from "./LoadingIndicator";

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
        scoreMap[parseInt(year)] = parseFloat(value);
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

const LookupPage = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [point, setPoint] = useState("");
    const [size, setSize] = useState(100);
    const [year, setYear] = useState(2016);

    const controls = useAnimationControls();

    useEffect(() => {
        if (loading) {
            controls.start({ opacity: 1, top: 0 });
        } else {
            controls.start({ opacity: 1, top: "100vh" });
        }
    }, [loading]);

    async function fetchPointData(point: string) {
        setLoading(true);
        try {
            // remove all whitespace, then split by comma, then take first two elements and parse as floats
            const [lat, lon] = point
                .replace(/\s/g, "")
                .split(",")
                .map(parseFloat);

            // Fetch: "https://sophiasharif--abatement-get-risk-endpoint.modal.run/?lat=37.43112348844268&lon=-122.21332146865818&width=100&height=100&year=2016"
            const BASE_URL =
                "https://sophiasharif--abatement-get-risk-endpoint.modal.run";
            const url = `${BASE_URL}/?lat=${lat}&lon=${lon}&width=${size}&height=${size}&year=${year}`;

            const response = await fetch(url);
            const data = await response.json();
            // data should contain "risk" and "image" (base64 encoded)

            console.log(data);
            //
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    return (
        <div className="relative flex h-screen w-screen flex-col items-center justify-center gap-4">
            <h1 className="text-4xl font-bold">Enter Coordinates</h1>
            <input
                type="text"
                placeholder="Latitude, Longitude"
                className="w-[30rem] rounded-xl border-2 border-gray-300 p-2 outline-none"
                value={point}
                onChange={(e) => setPoint(e.target.value)}
            />
            <div className="flex w-[30rem] flex-row gap-4">
                <input
                    type="number"
                    placeholder="Size"
                    className="flex-1 rounded-xl border-2 border-gray-300 p-2 outline-none"
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value))}
                />
                <input
                    type="number"
                    placeholder="Year"
                    className="flex-1 rounded-xl border-2 border-gray-300 p-2 outline-none"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                />
            </div>
            <button
                // gradient red to orange button
                className="w-[30rem] rounded-xl bg-black bg-gradient-to-br p-2 text-center text-white"
                onClick={() => {
                    fetchPointData(point);
                }}
            >
                {loading ? "Loading..." : "Lookup"}
            </button>
            <motion.div
                animate={controls}
                className="absolute flex h-screen w-screen items-center justify-center bg-gray-50"
                initial={{ opacity: 1, top: "100vh" }}
                transition={{ duration: 0.3 }}
            >
                <LoadingIndicator width={100} />
            </motion.div>
        </div>
    );
};

export default LookupPage;
