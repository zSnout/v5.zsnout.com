import $, { jsx } from "../assets/js/jsx.js";

let calc = Desmos.GraphingCalculator($.main[0], { border: false });

$(".dcg-exppanel-container.dcg-add-shadow").prepend(
  <div className="dcg-padder" />
);
