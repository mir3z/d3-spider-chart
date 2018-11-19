import donutRenderer from "../donutRenderer";
import { cleanup, setup } from "./utils";


describe("donut renderer", () => {
    const defaultOptions = { innerRadius: 100, outerRadius: 130 };
    const data = [{
        values: [
            { group: "Group A" },
            { group: "Group A" },
            { group: "Group B" },
            { group: "Group B", highlight: true },
            { group: "Group B" },
            { group: "Group B" },
            { group: "Group C" },
            { group: "Group C" },
            { group: "Group D" },
            { group: "Group D" },
            { group: "Group D" },
            { group: "Group E" }
        ]
    }];

    afterEach(cleanup);

    it("renders its own container", () => {
        const svg = setup();
        const renderDonut = donutRenderer(svg, defaultOptions);

        const group = renderDonut(data);

        const ownGroup = svg.node().querySelector("g.donut");
        expect(ownGroup).not.toBeNull();
        expect(group.node()).toEqual(ownGroup);
    });

    it("correctly renders donut slice for each group", () => {
        const svg = setup();
        const renderDonut = donutRenderer(svg, defaultOptions);

        const group = renderDonut(data);

        expect(group.node()).toMatchSnapshot();
    });

    it("updates donut when data changes", () => {
        const svg = setup();
        const renderDonut = donutRenderer(svg, defaultOptions);

        renderDonut(data);
        const group = renderDonut([{
            values: [
                { group: "Group A", highlight: true },
                { group: "Group A" },
                { group: "Group B" },
                { group: "Group B" },
                { group: "Group B" },
                { group: "Group B" }
            ]
        }]);

        expect(group.node()).toMatchSnapshot();
    });
});
