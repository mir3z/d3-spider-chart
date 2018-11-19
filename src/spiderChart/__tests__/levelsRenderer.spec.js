import levelsRenderer from "../levelsRenderer";
import { cleanup, setup } from "./utils";

describe("levels renderer", () => {
    const defaultOptions = {
        innerRadius: 10,
        outerRadius: 100,
        levels: 3
    };

    const data = [{
        values: [
            { axis: "Statement 1" },
            { axis: "Statement 2" },
            { axis: "Statement 3" }
        ]
    }];

    afterEach(cleanup);

    it("renders its own group", () => {
        const svg = setup();
        const renderLevels = levelsRenderer(svg, defaultOptions);

        const group = renderLevels(data);
        const ownGroup = svg.node().querySelector("g.levels");

        expect(ownGroup).not.toBeNull();
        expect(group.node()).toEqual(ownGroup);
    });

    it("renders all levels", () => {
        const svg = setup();
        const renderLevels = levelsRenderer(svg, defaultOptions);

        const group = renderLevels(data);

        expect(group.node()).toMatchSnapshot();
    });
});
