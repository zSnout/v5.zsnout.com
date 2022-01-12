import $ from "../../assets/js/jsx.js";

let i = $("#input");
let o = $("#output");

(window as any).i = i;
(window as any).o = o;
(window as any).io = (cb: (val: string) => string) => {
  i.on("input", () => {
    try {
      o.val(cb(i.val()));
    } catch (e: any) {
      o.val(e);
    }
  });
};
