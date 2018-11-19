import * as d3 from "d3";

export const cleanup = () => document.body.innerHTML = "";

export const setup = () => d3.select("body").append("svg");

export const findElementByText = (text, root = document.body) => {
    const els = root.querySelectorAll("*");
    return Array.from(els)
        .find(el => el.children.length === 0 && el.textContent.includes(text));
};
