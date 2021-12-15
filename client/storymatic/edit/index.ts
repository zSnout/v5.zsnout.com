let editor = ace.edit("editor");
editor.setFontSize("1em");
editor.setShowPrintMargin(false);
editor.setOption("scrollPastEnd", true);
editor.session.setMode("ace/mode/storymatic");
editor.session.setUseWrapMode(true);
editor.session.setUseSoftTabs(true);
editor.session.setTabSize(2);
editor.container.classList.remove("ace-tm");
