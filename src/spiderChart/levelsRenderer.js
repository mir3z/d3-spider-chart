import * as d3 from "d3";

/**
 * Renders concentric levels inside *parent* group.
 * @param parent SVG parent group
 * @param innerRadius inner radius at which levels start
 * @param outerRadius outer radius at which levels end
 * @param levels Number of levels to render
 * @returns {function}
 */
export default function levelsRenderer(parent, { innerRadius, outerRadius, levels }) {
    const group = parent
        .append("g")
        .attr("class", CLASS_NAME.LEVELS_GROUP);

    const setLevelLine = (x, y, r) => el => el
        .attr("x1", (d, i) => x(i, r))
        .attr("y1", (d, i) => y(i, r))
        .attr("x2", (d, i) => x(i + 1, r))
        .attr("y2", (d, i) => y(i + 1, r));

    const renderLevels = (group, axisList, levelsCount) => {
        const x = (i, r) => r * Math.sin(i * Math.PI * 2 / axisList.length);
        const y = (i, r) => -r * Math.cos(i * Math.PI * 2 / axisList.length);

        const radiusScale = d3.scaleLinear()
            .domain([0, levelsCount])
            .range([innerRadius, outerRadius]);

        const level = group
            .selectAll(`.${ CLASS_NAME.LEVEL }`)
            .data(d3.range(0, levelsCount + 1));

        const enterLevel = level.enter()
            .append("g")
            .attr("class", CLASS_NAME.LEVEL);

        group.selectAll(`.${ CLASS_NAME.LEVEL }`)
            .each((d, i, nodes) => {
                const group = d3.select(nodes[i]);
                const r = radiusScale(i);

                group
                    .selectAll(`.${ CLASS_NAME.LEVEL_LINE }`)
                    .call(setLevelLine(x, y, r));
            });

        enterLevel.each((d, i, nodes) => {
            const group = d3.select(nodes[i]);
            const r = radiusScale(i);

            const levelLine = group
                .selectAll(CLASS_NAME.LEVEL_LINE)
                .data(axisList);

            levelLine.enter()
                .append("line")
                .attr("class", CLASS_NAME.LEVEL_LINE)
                .call(setLevelLine(x, y, r));

            levelLine.exit().remove();
        });
    };

    return function render(data) {
        const axisList = data[0].values
            .map(d => d.axis);

        renderLevels(group, axisList, levels);

        return group;
    };
}

const CLASS_NAME = {
    LEVELS_GROUP: "levels",
    LEVEL: "level",
    LEVEL_LINE: "level-line"
};
