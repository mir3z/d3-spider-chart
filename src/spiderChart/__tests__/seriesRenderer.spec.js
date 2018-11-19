import "core-js/fn/array/flat-map";
import * as d3 from "d3";
import seriesRenderer from "../seriesRenderer";
import { cleanup, setup } from "./utils";

describe("series renderer", () => {
    const color = d3.scaleLinear()
        .domain([0, 1, 2, 3, 4])
        .range([
            "#53c6ff",
            "#0021ba",
            "#ff8823",
            "#187a2e"
        ])
        .interpolate(d3.interpolateHcl);

    const defaultOptions = {
        color,
        innerRadius: 10,
        outerRadius: 100,
    };

    const data = [
        {
            key: "Series 1",
            type: "area",
            focus: true,
            values: [
                { axis: "Statement A", group: "Group 1", value: 20, focus: true },
                { axis: "Statement B", group: "Group 2", value: 22, focus: true },
                { axis: "Statement C", group: "Group 3", value: 24, focus: true },
            ]
        },
        {
            key: "Series 2",
            type: "line",
            values: [
                { axis: "Statement A", group: "Group 1", value: 10 },
                { axis: "Statement B", group: "Group 2", value: 15 },
                { axis: "Statement C", group: "Group 3", value: 20 },
            ]
        },
        {
            key: "Series 3",
            type: "dot",
            values: [
                { axis: "Statement A", group: "Group 1", value: 11 },
                { axis: "Statement B", group: "Group 2", value: 22 },
                { axis: "Statement C", group: "Group 3", value: 33 },
            ]
        },
    ];

    afterEach(cleanup);

    it("renders its own group", () => {
        const svg = setup();
        const renderSeries = seriesRenderer(svg, defaultOptions);

        const group = renderSeries(data);
        const ownGroup = svg.node().querySelector("g.series");

        expect(ownGroup).not.toBeNull();
        expect(group.node()).toEqual(ownGroup);
    });

    it("correctly renders all series", () => {
        const svg = setup();
        const renderSeries = seriesRenderer(svg, defaultOptions);

        const group = renderSeries(data);

        expect(group.node()).toMatchSnapshot();
    });

    it("calls update when series is clicked", () => {
        const svg = setup();
        const update = jest.fn();
        const renderSeries = seriesRenderer(svg, defaultOptions);

        const group = renderSeries(data, update);
        group.node().querySelector("[data-series='Series 3'] path")
            .dispatchEvent(new Event("click"));

        expect(update).toHaveBeenCalledWith([
            {
                key: "Series 1",
                type: "area",
                focus: false,
                values: [
                    { axis: "Statement A", group: "Group 1", value: 20, focus: false, highlight: false, dim: false },
                    { axis: "Statement B", group: "Group 2", value: 22, focus: false, highlight: false, dim: false },
                    { axis: "Statement C", group: "Group 3", value: 24, focus: false, highlight: false, dim: false },
                ]
            },
            {
                key: "Series 2",
                type: "line",
                focus: false,
                values: [
                    { axis: "Statement A", group: "Group 1", value: 10, focus: false, highlight: false, dim: false },
                    { axis: "Statement B", group: "Group 2", value: 15, focus: false, highlight: false, dim: false },
                    { axis: "Statement C", group: "Group 3", value: 20, focus: false, highlight: false, dim: false },
                ]
            },
            {
                key: "Series 3",
                type: "dot",
                focus: true,
                values: [
                    { axis: "Statement A", group: "Group 1", value: 11, focus: true, highlight: false, dim: false },
                    { axis: "Statement B", group: "Group 2", value: 22, focus: true, highlight: false, dim: false },
                    { axis: "Statement C", group: "Group 3", value: 33, focus: true, highlight: false, dim: false },
                ]
            },
        ]);
    });

    it("re-renders when data changes", () => {
        const svg = setup();
        const renderSeries = seriesRenderer(svg, defaultOptions);

        renderSeries(data);
        const newData = [
            {
                key: "Series 1",
                type: "area",
                values: [
                    { axis: "Statement A", group: "Group 1", value: 10 },
                    { axis: "Statement B", group: "Group 2", value: 11 },
                    { axis: "Statement C", group: "Group 3", value: 12 },
                ]
            }
        ];
        const group = renderSeries(newData);

        expect(group.node()).toMatchSnapshot();
    });
});
