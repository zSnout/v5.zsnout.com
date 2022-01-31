import ytdl = require("ytdl-core");
import server from "..";

// prettier-ignore
let fetch: Promise<typeof globalThis.fetch> =
  eval("import('node-fetch')").then((e: any) => e.default);

server.capture(
  "/api/youtube-meta/:videoID/",
  "POST",
  { params: { videoID: "string" } },
  async (req) => {
    try {
      let url = `https://youtube.com/watch?v=${req.params.videoID}`;
      let info = await ytdl.getInfo(url);
      let details = info.videoDetails;
      let formats = info.formats;

      details.thumbnails.sort((a, b) => b.height - a.height);
      let { url: tnURL } = details.thumbnails.filter((e) => e.height <= 256)[0];
      let thumbnail = await (await fetch)(tnURL).then((r) => r.arrayBuffer());
      let thumbnailData = Buffer.from(thumbnail).toString("base64");

      return {
        title: details.title,
        description: details.description,
        isLive: details.isLiveContent,
        channel: details.ownerChannelName,
        thumbnail: `data:image/jpeg;base64,${thumbnailData}`,
        formats: formats.map(
          ({ url, hasAudio, hasVideo, qualityLabel, audioQuality }) =>
            ({ url, hasAudio, hasVideo, qualityLabel, audioQuality }) // prettier-ignore
        ),
      };
    } catch (err: any) {
      return {
        error: true,
        message: "Oops, an error occurred! " + (err?.message || err),
      };
    }
  }
);
