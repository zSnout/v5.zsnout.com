import $, { jsx } from "../assets/js/jsx.js";
import {
  getLocationHash,
  getStorage,
  onStorageChange,
  setLocationHash,
  setStorage,
} from "../assets/js/util.js";
import "/socket.io/socket.io.js";

/**
 * Generates UUIDs for the room if needed.
 * @returns A version 4 UUID.
 */
function generateUUID() {
  return ("" + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  );
}

let info = $("#info");
let videos = $("#videos");
let roomID = getLocationHash() || generateUUID();
if (roomID != getLocationHash()) setLocationHash(roomID);

let showError = (err: any) => showInfo(`Error: ${err?.message || err}`);
let showInfo = (text: string) => ($.main.removeClass("video"), info.text(text));
let requestMedia = () =>
  navigator.mediaDevices.getUserMedia({ video: true, audio: true });

let peer = new Peer();
peer.on("error", (err) => ((document.title = "zCall - Error"), showError(err)));

peer.on("open", (myID) =>
  showMyVideo(myID)
    .then(allowMuting)
    .then(setupSocketIO)
    .then(addCallReciever)
    .catch(showError)
);

/** The type returned by the string of `showMyVideo`, `setupSocketIO`, etc. */
type StreamData = [stream: MediaStream, userID: string];

/**
 * Creates a video stream and adds it to the DOM.
 * @param stream The stream to make a video element for.
 * @param peerID The ID of the user the video is created for.
 * @param muted Whether to mute the video.
 * @returns A promise resolving once the video has loaded.
 */
function makeVideo(stream: MediaStream, peerID: string, muted?: boolean) {
  if ($(`video[peerid='${peerID}']`).length) return Promise.resolve();
  let video = <video />;
  let videoEl = video[0] as HTMLVideoElement;
  if (muted) videoEl.muted = true;
  videoEl.srcObject = stream;
  videoEl.setAttribute("peerid", peerID);
  videos.append(video);

  let vidCount = videos.children().length;
  $.main.removeClass(`video-${vidCount - 1}`).addClass(`video-${vidCount}`);

  if (vidCount == 1 || vidCount == 2) $.root.addClass("fullscreen");
  else $.root.removeClass("fullscreen");

  return new Promise<void>((resolve) => {
    videoEl.onloadedmetadata = () => {
      videoEl.play();
      resolve();
    };
  });
}

/**
 * Connects to another user.
 * @param peerID The ID of the other user.
 * @param stream The stream to send to the other user.
 * @returns A promise resolving once connected.
 */
function connectToUser(peerID: string, stream: MediaStream) {
  return new Promise<void>((resolve) => {
    peer.call(peerID, stream).on("stream", (otherStream) => {
      resolve(makeVideo(otherStream, peerID));
    });
  });
}

/**
 * Shows the user's video stream and returns a `StreamData` object.
 * @param userID The ID of the current user.
 * @returns A promise resolving once the video has loaded.
 */
async function showMyVideo(userID: string): Promise<StreamData> {
  let stream = await requestMedia();
  $.main.addClass("video");
  await makeVideo(stream, userID, true);
  return [stream, userID];
}

/**
 * Allows muting of the user's audio and video.
 * @param data Data about the user; used for making calls.
 * @returns The original `StreamData` object passed to this call.
 */
function allowMuting([stream, userID]: StreamData): StreamData {
  let audio = $("#icon-audio");
  let video = $("#icon-video");
  let audioSVG = $("#icon-audio use");
  let videoSVG = $("#icon-video use");

  audio.on("click", () => {
    let track = stream.getAudioTracks()[0];

    audioSVG.attr(
      "href",
      `/assets/icons/${track.enabled ? "no" : ""}mic.svg#icon`
    );
    track.enabled = !track.enabled;
  });

  video.on("click", () => {
    let track = stream.getVideoTracks()[0];

    videoSVG.attr(
      "href",
      `/assets/icons/${track.enabled ? "no" : ""}camera.svg#icon`
    );
    track.enabled = !track.enabled;
  });

  return [stream, userID];
}

/**
 * Sets up the Socket.IO connection and returns a `StreamData` object.
 * @param data Data about the user; used for making calls.
 * @returns The original `StreamData` object passed to this call.
 */
function setupSocketIO([stream, userID]: StreamData): StreamData {
  let socket = io();
  socket.on("connect", () => socket.emit("zcall:join", roomID, userID));

  socket.on("zcall:join", async (_, peerID) => {
    if ($(`video[peerid='${peerID}']`).length) return;
    await connectToUser(peerID, stream);
  });

  socket.on("zcall:leave", (peerID) => {
    $(`video[peerid='${peerID}']`).remove();
    let vidCount = videos.children().length;
    $.main.removeClass(`video-${vidCount + 1}`).addClass(`video-${vidCount}`);
    if (vidCount == 1 || vidCount == 2) $.root.addClass("fullscreen");
    else $.root.removeClass("fullscreen");
  });

  return [stream, userID];
}

/**
 * Adds a call reciever for this user and returns a `StreamData` object.
 * @param data Data about the user; used for responding to a call.
 * @returns The original `StreamData` object passed to this call.
 */
function addCallReciever([stream, userID]: StreamData): StreamData {
  peer.on("call", (call) => {
    if (call.peer == userID) return;
    if ($(`video[peerid='${call.peer}']`).length) return;

    document.title = "zCall - Connecting...";
    call.answer(stream);
    call.on("stream", async (stream) => {
      await makeVideo(stream, call.peer);
      document.title = "zCall - Connected";
    });
  });

  return [stream, userID];
}

function updateZCallCover(status = getStorage("zcall:cover")) {
  if (status == "true") $.main.addClass("cover");
  else $.main.removeClass("cover");
}

$("#icon-resize").on("click", () =>
  setStorage(
    "zcall:cover",
    getStorage("zcall:cover") == "true" ? "false" : "true"
  )
);

updateZCallCover();
onStorageChange("zcall:cover", updateZCallCover);

declare global {
  interface IOEvents {
    "zcall:join"(roomID: string, userID: string): void;
    "zcall:leave"(userID: string): void;
  }

  interface StorageItems {
    "zcall:cover"?: "true" | "false";
  }
}
