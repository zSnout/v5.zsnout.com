/// <reference types="../../types" />

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
        start: [
          {
            token: "comment.line",
            regex: /#.*/,
          },
          {
            token: "storage.type.function",
            regex: /function|func|def|let/,
          },
          {
            token: "keyword",
            regex:
              /if|elif|else|unless|while|until|each|return|and|or|not|is|isnt|in|of/,
          },
          {
            token: "constant.language",
            regex: /true|false|null/,
          },
          {
            token: "keyword.operator",
            regex: /[+\-*\/%>=<!]|&&|\|\|/,
          },
          {
            token: "paren",
            regex: /[()[\]]/,
          },
          {
            token: "entity.name.function",
            regex: /@[\w_][\w\d_]*/,
          },
          {
            token: "variable.storymatic",
            regex: /\$[\w_][\w\d_]*/,
          },
          {
            token: "constant.numeric",
            regex: /\d+(?:\.\d+)?/,
          },
          {
            token: "constant.language",
            regex: /true|false|null/,
          },
          {
            token: "string",
            regex: /"/,
            next: "string-doublequote",
          },
          {
            token: "string",
            regex: /'/,
            next: "string-singlequote",
          },
        ],
        "string-doublequote": [
          {
            token: "constant.language.escape",
            regex: /\\./,
          },
          {
            token: "string",
            regex: /"|$/,
            next: "start",
          },
          {
            token: "variable.storymatic",
            regex: /\$[\w_][\w\d_]*/,
          },
          {
            token: "string",
            regex: /./,
          },
        ],
        "string-singlequote": [
          {
            token: "constant.language.escape",
            regex: /\\./,
          },
          {
            token: "string",
            regex: /'|$/,
            next: "start",
          },
          {
            token: "variable.storymatic",
            regex: /\$[\w_][\w\d_]*/,
          },
          {
            token: "string",
            regex: /./,
          },
        ],
      };
    };

    oop.inherits(SMHighlightRules, TextHighlightRules);
    exports.SMHighlightRules = SMHighlightRules;
  }
);
