import "https://unpkg.com/pngjs@6.0.0/browser.js";
import $, { jsx } from "../../assets/js/jsx.js";
import { colorBlind, pngToFile, videoToPNG } from "../../assets/js/png.js";
import { randint } from "../../assets/js/util.js";

let output = $("#output")[0] as HTMLImageElement;
let info = $("#info");

/** A number representing the color to blind. */
let blindType = randint(1, 3) as 1 | 2 | 3;

/** Whether to blind a single color. */
let blindOne = !!randint();

document.title = blindOne
  ? `Live Unsee ${
      blindType == 1
        ? "Green & Blue"
        : blindType == 2
        ? "Red & Blue"
        : "Red & Green"
    }`
  : `Live Unsee ${blindType == 1 ? "Red" : blindType == 2 ? "Green" : "Blue"}`;

info.on("click", async () => {
  async function redraw(video: HTMLVideoElement) {
    let png = colorBlind(
      await videoToPNG(video),
      blindOne ? blindType != 1 : blindType == 1,
      blindOne ? blindType != 2 : blindType == 2,
      blindOne ? blindType != 3 : blindType == 3
    );
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
