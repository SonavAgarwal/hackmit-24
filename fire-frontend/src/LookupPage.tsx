import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import LoadingIndicator from "./LoadingIndicator";
import { createSearchParams, useNavigate } from "react-router-dom";

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
                "https://sophiasharif--abatement-with-upload-get-risk-endpoint.modal.run";
            const imageKey = uuidv4();
            const url = `${BASE_URL}/?lat=${lat}&lon=${lon}&width=${size}&height=${size}&year=${year}&key=${imageKey}`;

            const response = await fetch(url);
            const data = await response.json();
            console.log("imageKey", imageKey);

            // data should contain "risk" and "image" (base64 encoded)
            // // Fetch: "https://sophiasharif--abatement-get-risk-endpoint.modal.run/?lat=37.43112348844268&lon=-122.21332146865818&width=100&height=100&year=2016"
            // const BASE_URL =
            //     "https://sophiasharif--abatement-with-upload-get-risk-endpoint.modal.run";
            // const MIRROR_URL =
            //     "https://1245-131-239-15-54.ngrok-free.app/mirror";
            // const imageKey = uuidv4();
            // const url = `${MIRROR_URL}/?lat=${lat}&lon=${lon}&width=${size}&height=${size}&year=${year}&key=${imageKey}&url=${encodeURIComponent(BASE_URL)}`;

            // const response = await fetch(url, {
            //     method: "GET",
            //     headers: {
            //         "ngrok-skip-browser-warning": "69420",
            //         "ngrok-skip": "69420",
            //         "ngrok-override": "69420",
            //         "ngrok-override-host-header": "69420",
            //     },
            // });
            // const data = await response.json();
            // // data should contain "risk" and "image" (base64 encoded)

            console.log(data);
            //

            navigate({
                pathname: "/",
                search: createSearchParams({
                    score: "y2016s" + data.risk,
                    image: imageKey + ".jpg",
                    lat: lat + "",
                    lon: lon + "",
                    width: size + "",
                    height: size + "",
                    email: "anonymous",
                    address: "Unknown Address",
                }).toString(),
            });
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    return (
        <div className="relative flex h-screen w-screen flex-col items-center justify-center gap-4">
            <div className="flex w-[30rem] flex-row justify-center gap-4">
                <LoadingIndicator width={50} color="red" delay={0} />
                <LoadingIndicator width={50} color="orange" delay={0.2} />
                <LoadingIndicator width={50} color="green" delay={0.4} />
            </div>
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
