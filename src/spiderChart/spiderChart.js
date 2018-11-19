import * as d3 from "d3";

import levelsRenderer from "./levelsRenderer";
import axisRenderer from "./axisRenderer";
import donutRenderer from "./donutRenderer";
import legendRenderer from "./legendRenderer";
import seriesRenderer from "./seriesRenderer";

/***
 * Renders spider chart
 * @param {array} data chart data
 * @param {string} baseSelector string selector identifying element that chart is append to
 * @param {object} options
 * @param {number} options.width svg area width
 * @param {number} options.height svg area height
 * @param {number} options.radius chart radius
 * @param {number} options.levels number of chart levels
 * @param {boolean} options.enterAnimation
 */
export default function spiderChart(data, baseSelector, options) {
    const { width, height, radius, levels, enterAnimation } = options;

    const svg = d3
        .select(baseSelector)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    if (enterAnimation) {
        svg.transition()
            .duration(1000)
            .ease(d3.easeExp)
            .attrTween("opacity", () => d3.interpolate(0, 1))
            .attrTween("transform", () => d3.interpolateString("scale(0.0)", "scale(1.0)"));
    }

    const mainGroup = svg
        .append("g")
        .attr("transform", `translate(${ width / 2 }, ${ height / 2 })`);

    const areaColors = d3.scaleLinear()
        .domain([0, 1.5, 3, 4])
        .range([
            "#53c6ff",
            "#0021ba",
            "#ff8823",
            "#187a2e"
        ])
        .interpolate(d3.interpolateHcl);

    const donutSize = 20;
    const innerRadius = 15;

    const renderLevels = levelsRenderer(mainGroup, { innerRadius, outerRadius: radius, levels });
    const renderDonut = donutRenderer(mainGroup, { innerRadius: radius, outerRadius: radius + donutSize });
    const renderAxis = axisRenderer(mainGroup, { innerRadius, outerRadius: radius, donutSize, labelSpacing: 40 });
    const renderSeries = seriesRenderer(mainGroup, { innerRadius, outerRadius: radius, color: areaColors });
    const renderLegend = legendRenderer(svg, { anchor: mainGroup, color: areaColors });

    (function update(data) {
        renderLevels(data);
        renderDonut(data);
        renderAxis(data, update);
        renderSeries(data, update);
        renderLegend(data, update);
    })(data);
}
