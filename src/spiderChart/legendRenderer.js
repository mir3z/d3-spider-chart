import * as d3 from "d3";
import noop from "lodash.noop";

/**
 * Renders vertically centered legend at the right side of *anchor*.
 * Clicking each legend cell updates chart data with properties that can be used to toggle series visibility.
 * @param parentGroup SVG parent group
 * @param anchor SVG element being used as a reference point
 * @param color color scale to colorize each legend cell
 * @returns {function}
 */
export default function legendRenderer(parentGroup, { anchor = parentGroup, color }) {
    const group = parentGroup
        .append("g")
        .attr("class", CLASS_NAMES.LEGEND_GROUP);

    const drawSymbol = (data, update) => (d, i, nodes) => {
        const el = d3.select(nodes[i]);

        el.select(`.${ CLASS_NAMES.CELL_SYMBOL }`).remove();

        const symbol = SYMBOL_MAP[d.type](el, color(i), !d.hidden);
        return symbol.on("click", handleClick(data, update));
    };

    const setLabel = (data, update) => el => el
        .text(d => d.key)
        .attr("fill", d => d.hidden ? "#afafaf" : "#000")
        .on("click", handleClick(data, update));

    const setHorizontalBorder = (y) => el => el
        .append("line")
        .attr("class", CLASS_NAMES.LINE_DECOR)
        .attr("x1", 0)
        .attr("y1", y)
        .attr("x2", 300)
        .attr("y2", y);

    const positionLegend = () => el => {
        const refPos = anchor.node().getBoundingClientRect();
        const groupPos = group.node().getBoundingClientRect();

        const x = refPos.right + 50;
        const y = refPos.top + (refPos.height - groupPos.height) / 2;

        return el.attr("transform", `translate(${ x }, ${ y + 12 })`);
    };

    const handleClick = (data, update) => d => {
        const nextData = data
            .map(series => series.key === d.key
                ? { ...series, hidden: !series.hidden }
                : series
            );

        update(nextData);
    };

    return function render(data = [], update = noop) {
        const legendItem = group
            .selectAll(`.${ CLASS_NAMES.LEGEND_CELL }`)
            .data(data);

        legendItem.exit().remove();

        const enterItem = legendItem.enter()
            .append("g")
            .attr("class", CLASS_NAMES.LEGEND_CELL)
            .attr("transform", (d, i) => `translate(0, ${ i * CELL_HEIGHT })`);

        enterItem
            .append("text")
            .attr("class", CLASS_NAMES.CELL_LABEL)
            .attr("alignment-baseline", "central")
            .attr("dominant-baseline", "central")
            .attr("x", "2.5em")
            .call(setLabel(data, update));

        enterItem.each(drawSymbol(data, update));

        legendItem
            .select(`.${ CLASS_NAMES.CELL_LABEL }`)
            .call(setLabel(data, update));

        legendItem.each(drawSymbol(data, update));

        group.selectAll(`.${ CLASS_NAMES.LINE_DECOR }`).remove();
        group
            .call(setHorizontalBorder(-BORDER_SPACING))
            .call(setHorizontalBorder((data.length - 1) * CELL_HEIGHT + BORDER_SPACING))
            .call(positionLegend());

        return group;
    };
}

const CELL_HEIGHT = 30;
const BORDER_SPACING = 20;
const CLASS_NAMES = {
    LEGEND_GROUP: "legend",
    LEGEND_CELL: "legend-cell",
    CELL_LABEL: "legend-cell__label",
    CELL_SYMBOL: "legend-cell__symbol",
    LINE_DECOR: "line-decor"
};

const drawAreaSymbol = (el, color, isActive) => el
    .append("rect")
    .attr("class", CLASS_NAMES.CELL_SYMBOL)
    .attr("fill", isActive ? color : "#fff")
    .attr("stroke", isActive ? "none": "#afafaf")
    .attr("y", "-0.5em")
    .attr("width", "2em")
    .attr("height", "1em");

const drawLineSymbol = (el, color, isActive) => el
    .append("line")
    .attr("class", CLASS_NAMES.CELL_SYMBOL)
    .attr("stroke", isActive ? color : "#afafaf")
    .attr("stroke-width", 4)
    .attr("x1", 0)
    .attr("x2", "2em");

const drawDotSymbol = (el, color, isActive) => el
    .append("circle")
    .attr("class", CLASS_NAMES.CELL_SYMBOL)
    .attr("fill", isActive ? color : "#fff")
    .attr("stroke", isActive ? "none": "#afafaf")
    .attr("r", "4px")
    .attr("cx", "1em");

const SYMBOL_MAP = {
    "area": drawAreaSymbol,
    "line": drawLineSymbol,
    "dot": drawDotSymbol
};
