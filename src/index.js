import "core-js/fn/array/flat-map";
import fontLoader from "webfontloader";

import data from "./data";
import spiderChart from "./spiderChart/spiderChart";

const options = {
    width: 1200,
    height: 700,
    radius: 240,
    levels: 5,
    enterAnimation: true
};

const renderChart = () => spiderChart(data, "body", options);

fontLoader.load({
    google: {
        families: ["Open Sans"]
    },
    active: renderChart
});
