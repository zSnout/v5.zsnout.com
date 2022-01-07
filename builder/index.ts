import "./log";
import { join } from "path";
import { buildDir as buildEJS, watchDir as watchEJS } from "./ejs";
import { buildDir as buildMD, watchDir as watchMD } from "./md";
import { buildDir as buildJS, watchDir as watchJS } from "./js";

if (process.argv[2] == "-b") {
  buildEJS(join(__dirname, "../../client/"));
  buildMD(join(__dirname, "../../client/"));
  buildJS(join(__dirname, "../../.client/"));
} else if (process.argv[2] == "-w") {
  watchEJS(join(__dirname, "../../client/"));
  watchMD(join(__dirname, "../../client/"));
  watchJS(join(__dirname, "../../.client/"));
} else log("cli", "invalid build type");
