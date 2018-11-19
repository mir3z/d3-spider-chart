import axisRenderer from "../axisRenderer";
import { cleanup, findElementByText, setup } from "./utils";

describe("axis renderer", () => {

    afterEach(cleanup);

    const defaultOptions = { innerRadius: 0, outerRadius: 100, donutSize: 10, labelSpacing: 10 };
    const data = [{
        values: [
            { axis: "Statement 1" },
            { axis: "Statement 2" },
            { axis: "Statement 3", focus: true, highlight: true },
            { axis: "Statement 4" }
        ]
    }];

    it("renders its own group", () => {
        const svg = setup();
        const renderAxis = axisRenderer(svg, defaultOptions);

        const group = renderAxis(data);
        const ownGroup = svg.node().querySelector("g.axis-group");

        expect(ownGroup).not.toBeNull();
        expect(group.node()).toEqual(ownGroup);
    });

    it("renders axis for each statement", () => {
        const svg = setup();
        const renderAxis = axisRenderer(svg, defaultOptions);

        const group = renderAxis(data);

        expect(group.node()).toMatchSnapshot();
    });

    describe("when clicking axis label", () => {
        it("updates axis state if axis is NOT focused", () => {
            verifyAxisClick("Statement 2", [{
                focus: false,
                values: [
                    { axis: "Statement 1", focus: false, highlight: false, dim: true },
                    { axis: "Statement 2", focus: true, highlight: true, dim: false },
                    { axis: "Statement 3", focus: false, highlight: false, dim: true },
                    { axis: "Statement 4", focus: false, highlight: false, dim: true }
                ]
            }]);
        });

        it("updates axis state if axis is focused", () => {
            verifyAxisClick("Statement 3", [{
                focus: false,
                values: [
                    { axis: "Statement 1", focus: false, highlight: false, dim: false },
                    { axis: "Statement 2", focus: false, highlight: false, dim: false },
                    { axis: "Statement 3", focus: false, highlight: false, dim: false },
                    { axis: "Statement 4", focus: false, highlight: false, dim: false }
                ]
            }]);
        });

        it("re-renders axis based on new state", () => {
            const svg = setup();
            const renderAxis = axisRenderer(svg, defaultOptions);
            const update = updatedData => {
                const updatedGroup = renderAxis(updatedData);
                expect(updatedGroup.node()).toMatchSnapshot();
            };

            const group = renderAxis(data, update);

            findElementByText("Statement 4", group.node())
                .dispatchEvent(new Event("click"));
        });

        const verifyAxisClick = (axisLabel, expectedData) => {
            const svg = setup();
            const update = jest.fn();
            const renderAxis = axisRenderer(svg, defaultOptions);

            const group = renderAxis(data, update);

            findElementByText(axisLabel, group.node())
                .dispatchEvent(new Event("click"));

            expect(update).toHaveBeenCalledWith(expectedData);
        }
    });
});
