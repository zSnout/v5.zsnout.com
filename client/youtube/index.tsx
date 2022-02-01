import fetch from "../assets/js/fetch.js";
import $, { jsx } from "../assets/js/jsx.js";
import { createNotification } from "../assets/js/notification.js";

/** A list of the quality and URL of a video. */
type QualityAndURL = [quality: string, url: string];

/** A list of different video types. */
type VideoList = [
  videoaudio: QualityAndURL[],
  video: QualityAndURL[],
  audio: QualityAndURL[]
];

function escapeXML(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

let help = $("#help");
let infoEl = $("#info");
let field = $("#field");
let thumbnail = $("#thumbnail");
let thumbnailImage = thumbnail[0] as HTMLImageElement;
let formats = $("#formats");

async function onSubmit(e: Event) {
  e.preventDefault();

  let videoID = field.val();
  try {
    let id = new URL(videoID).searchParams.get("v");
    if (id) videoID = id;
  } catch {}

  help.text("Loading video details...");
  let info = await fetch(`/api/youtube-meta/${videoID}/`, "POST", {
    title: "string",
    description: "string?",
    isLive: "boolean",
    channel: "string",
    thumbnail: "string",
    formats: [
      {
        url: "string",
        "audioQuality?": "string?",
        "qualityLabel?": "string?",
        hasVideo: "boolean",
        hasAudio: "boolean",
      },
    ],
  });

  if (!info.ok && info.error.startsWith("Oops, an error occurred! "))
    return help.text(info.error);
  else if (!info.ok) return help.text(`Oops, an error occurred! ${info.error}`);

  let allFormats = info.data.formats
    .map(({ hasVideo: v, hasAudio: a, qualityLabel, audioQuality, url }) => ({
      url,
      quality: qualityLabel || audioQuality,
      type: (v ? (a ? "video/audio" : "video") : a ? "audio" : "none") as
        "none" | "audio" | "video" | "video/audio", // prettier-ignore
    }))
    .filter(({ type }) => type != "none")
    .filter(
      ({ type, quality }, index, arr) =>
        arr.findIndex(({ type: t, quality: q }) => quality == q && type == t) ==
        index
    )
    .sort(({ quality: a }, { quality: b }) => {
      let aNum = a?.match(/^(\d+)p/)?.[1] || 0;
      let bNum = b?.match(/^(\d+)p/)?.[1] || 0;

      return +bNum - +aNum;
    })
    .sort(({ type: a }, { type: b }) => {
      return (
        (b == "video/audio" ? 2 : b == "video" ? 1 : 0) -
        (a == "video/audio" ? 2 : a == "video" ? 1 : 0)
      );
    });

  thumbnailImage.onload = onResize;
  thumbnailImage.src = info.data.thumbnail;

  formats.empty();
  let [va, v, a] = allFormats.reduce<VideoList>(
    ([va, v, a], el) => {
      let entry: QualityAndURL = [el.quality || "no quality available", el.url];

      if (el.type == "video/audio") va.push(entry);
      if (el.type == "video") v.push(entry);
      if (el.type == "audio") a.push(entry);

      return [va, v, a];
    },
    [[], [], []]
  );

  if (va.length)
    formats.append(
      <p>
        <span>Video and Audio:</span>
        {...va.map(([quality, url]) => <a href={url}>{quality}</a>)}
      </p>
    );

  if (v.length)
    formats.append(
      <p>
        <span>Video Only:</span>
        {...v.map(([quality, url]) => <a href={url}>{quality}</a>)}
      </p>
    );

  if (a.length)
    formats.append(
      <p>
        <span>Audio Only:</span>
        {...a.map(([quality, url]) => <a href={url}>{quality}</a>)}
      </p>
    );

  let desc = <span>{info.data.description || "no description available"}</span>;
  desc.html(desc.html().replaceAll("\n", "<br>"));

  infoEl.empty().append(
    `Click a format to download this video!`,
    <br />,
    <br />,
    `"${info.data.title}"`,
    <br />,
    <span>
      Channel: <b>{escapeXML(info.data.channel)}</b>
    </span>,
    <br />,
    <br />,
    desc
  );

  $.main.addClass("showinfo");
}

$("#form").on("submit", onSubmit);
$("#submit").on("click", onSubmit);

function onResize() {
  infoEl.css("height", "0");
  infoEl.css("maxHeight", `${thumbnail[0].clientHeight}px`);
  infoEl.css("height", "initial");
}

onResize();
window.addEventListener("resize", onResize);
