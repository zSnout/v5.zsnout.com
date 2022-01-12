import "https://unpkg.com/pngjs@6.0.0/browser.js";
import $, { jsx } from "../../assets/js/jsx.js";
import { overcolorify, pngToFile, videoToPNG } from "../../assets/js/png.js";

let output = $("#output")[0] as HTMLImageElement;
let info = $("#info");

info.on("click", async () => {
  async function redraw(video: HTMLVideoElement) {
    let png = overcolorify(await videoToPNG(video));
    output.src = URL.createObjectURL(pngToFile(png));

    setTimeout(() => redraw(video));
  }

  try {
    let stream = await navigator.mediaDevices.getUserMedia({ video: true });
    let video = (<video />)[0] as HTMLVideoElement;
    video.srcObject = stream;
    await video.play();
    $.main.addClass("hasimage");
    setTimeout(() => redraw(video));
  } catch {
    info.text(
      "Sorry, we weren't able to get camera permissions. Try again by clicking this paragraph, or reload the page."
    );
  }
});
