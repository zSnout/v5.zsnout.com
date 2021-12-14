/// <reference types="../../../types" />

ace.define(
  "ace/mode/storymatic",
  ["require", "exports"],
  function (require, exports) {
    let oop = require("ace/lib/oop");
    let TextMode = require("ace/mode/text").Mode;
    let StorymaticHighlightRules =
      require("ace/mode/storymatic_highlight_rules").SMHighlightRules;

    let Mode = function (this: any) {
      this.HighlightRules = StorymaticHighlightRules;
      this.lineCommentStart = "#";
    };

    oop.inherits(Mode, TextMode);
    exports.Mode = Mode;
  }
);

ace.define(
  "ace/mode/storymatic_highlight_rules",
  ["require", "exports"],
  function (require, exports) {
    let oop = require("ace/lib/oop");
    let { TextHighlightRules } = require("ace/mode/text_highlight_rules");
    let SMHighlightRules = function (this: any) {
      this.$rules = {
        start: [],
      };
    };

    oop.inherits(SMHighlightRules, TextHighlightRules);
    exports.SMHighlightRules = SMHighlightRules;
  }
);
