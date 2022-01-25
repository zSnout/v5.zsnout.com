import $ from "../assets/js/jsx.js";
import {
  getLocationHash,
  getStorage,
  onStorageChange,
  setLocationHash,
  setStorage,
} from "../assets/js/util.js";

let myVideo = $("#myvideo")[0] as HTMLVideoElement;
let video = $("#video")[0] as HTMLVideoElement;
let preventNewConnections = false;
let info = $("#info");

let showInfo = (text: string) =>
  ($.main.removeClass("showvideo"), info.text(text)); // prettier-ignore
let setMyVideo = (stream: MediaStream) => (myVideo.srcObject = stream);
let setOtherVideo = (stream: MediaStream) =>
  ((video.srcObject = stream), (document.title = "zCall - Connected")); // prettier-ignore
let requestMedia = () =>
  navigator.mediaDevices.getUserMedia({ video: true, audio: true });
let updateVideoSize = (type = getStorage("zCallVideoType")) =>
  $.main.removeClass("cover").addClass(...(type == "cover" ? ["cover"] : []));
let showError = (err: any) => showInfo(`Error: ${err?.message || err}`);

let peer = new Peer();
peer.on("error", showError);

let peerID = getLocationHash();
peer.on("open", (myID) => {
  $("#icon-share-session").on("click", () => {
    let link = new URL(`/call/#${myID}`, location.href).href;
    prompt("Share this URL with a friend to join the call", link);
  });
  document.title = "zCall - Ready!";
  showInfo(
    `You're ready to call a friend! Click the "Share" icon to get a shareable URL.`
  );

  if (!peerID || peerID == myID) return;
  peer.connect(peerID);

  requestMedia()
    .then((stream) => {
      setMyVideo(stream);
      $.main.addClass("showvideo");
      document.title = "zCall - Connecting...";
      let call = peer.call(peerID, stream);
      call.on("stream", setOtherVideo);
      setLocationHash("");
    })
    .catch(showError);
});

peer.on("call", (call) => {
  if (preventNewConnections) return;
  requestMedia()
    .then((stream) => {
      preventNewConnections = true;
      setMyVideo(stream);
      $.main.addClass("showvideo");
      document.title = "zCall - Connecting...";
      call.answer(stream);
      call.on("stream", setOtherVideo);
    })
    .catch(showError);
});

$("#icon-resize").on("click", () =>
  setStorage(
    "zCallVideoType",
    getStorage("zCallVideoType") == "cover" ? "contain" : "cover"
  )
);

updateVideoSize();
onStorageChange("zCallVideoType", updateVideoSize);
window.addEventListener("resize", () => updateVideoSize());

declare global {
  interface StorageItems {
    zCallVideoType: "contain" | "cover";
  }
}
