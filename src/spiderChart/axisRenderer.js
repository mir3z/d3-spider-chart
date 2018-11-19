import noop from "lodash.noop";

/**
 * Renders axis for each statement in chart's data.
 * Each axis has it's name at the end.
 * Clicking axis name makes it highlighted.
 * @param parent SVG parent group
 * @param innerRadius inner radius at which each axis starts
 * @param outerRadius outer radius at which each axis ends
 * @param donutSize outer donut's size
 * @param labelSpacing additional spacing between axis end and axis label
 * @returns {function}
 */
export default function axisRenderer(parent, { innerRadius, outerRadius, donutSize, labelSpacing }) {
    const axesGroup = parent
        .append("g")
        .attr("class", CLASS_NAMES.AXIS_PARENT_GROUP);

    const setAxisLine = (x, y) => (el) => el
        .classed(CLASS_NAMES.AXIS_LINE_HIGHLIGHTED, d => d.highlight)
        .attr("x1", (d, i) => x(i, innerRadius))
        .attr("y1", (d, i) => y(i, innerRadius))
        .attr("x2", (d, i) => x(i, d.highlight ? outerRadius + donutSize : outerRadius))
        .attr("y2", (d, i) => y(i, d.highlight ? outerRadius + donutSize : outerRadius));

    const setLabel = (x, y, sliceAngle) => (el) => el
        .classed(CLASS_NAMES.AXIS_LABEL_HIGHLIGHTED, d => d.highlight)
        .classed("axis-label--dim", d => d.dim)
        .attr("x", (d, i) => x(i, outerRadius + labelSpacing))
        .attr("y", (d, i) => y(i, outerRadius + labelSpacing))
        .attr("text-anchor", (d, i) => {
            const angle = i * sliceAngle;

            if (angle > 0 && angle < Math.PI) {
                return "start";
            } else if (angle > Math.PI && angle < Math.PI * 2) {
                return "end";
            }

            return "middle";
        });

    const handleLabelClick = (data, update) => ({ axis }) => {
        const hasUnselected = data
            .map(series => series.values.find(s => s.axis === axis))
            .some(values => !values.focus);

        const anyHighlighted = data
            .map(series => series.values.find(s => s.axis === axis))
            .some(values => !values.highlight);

        const nextData = data
            .map(series => ({
                ...series,
                focus: false,
                values: series.values.map(v => v.axis === axis
                    ? { ...v, focus: hasUnselected, highlight: !v.highlight, dim: false }
                    : { ...v, focus: false, highlight: false, dim: anyHighlighted })
            }));

        update(nextData);
    };

    return function render(data = [], update = noop) {
        const axisList = data[0].values;
        const sliceAngle = Math.PI * 2 / axisList.length;
        const x = (i, r) => r * Math.sin(i * sliceAngle);
        const y = (i, r) => -r * Math.cos(i * sliceAngle);

        const axis = axesGroup
            .selectAll(`.${ CLASS_NAMES.AXIS }`)
            .data(axisList);

        axis.exit().remove();

        const enterAxis = axis.enter()
            .append("g")
            .attr("class", CLASS_NAMES.AXIS)
            .attr("data-axis", d => d.axis);

        enterAxis
            .append("line")
            .attr("class", CLASS_NAMES.AXIS_LINE)
            .call(setAxisLine(x, y));

        enterAxis
            .append("text")
            .attr("class", CLASS_NAMES.AXIS_LABEL)
            .text(d => d.axis)
            .call(setLabel(x, y, sliceAngle))
            .on("click", handleLabelClick(data, update));

        axis.select(`.${ CLASS_NAMES.AXIS_LINE }`)
            .call(setAxisLine(x, y));

        axis.select(`.${ CLASS_NAMES.AXIS_LABEL }`)
            .call(setLabel(x, y, sliceAngle))
            .on("click", handleLabelClick(data, update));

        return axesGroup;
    };
}

const CLASS_NAMES = {
    AXIS_PARENT_GROUP: "axis-group",
    AXIS: "axis",
    AXIS_LINE: "axis-line",
    AXIS_LINE_HIGHLIGHTED: "axis-line--highlighted",
    AXIS_LABEL: "axis-label",
    AXIS_LABEL_HIGHLIGHTED: "axis-label--highlighted"
};
