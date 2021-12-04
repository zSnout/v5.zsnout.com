/** CSS properties that can be assigned to HTMLElement.style. */
export type CSSRules = Omit<
  CSSStyleDeclaration,
  | number
  | typeof Symbol.iterator
  | "length"
  | "parentRule"
  | "getPropertyPriority"
  | "getPropertyValue"
  | "item"
  | "removeProperty"
  | "setProperty"
>;

/** The main zQuery class. */
export class zQuery extends Array<HTMLElement> {
  /**
   * Creates a new zQuery instance.
   * @param els The elements to be added to the zQuery.
   * @returns The new zQuery instance.
   */
  constructor(...els: HTMLElement[]) {
    super(...els);
  }

  /**
   * Calls a function on each element in this zQuery.
   * @param callback The function to call on each element.
   * @returns The current zQuery, to allow for chaining.
   */
  each(callback: (element: HTMLElement) => void): this {
    this.forEach(callback);

    return this;
  }

  /**
   * Gets the text content of the first element in this zQuery.
   * @returns The text content of the first element in the current zQuery.
   */
  text(): string;

  /**
   * Sets the text content of all elements in this zQuery.
   * @param content The text to fill elements with.
   * @returns The current zQuery, to allow for chaining.
   */
  text(content: string): this;

  text(content?: string): string | this {
    if (!content) return this[0]?.textContent || "";
    else return this.each((el) => (el.textContent = content));
  }

  /**
   * Gets the inner HTML of the first element in this zQuery.
   * @returns The inner HTML of the first element in the current zQuery.
   */
  html(): string;

  /**
   * Sets the inner HTML of all elements in this zQuery.
   * @param content The HTML content to fill elements with.
   * @returns The current zQuery, to allow for chaining.
   */
  html(content: string): this;

  html(content?: string): string | this {
    if (!content) return this[0]?.innerHTML || "";
    else return this.each((el) => (el.innerHTML = content));
  }

  /**
   * Moves all elements in a zQuery into the `main` element.
   * @returns The current zQuery, to allow for chaining.
   */
  render(): this {
    return this.appendTo($.main);
  }

  /**
   * Gets the elements of this zQuery.
   * @returns An array containing the elements of this zQuery.
   */
  elements(): HTMLElement[] {
    return [...this];
  }

  /**
   * Empties all elements in this zQuery.
   * @returns The current zQuery, to allow for chaining.
   */
  empty(): this {
    return this.each((el) => (el.innerHTML = ""));
  }

  /**
   * Removes all elements in this zQuery from the DOM.
   * @returns The current zQuery, to allow for chaining.
   */
  remove(): this {
    return this.each((el) => el.remove());
  }

  /**
   * Appends elements to the first item in this zQuery.
   * @param els The elements to append.
   * @returns The current zQuery, to allow for chaining.
   */
  append(...els: (HTMLElement | zQuery | string)[]): this {
    this[0]?.append(...els.flat());

    return this;
  }

  /**
   * Prepends elements to the first item in this zQuery.
   * @param els The elements to append.
   * @returns The current zQuery, to allow for chaining.
   */
  prepend(...els: (HTMLElement | zQuery)[]): this {
    if (this.length == 0) return this;

    for (let el of els) {
      if (el instanceof HTMLElement) this[0].prepend(el);
      else for (let item of el) this[0].prepend(item);
    }

    return this;
  }

  /**
   * Appends items in this zQuery to another element.
   * @param item The item to append to. Can be a selector, zQuery, or HTMLElement.
   * @returns The current zQuery, to allow for chaining.
   */
  appendTo(item: zQuery | HTMLElement | string): this {
    $(item).append(this);

    return this;
  }

  /**
   * Adds an event listener to this zQuery.
   * @param event The event to listen for.
   * @param callback A callback that will be called when the event is triggered.
   * @param options Options to add to the event listener.
   * @returns The current zQuery, to allow for chaining.
   */
  on<E extends keyof HTMLElementEventMap>(
    event: E,
    callback: (event: HTMLElementEventMap[E]) => void,
    options: Omit<AddEventListenerOptions, "once"> = {}
  ): this {
    this.forEach((el) => el.addEventListener(event, callback, options));

    return this;
  }

