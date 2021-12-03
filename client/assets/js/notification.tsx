import $, { jsx, zQuery } from "./jsx.js";

/** Properties for a <Notification> element. */
export interface NotificationProps {
  /** The body text of the notification. */
  body: string;

  /**
   * The timeout to wait before hiding the notification.
   * @default 100
   */
  timeout?: number;

  /** An object containing action buttons that will be added to the notification. */
  actions?: { [action: string]: () => void };
}

/** Creates a JSX element representing a notification. */
export default function Notification({
  body,
  actions,
}: Omit<NotificationProps, "timeout">): zQuery {
  actions = actions || {};

  return (
    <div className="notification">
      <span children={body} />
      {Object.entries(actions).map(([action, callback]) => (
        <button children={action} onClick={callback} />
      ))}
    </div>
  );
}

/**
 * Creates a notification and adds it to the DOM.
 * @param body The body text of the notification.
 * @param timeout The timeout to wait before hiding the notification.
 * @param actions An object containing action buttons that will be added to the notification.
 * @returns A function that, when called, removes the notification from the DOM.
 */
export function createNotification(
  body: NotificationProps["body"],
  timeout: NotificationProps["timeout"] = 10000,
  actions: NotificationProps["actions"] = {}
): () => void {
  function hide() {
    notification.addClass("hide");
    setTimeout(() => notification.remove(), 1500);
  }

  $(".notification").remove();

  let notification = <Notification body={body} actions={actions} />;
  notification.appendTo($.body);
  setTimeout(hide, timeout);

  return hide;
}
