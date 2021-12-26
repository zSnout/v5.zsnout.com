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
      let dq = [
        { token: "constant.language.escape", regex: /\\./ },
        { token: "string", regex: /"|$/, next: "start" },
        { token: "text", regex: /{/, next: "start" },
        { token: "variable.storymatic", regex: /\$[\w_][\w\d_]*/ },
      ];

      this.$rules = {
        start: [
          { token: "comment.line", regex: /#.*/ },
          { token: "storage.type.function", regex: /function|func|def|let/ },
          {
            token: "keyword",
            regex:
              /if|elif|else|unless|while|until|each|return|and|or|not|isnt|is|in|of|be/,
          },
          { token: "constant.language", regex: /true|false|null/ },
          { token: "keyword.operator", regex: /[+\-*\/%>=<!]|&&|\|\|/ },
          { token: "paren", regex: /[()[\]]/ },
          { token: "entity.name.function", regex: /@[\w_][\w\d_]*/ },
          { token: "variable.storymatic", regex: /\$[\w_][\w\d_]*/ },
          { token: "constant.numeric", regex: /\d+(?:\.\d+)?/ },
          { token: "constant.language", regex: /true|false|null/ },
          { token: "string", regex: /"/, next: "string-dq" },
          { token: "text", regex: /}/, next: "string-dq" },
          { token: "text", regex: /\s+/ },
          { token: "invalid", regex: /./ },
        ],
        "string-dq": [
          ...dq,
          { token: "markup.bold", regex: /\*/, next: "string-dq-b" },
          { token: "markup.italic", regex: /_/, next: "string-dq-i" },
          { token: "string", regex: /./ },
        ],
        "string-dq-b": [
          ...dq,
          { token: "markup.bold", regex: /\*/, next: "string-dq" },
          { token: "markup.bold.italic", regex: /_/, next: "string-dq-bi" },
          { token: "string.markup.bold", regex: /./ },
        ],
        "string-dq-i": [
          ...dq,
          { token: "markup.bold.italic", regex: /\*/, next: "string-dq-bi" },
          { token: "markup.italic", regex: /_/, next: "string-dq" },
          { token: "string.markup.italic", regex: /./ },
        ],
        "string-dq-bi": [
          ...dq,
          { token: "markup.bold.italic", regex: /\*/, next: "string-dq-i" },
          { token: "markup.bold.italic", regex: /_/, next: "string-dq-b" },
          { token: "string.markup.bold.italic", regex: /./ },
        ],
      };
    };

    oop.inherits(SMHighlightRules, TextHighlightRules);
    exports.SMHighlightRules = SMHighlightRules;
  }
);
