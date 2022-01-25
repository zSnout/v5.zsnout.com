import $ from "../assets/js/jsx.js";
import { createNotification } from "../assets/js/notification.js";
import { getLocationHash } from "../assets/js/util.js";

let myVideo = $("#myvideo")[0] as HTMLVideoElement;
let video = $("#video")[0] as HTMLVideoElement;
let info = $("#info");

let showInfo = (text: string) =>
  ($.main.removeClass("showvideo"), info.text(text)); // prettier-ignore
let setMyVideo = (stream: MediaStream) => (myVideo.srcObject = stream);
let setOtherVideo = (stream: MediaStream) =>
  ((video.srcObject = stream), (document.title = "zCall - Connected")); // prettier-ignore
let requestMedia = () =>
  navigator.mediaDevices.getUserMedia({ video: true, audio: true });
let showError = (err: any) => showInfo(`Error: ${err.message || err}`);

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
    })
    .catch(showError);
});

peer.on("call", (call) => {
  requestMedia()
    .then((stream) => {
      setMyVideo(stream);
      $.main.addClass("showvideo");
      document.title = "zCall - Connecting...";
      call.answer(stream);
      call.on("stream", setOtherVideo);
    })
    .catch(showError);
});