  /**
   * Adds a one-time event listener to this zQuery.
   * @param event The event to listen for.
   * @param callback A callback that will be called when the event is triggered.
   * @param options Options to add to the event listener.
   * @returns The current zQuery, to allow for chaining.
   */
  once<E extends keyof HTMLElementEventMap>(
    event: E,
    callback: (event: HTMLElementEventMap[E]) => void,
    options: Omit<AddEventListenerOptions, "once"> = {}
  ): this {
    this.forEach((el) =>
      el.addEventListener(event, callback, { ...options, once: true })
    );

    return this;
  }

  /**
   * Remove an event listener from this zQuery.
   * @param event The event that was listened to.
   * @param callback The callback attatched to the event listener.
   * @param options Options to pass to the event listener.
   * @returns The current zQuery, to allow for chaining.
   */
  off(
    event: keyof HTMLElementEventMap,
    callback: () => void,
    options: EventListenerOptions = {}
  ): this {
    this.forEach((el) => el.removeEventListener(event, callback, options));

    return this;
  }

  /**
   * Gets the parents of the first element in this zQuery.
   * @returns A zQuery containing the parents of the first element in the current zQuery.
   */
  parents(): zQuery {
    let el: HTMLElement | null = this[0];
    if (!el) return new zQuery();

    let els = [el];
    while ((el = el.parentElement)) els.push(el);

    return new zQuery(...els);
  }

  /**
   * Gets the parent of the first element in this zQuery.
   * @returns A zQuery containing the parent of the first element in the current zQuery.
   */
  parent(): zQuery {
    if (this[0]?.parentElement) return new zQuery(this[0].parentElement);
    else return new zQuery();
  }

  /**
   * Filters elements in this zQuery by a CSS selector.
   * @param selector The CSS selector to filter by.
   * @returns A zQuery containing elements matching the CSS selector.
   */
  where(selector: string): zQuery {
    return this.filter((el) => el.matches(selector)) as zQuery;
  }

  /**
   * Checks if every element in this zQuery matches a selector.
   * @param selector The CSS selector to match.
   * @returns A boolean indicating whether all of the elements in this zQuery match the selector.
   */
  is(selector: string): boolean {
    return this.every((el) => el.matches(selector));
  }

  /**
   * Gets the classes on the first element in a zQuery.
   * @returns The class name of the first element in this zQuery.
   */
  className(): string;

  /**
   * Sets the class name of each element in this zQuery.
   * @param className The class name to set each element to.
   * @returns The current zQuery, to allow for chaining.
   */
  className(className: string): this;

  className(className?: string): this | string {
    if (className) return this.each((el) => (el.className = className));
    else if (this.length) return this[0].className;
    else return "";
  }

  /**
   * Checks if every element in this zQuery has a class.
   * @param className The name of the class to check for.
   * @returns A boolean indicating whether the class is present.
   */
  hasClass(className: string): boolean {
    return this.every((el) => el.classList.contains(className));
  }

  /**
   * Adds a class to each element in this zQuery.
   * @param classNames The names of the classes to add.
   * @returns The current zQuery, to allow for chaining.
   */
  addClass(...classNames: string[]): this {
    return this.each((el) => el.classList.add(...classNames));
  }

  /**
   * Removes a class from each element in this zQuery.
   * @param classNames The names of the classes to remove.
   * @returns The current zQuery, to allow for chaining.
   */
  removeClass(...classNames: string[]): this {
    return this.each((el) => el.classList.remove(...classNames));
  }

  /**
   * Hides each element in this zQuery.
   * @returns The current zQuery, to allow for chaining.
   */
  hide(): this {
    return this.each((el) => (el.style.display = "none"));
  }

  /**
   * Shows each element in this zQuery.
   * @returns The current zQuery, to allow for chaining.
   */
  show(): this {
    return this.each((el) => (el.style.display = ""));
  }

  /**
   * Sets a CSS property on every element in this zQuery.
   * @param prop The property to set.
   * @param val The value to set the property to.
   * @returns The current zQuery, to allow for chaining.
   */
  css<K extends keyof CSSRules>(prop: K, val: CSSRules[K]): this;

  /**
   * Gets the value of a CSS property on the first element in this zQuery.
   * @param prop The property to get.
   * @returns The current zQuery, to allow for chaining.
   */
  css<K extends keyof CSSRules>(prop: K): CSSRules[K];

  /**
   * Sets several CSS properties on every element in this zQuery.
   * @param items An object containing key-value pairs to set.
   * @returns The current zQuery, to allow for chaining.
   */
  css(items: Partial<CSSRules>): this;

