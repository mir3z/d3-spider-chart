import * as d3 from "d3";
import legendRenderer from "../legendRenderer";
import { cleanup, findElementByText, setup } from "./utils";

describe("legend renderer", () => {
    const color = d3.scaleLinear().domain([0, 1, 2]).range(["#f00", "#0f0", "#00f"]);

    afterEach(cleanup);

    it("renders its own group", () => {
        const svg = setup();
        const renderLegend = legendRenderer(svg, {});

        const group = renderLegend();
        const ownGroup = svg.node().querySelector("g.legend");

        expect(ownGroup).not.toBeNull();
        expect(group.node()).toEqual(ownGroup);
    });

    it("renders correct legend cell for each series", () => {
        const svg = setup();
        const renderLegend = legendRenderer(svg, { color });
        const parent = renderLegend([
            { type: "area", key: "series 1" },
            { type: "line", key: "series 2" },
            { type: "dot", key: "series 3" }
        ]);

        expect(parent.node()).toMatchSnapshot();
    });

    it("renders correct legend cell for each hidden series", () => {
        const svg = setup();
        const renderLegend = legendRenderer(svg, { color });
        const parent = renderLegend([
            { type: "area", key: "series 1", hidden: true },
            { type: "line", key: "series 2", hidden: true },
            { type: "dot", key: "series 3", hidden: true }
        ]);

        expect(parent.node()).toMatchSnapshot();
    });

    describe("when clicking series label", () => {
        it("updates series state with hidden = true if series is visible", () => {
            const svg = setup();
            const renderLegend = legendRenderer(svg, { color });
            const data = [
                { type: "area", key: "series 1" },
                { type: "line", key: "series 2" }
            ];
            const update = jest.fn();
            const parent = renderLegend(data, update);

            findElementByText("series 1", parent.node())
                .dispatchEvent(new Event("click"));

            expect(update).toHaveBeenCalledWith([
                { type: "area", key: "series 1", hidden: true },
                { type: "line", key: "series 2" }
            ]);
        });

        it("updates series state with hidden = false if series is NOT visible", () => {
            const svg = setup();
            const renderLegend = legendRenderer(svg, { color });
            const data = [
                { type: "area", key: "series 1" },
                { type: "line", key: "series 2", hidden: true }
            ];
            const update = jest.fn();
            const parent = renderLegend(data, update);

            findElementByText("series 2", parent.node())
                .dispatchEvent(new Event("click"));

            expect(update).toHaveBeenCalledWith([
                { type: "area", key: "series 1"},
                { type: "line", key: "series 2", hidden: false }
            ]);
        });
    });
});
