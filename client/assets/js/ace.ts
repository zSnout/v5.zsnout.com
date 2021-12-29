import { zQuery } from "./jsx.js";

/**
 * Creates an Ace editor instance and adds some presets.
 * @param el The element to initialize an editor in.
 * @returns An Ace editor instance.
 */
export function edit(el: zQuery | HTMLElement | string): AceAjax.Editor {
  if (el instanceof zQuery) el = el[0];

  let editor = (ace.edit as any)(el as any, {
    useWorker: false,
  }) as AceAjax.Editor;

  editor.setFontSize("0.875em");
  editor.setOption("fontFamily", "'Fira Code', monospace");
  editor.setShowPrintMargin(false);
  editor.session.setUseWrapMode(true);
  editor.session.setUseSoftTabs(true);
  editor.session.setTabSize(2);
  editor.renderer.setShowGutter(false);
  editor.container.classList.remove("ace-tm");
  editor.container.classList.add("cobalt2");

  return editor;
}
