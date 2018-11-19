import * as d3 from "d3";
import noop from "lodash.noop";

/**
 * Renders each data series.
 * Data series can be one of type: 'area', 'line', 'dot'.
 * Clicking series displays values near each data point
 * @param parent SVG parent group
 * @param innerRadius inner radius at which series starts
 * @param outerRadius outer radius at which series ends
 * @param color color scale to colorize each series
 * @returns {function}
 */
export default function seriesRenderer(parent, { innerRadius, outerRadius, color }) {
    const group = parent
        .append("g")
        .attr("class", CLASS_NAME.SERIES_CONTAINER);

    const radialAreaGenerator = d3.areaRadial()
        .angle(d => d.angle)
        .curve(d3.curveLinearClosed)
        .innerRadius(d => d.innerRadius)
        .outerRadius(d => d.outerRadius);

    const radialLineGenerator = d3.lineRadial()
        .angle(d => d.angle)
        .curve(d3.curveLinearClosed)
        .radius(d => d.outerRadius);

    const calculateDataPoints = (radiusScale) => (d) => d.values
        .map((v, i) => ({
            angle: 2 * Math.PI / d.values.length * i,
            innerRadius: innerRadius,
            outerRadius: radiusScale(v.value),
            value: v.value,
            type: d.type,
            key: d.key
        }));

    const setSeriesPolygon = (radiusScale) => el => el
        .attr("d", d => {
            const points = calculateDataPoints(radiusScale)(d);

            return d.type === "area"
                ? radialAreaGenerator(points)
                : radialLineGenerator(points);
        })
        .attr("fill", (d, i) => d.type === "area" ? color(i) : "none")
        .attr("stroke", (d, i) => d.type === "line" ? color(i) : "none");

    const handleSeriesClick = (data, update) => d => {
        const nextData = data
            .map(series => ({
                ...series,
                focus: series.key === d.key ? !series.focus : false,
                values: series.key === d.key
                    ? series.values.map(v => ({ ...v, focus: !series.focus, highlight: false, dim: false }))
                    : series.values.map(v => ({ ...v, focus: false, highlight: false, dim: false }))
            }));

        update(nextData);
    };

    return function render(data = [], update = noop) {
        const maxValue = d3.max(data, s => d3.max(s.values, v => v.value));
        const radiusScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([innerRadius, outerRadius * SCALE_FACTOR]);

        const seriesGroup = group
            .selectAll(`.${ CLASS_NAME.SERIES_GROUP }`)
            .data(data)
            .classed(CLASS_NAME.SERIES_GROUP_HIDDEN, d => d.hidden);

        seriesGroup.exit().remove();

        const enterSeries = seriesGroup.enter()
            .append("g")
            .attr("class", CLASS_NAME.SERIES_GROUP)
            .attr("data-series", d => d.key);

        enterSeries
            .append("path")
            .attr("class", CLASS_NAME.SERIES_POLYGON)
            .call(setSeriesPolygon(radiusScale))
            .on("click", handleSeriesClick(data, update));

        seriesGroup.select(`.${ CLASS_NAME.SERIES_POLYGON }`)
            .call(setSeriesPolygon(radiusScale))
            .on("click", handleSeriesClick(data, update));

        const seriesDots = enterSeries
            .attr("fill", (d, i) => color(i))
            .selectAll(`.${ CLASS_NAME.SERIES_POLYGON_DOT }`)
            .data(d => {
                if (d.type === "area") {
                    return false;
                }

                return calculateDataPoints(radiusScale)(d);
            });

        seriesDots.enter()
            .append("circle")
            .attr("class", CLASS_NAME.SERIES_POLYGON_DOT)
            .attr("cx", d => d.outerRadius * Math.sin(d.angle))
            .attr("cy", d => -d.outerRadius * Math.cos(d.angle))
            .attr("r", 4)
            .on("click", handleSeriesClick(data, update));

        seriesGroup.selectAll(`.${ CLASS_NAME.SERIES_POLYGON_DOT }`)
            .data(d => {
                if (d.type === "area") {
                    return false;
                }

                return calculateDataPoints(radiusScale)(d);
            })
            .attr("cx", d => d.outerRadius * Math.sin(d.angle))
            .attr("cy", d => -d.outerRadius * Math.cos(d.angle))
            .attr("r", 4)
            .on("click", handleSeriesClick(data, update));


        setLabelsPlacement(group, getLabelNodes(data, radiusScale, color));

        return group;
    };
}

const getLabelNodes = (data, radiusScale, color, nodeLabelOffset = 12) => data
    .flatMap((d, j) =>
        d.hidden
            ? []
            : d.values.map((v, i) => ({
                ...v,
                angle: 2 * Math.PI / d.values.length * i,
                color: color(j),
                outerRadius: radiusScale(v.value) + nodeLabelOffset
            }))
    )
    .filter(v => v.focus);

const setLabelsPlacement = (group, nodes, steps = 500) => {
    const simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-10))
        .force("x", d3.forceX().x(d => d.outerRadius * Math.sin(d.angle)))
        .force("y", d3.forceY().y(d => -d.outerRadius * Math.cos(d.angle)))
        .force("collision", d3.forceCollide().radius(18))
        .stop();

    for (let i = 0; i < steps; i++) {
        simulation.tick();
    }

    const labels = group
        .selectAll(`.${ CLASS_NAME.SERIES_VALUE }`)
        .data(nodes);

    labels.enter()
        .append("text")
        .merge(labels)
        .attr("class", CLASS_NAME.SERIES_VALUE)
        .attr("data-axis", d => d.axis)
        .attr("fill", d => d.color)
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .text(d => d.value);

    labels.exit().remove();
};

const SCALE_FACTOR = 0.85;
const CLASS_NAME = {
    SERIES_CONTAINER: "series",
    SERIES_GROUP: "series-group",
    SERIES_GROUP_HIDDEN: "series-group--hidden",
    SERIES_POLYGON: "series-polygon",
    SERIES_POLYGON_DOT: "series-polygon-dot",
    SERIES_VALUE: "series-value"
};
