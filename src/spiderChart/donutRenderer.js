import * as d3 from "d3";
import svgPath from "smart-svg-path";
import takeRightWhile from "lodash.takerightwhile";

/**
 * Renders donut around the chart.
 * Each donut slice denotes one group and contains group name.
 * Each axis is marked by small circle at the edge of the donut.
 * @param parent SVG parent group
 * @param innerRadius inner radius of the donut
 * @param outerRadius outer radius of the donut
 * @returns {function}
 */
export default function donutRenderer(parent, { innerRadius, outerRadius }) {
    const groupColor = d3.scaleLinear()
        .domain([0, 4, 5])
        .range([
            "#b62b3d",
            "#ffc392",
            "#c1c8c1"
        ])
        .interpolate(d3.interpolateHcl);

    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    const group = parent
        .append("g")
        .attr("class", "donut");

    const renderDots = (axisList, groupList) => {
        const axisToGroup = axisList
            .reduce((acc, it) => ({
                ...acc,
                [it.axis]: {
                    group: it.group,
                    idx: groupList.findIndex(g => g.group === it.group)
                }
            }), {});

        const x = (i, r) => r * Math.sin(i * Math.PI * 2 / axisList.length);
        const y = (i, r) => -r * Math.cos(i * Math.PI * 2 / axisList.length);

        const dot = group
            .selectAll(`.${ CLASS_NAME.DONUT_DOT }`)
            .data(axisList);

        dot.enter()
            .append("circle")
            .attr("class", CLASS_NAME.DONUT_DOT)
            .call(setDot(x, y, axisToGroup))
            .attr("r", 5);

        dot.call(setDot(x, y, axisToGroup));

        dot.exit().remove();
    };

    const setDot = (x, y, axisToGroup) => el => el
        .attr("cx", (d, i) => x(i, outerRadius))
        .attr("cy", (d, i) => y(i, outerRadius))
        .attr("r", 5)
        .attr("fill", d => d.highlight ? "#000" : groupColor(axisToGroup[d.axis].idx));

    const setSlicePath = (arc, color) => el => el
        .attr("d", arc)
        .attr("fill", (d, i) => color(i));

    const setSliceTextPath = (arc) => el => el
        .attr("id", (d, i) => "donut-text-path-"+i)
        .attr("d", d => {
            const path = arc(d);
            // Extract the first (outer) segment of donut's slice path and use it as text path for group name
            const segments = svgPath.getCommands(path);
            const firstSegment = segments.slice(0, 2).join("");
            // Reverse path if text is upside down
            return shouldFlipText(d)
                ? svgPath.reverse(firstSegment)
                : firstSegment;
        });

    const setSliceLabel = () => el => {
        const halfDonutSize = (outerRadius - innerRadius) / 2;
        const textOffset = 4;

        el.attr("dy", d => shouldFlipText(d) ? -halfDonutSize + textOffset : halfDonutSize + textOffset);

        let textPath = el.select("textPath");

        if (textPath.size() === 0) {
            textPath = el.append("textPath");
        }

        textPath
            .attr("startOffset", "50%")
            .attr("text-anchor", "middle")
            .attr("xlink:href", (d, i) => `#donut-text-path-${ i }`)
            .text(d => d.data.group);

        return textPath;
    };

    return function render(data = []) {
        const axisList =  data[0].values;

        const groupSize = axisList
            .reduce((acc, it) => ({
                ...acc,
                [it.group]: (acc[it.group] || 0) + 1
            }), {});

        const groupList = Object.keys(groupSize)
            .map(group => ({ group, size: groupSize[group] }));

        const angleOffset = calculateDonutAngleOffset(data);

        const pie = d3.pie()
            .value(d => d.size)
            .startAngle(angleOffset)
            .endAngle(angleOffset + Math.PI * 2)
            .sort(null);

        const donutData = pie(groupList);

        renderDots(axisList, groupList);

        const sliceGroup = group
            .selectAll(`.${ CLASS_NAME.DONUT_SLICE_GROUP }`)
            .data(donutData);

        const enterSlice = sliceGroup
            .enter()
            .append("g")
            .attr("class", CLASS_NAME.DONUT_SLICE_GROUP);

        sliceGroup.exit().remove();

        enterSlice
            .append("path")
            .attr("class", CLASS_NAME.DONUT_SLICE)
            .call(setSlicePath(arc, groupColor));

        sliceGroup
            .select(`.${ CLASS_NAME.DONUT_SLICE }`)
            .call(setSlicePath(arc, groupColor));

        enterSlice
            .append("path")
            .attr("class", CLASS_NAME.DONUT_TEXT_PATH)
            .style("fill", "none")
            .call(setSliceTextPath(arc));

        sliceGroup
            .select(`.${ CLASS_NAME.DONUT_TEXT_PATH }`)
            .call(setSliceTextPath(arc));

        enterSlice
            .append("text")
            .attr("class", CLASS_NAME.DONUT_LABEL)
            .call(setSliceLabel());

        sliceGroup
            .select(`.${ CLASS_NAME.DONUT_LABEL }`)
            .call(setSliceLabel());

        return group;
    };
}

const shouldFlipText = arc => {
    const { startAngle, endAngle } = arc;
    const angle = startAngle + (endAngle - startAngle) / 2;
    return angle > Math.PI / 2 && angle < Math.PI * 3/2;
};

const calculateDonutAngleOffset = data => {
    const shift = 2 * Math.PI / data[0].values.length;
    let n = 0;
    if (data[0].values[0].group === data[0].values[data[0].values.length - 1].group) {
        n = takeRightWhile(data[0].values, ({ group }) => group === data[0].values[0].group).length;
    }
    return -(n + 0.5) * shift;
};

const CLASS_NAME = {
    DONUT_DOT: "donut-dot",
    DONUT_SLICE_GROUP: "donut-slice-group",
    DONUT_SLICE: "donut-slice",
    DONUT_TEXT_PATH: "donut-text-path",
    DONUT_LABEL: "donut-label"
};
