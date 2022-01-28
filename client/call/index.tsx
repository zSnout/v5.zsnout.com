import $, { jsx } from "../assets/js/jsx.js";
import { getLocationHash, setLocationHash } from "../assets/js/util.js";
import "/socket.io/socket.io.js";

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

let socket = io();
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
 * @param otherID The ID of the user the video is created for.
 * @param muted Whether to mute the video.
 * @returns A promise resolving once the video has loaded.
 */
function makeVideo(stream: MediaStream, otherID: string, muted?: boolean) {
  if ($(`video[peerid='${otherID}']`).length) return Promise.resolve();
  let video = <video />;
  let videoEl = video[0] as HTMLVideoElement;
  if (muted) videoEl.muted = true;
  videoEl.srcObject = stream;
  videoEl.setAttribute("peerid", otherID);
  videos.append(video);

  return new Promise<void>((resolve) => {
    videoEl.onloadedmetadata = () => {
      videoEl.play();
      resolve();
    };
  });
}

/**
 * Connects to another user.
 * @param otherID The ID of the other user.
 * @param stream The stream to send to the other user.
 * @returns A promise resolving once connected.
 */
function connectToNewUser(otherID: string, stream: MediaStream) {
  return new Promise<void>((resolve) => {
    peer.call(otherID, stream).on("stream", (otherStream) => {
      resolve(makeVideo(otherStream, otherID));
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
  socket.emit("zcall:join", roomID, userID);

  socket.on("zcall:join", async (_, otherID) => {
    if ($(`video[peerid='${otherID}']`).length) return;
    await connectToNewUser(otherID, stream);
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

declare global {
  interface IOEvents {
    "zcall:join"(roomID: string, userID: string): void;
  }
}