  css<K extends keyof CSSRules>(
    prop: K | Partial<CSSRules>,
    val?: CSSRules[K]
  ): this | CSSRules[K] {
    if (typeof prop == "string") {
      if (typeof val != "undefined") {
        this.each((el) => (el.style[prop] = val));
      } else return this[0]?.style?.[prop];
    } else {
      let rules = Object.entries(prop) as [keyof CSSRules, any][];

      for (let [prop, val] of rules) {
        this.each((el) => (el.style[prop] = val));
      }
    }

    return this;
  }

  /**
   * Gets the value of the first element in this zQuery.
   * @returns The value of the first element in this zQuery.
   */
  val(): string;

  /**
   * Sets the value of all elements in this zQuery.
   * @param val The value to set elements to.
   * @returns The current zQuery, to allow for chaining.
   */
  val(val: string): this;

  val(val?: string): this | string {
    if (!val) return (this[0] as any)?.value || null;
    return this.each((el) => ((el as any).value = val));
  }

  /**
   * Gets the value of an attribute of the first element in this zQuery.
   * @param key The attribute to get.
   * @returns The value of the attribute or `null` if the element doesn't have a value.
   */
  attr(key: string): string | null;

  /**
   * Sets an attribute on all elements in this zQuery.
   * @param key The attribute to set.
   * @param val The value to set the attribute to.
   * @returns The current zQuery, to allow for chaining.
   */
  attr(key: string, val: string | null): this;

  attr(key: string, val?: string | null): this | string | null {
    if (val === undefined) return this[0]?.getAttribute?.(key);
    return this.each((el) => el.setAttribute(key, val || ""));
  }
}

/**
 * Creates a zQuery from CSS selectors, zQueries, and HTMLElements.
 * @param items The items to convert to a zQuery.
 * @returns A zQuery containing the items.
 */
export default function $(...items: (zQuery | HTMLElement | string)[]): zQuery {
  let els: HTMLElement[] = [];

  for (let item of items) {
    if (item instanceof HTMLElement) els.push(item);
    else if (item instanceof zQuery) els.push(...item);
    else els.push(...document.querySelectorAll<HTMLElement>(item));
  }

  return new zQuery(...els);
}

/** A zQuery containing the root element. */
$.root = $(document.documentElement);

/** A zQuery containing the `head` element. */
$.head = $(document.head);

/** A zQuery containing the `body` element. */
$.body = $(document.body);

/** A zQuery containing the root `main` element. */
$.main = $("#main");

/**
 * Creates a new JSX component and returns it as a zQuery.
 * @param component The name of the HTML tag to create, or a component to create.
 * @param props Props to pass to the HTML tag or component.
 * @param children Children to pass to the HTML tag or component.
 * @returns A zQuery containing the created HTML element.
 * @warning This function is not meant to be used directly.
 */
export function jsx(
  component: string | JSX.FunctionComponent<any>,
  props: { [x: string]: any } | null,
  ...children: any[]
): zQuery {
  if (!props) props = {};

  if ("children" in props && !children.length) {
    if (Array.isArray(props.children)) children = props.children;
    else children = [props.children];

    delete props.children;
  }

  if (typeof component == "string") {
    let el = document.createElement(component);

    for (let [key, val] of Object.entries(props)) {
      if (key.startsWith("on")) {
        el.addEventListener(key.slice(2).toLowerCase(), val);
      } else if (key == "style") {
        for (let [styleKey, styleVal] of Object.entries(val) as [string, any])
          el.style[styleKey] = styleVal;
      } else if (key == "viewBox") {
        el.setAttribute("viewBox", val.join(" "));
      } else if (key == "href") {
        el.setAttribute("href", val);
      } else {
        (el as any)[key] = val;
      }
    }

    el.append(...children.flat(2));

    return $(el);
  }

  if (children.length == 1)
    return $(component({ ...props, children: children[0] }));
  else if (children.length == 0) return $(component(props));
  else return $(component({ ...props, children }));
}

declare global {
  /** The main JSX namespace. */
  namespace JSX {
    /** Represents a JSX element. */
    interface Element extends zQuery {}

    /** The attributes property of a class component. */
    interface ElementAttributesProperty {
      props: {};
    }

    /** The children property of a class or function component. */
    interface ElementChildrenAttribute {
      children: any;
    }

    /** A list of attributes that DOM elements can have. */
    interface Attributes {
      accessKey?: string;
      ariaAtomic?: string;
      ariaAutoComplete?: string;
      ariaBusy?: string;
      ariaChecked?: string;
      ariaColCount?: string;
      ariaColIndex?: string;
      ariaColSpan?: string;
      ariaCurrent?: string;
      ariaDisabled?: string;
      ariaExpanded?: string;
      ariaHasPopup?: string;
      ariaHidden?: string;
      ariaKeyShortcuts?: string;
      ariaLabel?: string;
      ariaLevel?: string;
      ariaLive?: string;
      ariaModal?: string;
      ariaMultiLine?: string;
      ariaMultiSelectable?: string;
      ariaOrientation?: string;
      ariaPlaceholder?: string;
      ariaPosInSet?: string;
      ariaPressed?: string;
      ariaReadOnly?: string;
      ariaRequired?: string;
      ariaRoleDescription?: string;
      ariaRowCount?: string;
      ariaRowIndex?: string;
      ariaRowSpan?: string;
      ariaSelected?: string;
      ariaSetSize?: string;
      ariaSort?: string;
      ariaValueMax?: string;
      ariaValueMin?: string;
      ariaValueNow?: string;
      ariaValueText?: string;
      autocapitalize?: string;
      className?: string;
      contentEditable?: string;
      dir?: string;
      draggable?: boolean;
      enterKeyHint?: string;
      hidden?: boolean;
      href?: string;
      id?: string;
      innerText?: string;
      inputMode?: string;
      lang?: string;
      max?: number;
      maxLength?: number;
      min?: number;
      minLength?: number;
      nonce?: string;
      onAbort?: ((event: UIEvent) => any) | null;
      onAnimationCancel?: ((event: AnimationEvent) => any) | null;
      onAnimationEnd?: ((event: AnimationEvent) => any) | null;
      onAnimationIteration?: ((event: AnimationEvent) => any) | null;
      onAnimationStart?: ((event: AnimationEvent) => any) | null;
      onAuxClick?: ((event: MouseEvent) => any) | null;
      onBlur?: ((event: FocusEvent) => any) | null;
      onCanPlay?: ((event: Event) => any) | null;
      onCanPlayThrough?: ((event: Event) => any) | null;
      onChange?: ((event: Event) => any) | null;
      onClick?: ((event: MouseEvent) => any) | null;
      onClose?: ((event: Event) => any) | null;
      onContextMenu?: ((event: MouseEvent) => any) | null;
      onCueChange?: ((event: Event) => any) | null;
      onDblClick?: ((event: MouseEvent) => any) | null;
      onDrag?: ((event: DragEvent) => any) | null;
      onDragEnd?: ((event: DragEvent) => any) | null;
      onDragEnter?: ((event: DragEvent) => any) | null;
      onDragLeave?: ((event: DragEvent) => any) | null;
      onDragOver?: ((event: DragEvent) => any) | null;
      onDragStart?: ((event: DragEvent) => any) | null;
      onDrop?: ((event: DragEvent) => any) | null;
      onDurationChange?: ((event: Event) => any) | null;
      onEmptied?: ((event: Event) => any) | null;
      onEnded?: ((event: Event) => any) | null;
      onError?: OnErrorEventHandler;
      onFocus?: ((event: FocusEvent) => any) | null;
      onFormData?: ((event: FormDataEvent) => any) | null;
      onGotPointerCapture?: ((event: PointerEvent) => any) | null;
      onInput?: ((event: Event) => any) | null;
      onInvalid?: ((event: Event) => any) | null;
      onKeyDown?: ((event: KeyboardEvent) => any) | null;
      onKeyPress?: ((event: KeyboardEvent) => any) | null;
      onKeyUp?: ((event: KeyboardEvent) => any) | null;
      onLoad?: ((event: Event) => any) | null;
      onLoadedData?: ((event: Event) => any) | null;
      onLoadedMetaData?: ((event: Event) => any) | null;
      onLoadStart?: ((event: Event) => any) | null;
      onLostPointerCapture?: ((event: PointerEvent) => any) | null;
      onMouseDown?: ((event: MouseEvent) => any) | null;
      onMouseEnter?: ((event: MouseEvent) => any) | null;
      onMouseLeave?: ((event: MouseEvent) => any) | null;
      onMouseMove?: ((event: MouseEvent) => any) | null;
      onMouseOut?: ((event: MouseEvent) => any) | null;
      onMouseOver?: ((event: MouseEvent) => any) | null;
      onMouseUp?: ((event: MouseEvent) => any) | null;
      onPause?: ((event: Event) => any) | null;
      onPlay?: ((event: Event) => any) | null;
      onPlaying?: ((event: Event) => any) | null;
      onPointerCancel?: ((event: PointerEvent) => any) | null;
      onPointerDown?: ((event: PointerEvent) => any) | null;
      onPointerEnter?: ((event: PointerEvent) => any) | null;
      onPointerLeave?: ((event: PointerEvent) => any) | null;
      onPointerMove?: ((event: PointerEvent) => any) | null;
      onPointerOut?: ((event: PointerEvent) => any) | null;
      onPointerOver?: ((event: PointerEvent) => any) | null;
      onPointerUp?: ((event: PointerEvent) => any) | null;
      onProgress?: ((event: ProgressEvent) => any) | null;
      onRateChange?: ((event: Event) => any) | null;
      onReset?: ((event: Event) => any) | null;
      onResize?: ((event: UIEvent) => any) | null;
      onScroll?: ((event: Event) => any) | null;
      onSeeked?: ((event: Event) => any) | null;
      onSeeking?: ((event: Event) => any) | null;
      onSelect?: ((event: Event) => any) | null;
      onSelectionChange?: ((event: Event) => any) | null;
      onSelectStart?: ((event: Event) => any) | null;
      onStalled?: ((event: Event) => any) | null;
      onSubmit?: ((event: Event) => any) | null;
      onSuspend?: ((event: Event) => any) | null;
      onTimeUpdate?: ((event: Event) => any) | null;
      onToggle?: ((event: Event) => any) | null;
      onTouchCancel?: ((event: TouchEvent) => any) | null | undefined;
      onTouchEnd?: ((event: TouchEvent) => any) | null | undefined;
      onTouchMove?: ((event: TouchEvent) => any) | null | undefined;
      onTouchStart?: ((event: TouchEvent) => any) | null | undefined;
      onTransitionCancel?: ((event: TransitionEvent) => any) | null;
      onTransitionEnd?: ((event: TransitionEvent) => any) | null;
      onTransitionRun?: ((event: TransitionEvent) => any) | null;
      onTransitionStart?: ((event: TransitionEvent) => any) | null;
      onVolumeChange?: ((event: Event) => any) | null;
      onWaiting?: ((event: Event) => any) | null;
      onWebkitAnimationEnd?: ((event: Event) => any) | null;
      onWebkitAnimationIteration?: ((event: Event) => any) | null;
      onWebkitAnimationStart?: ((event: Event) => any) | null;
      onWebkitTransitionEnd?: ((event: Event) => any) | null;
      onWheel?: ((event: WheelEvent) => any) | null;
      outerText?: string;
      pattern?: string;
      placeholder?: string;
      readOnly?: boolean;
      required?: boolean;
      scrollLeft?: number;
      scrollTop?: number;
      slot?: string;
      spellcheck?: boolean;
      style?: Partial<CSSRules>;
      tabIndex?: number;
      title?: string;
      translate?: boolean;
      type?:
        | "button"
        | "checkbox"
        | "color"
        | "date"
        | "datetime-local"
        | "email"
        | "file"
        | "hidden"
        | "image"
        | "month"
        | "number"
        | "password"
        | "radio"
        | "range"
        | "reset"
        | "search"
        | "submit"
        | "tel"
        | "text"
        | "time"
        | "url"
        | "week"
        | "datetime";
      viewBox?: [x: number, y: number, w: number, h: number];
    }

    /** JSX elements that can be used in lowercase format. */
    type IntrinsicElements = {
      [K in keyof HTMLElementTagNameMap]: Attributes & {
        children?: any | any[];
      };
    };

    /** A generalized function component. */
    type FunctionComponent<P> = (props: P) => any;

    /** The type of the rest parameter for children in `jsx`, assuming a non-undefined parameter. */
    type NonVoidableRestChildrenParam<C> = C extends Array<infer T>
      ? [T, T, ...Array<T>]
      : [C];

    /** The type of the rest parameter for children in `jsx`. */
    type RestChildrenParam<C> = C extends undefined
      ? [] | NonVoidableRestChildrenParam<Exclude<C, undefined>>
      : NonVoidableRestChildrenParam<C>;

    /** Detects the presence of a `children` prop and uses `RestChildrenParam` on it. */
    type DetectRestChildrenParam<T> = T extends { children: infer C }
      ? RestChildrenParam<C>
      : [];

    /** Gets the prop type of a component. */
    type Props<T extends FunctionComponent<{}> | string> =
      T extends FunctionComponent<infer U> ? U : Attributes;
  }
}
