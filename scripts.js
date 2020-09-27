/*
Resolarized
*/

'use strict';

const Resolarized = {
  consecutiveClass: "consecutive",

  getPreviousLine(line) {
    let previousLine = line.previousElementSibling;
    if (previousLine && previousLine.id === "mark") {
      previousLine = previousLine.previousElementSibling;
    }

    if (previousLine &&
      previousLine.classList &&
      previousLine.classList.contains("line")
    ) { return previousLine; }
    else { return null; }
  },

  getSenderElement(line) {
    return line ? line.querySelector(".sender") : null;
  },

  getSenderNickname(line) {
    const sender = Resolarized.getSenderElement(line);
    return sender ? sender.dataset.nickname : null;
  },

  handleConsecutiveMessages(current, previous) {
    const previousSender = Resolarized.getSenderNickname(previous);
    const currentSender = Resolarized.getSenderNickname(current);

    if (currentSender === null || previousSender === null) {
      return;
    }

    const consecutive = currentSender === previousSender;
    const firstConsecutive = consecutive && !previous.classList.contains(Resolarized.consecutiveClass);

    if (consecutive) {
      const anchorId = firstConsecutive ? previous.id : previous.dataset.resolarizedAnchor;

      current.dataset.resolarizedAnchor = anchorId;
      current.classList.add(Resolarized.consecutiveClass);

      Resolarized.linkHoverToSender(current);
    }
  },

  linkHoverToSender(line) {
    const remoteHoverClass = "hover-on-sibling";

    line.addEventListener("mouseover", () => {
      const visibleSenderId = line.dataset.resolarizedAnchor;
      let senderDisplay = document.getElementById(visibleSenderId);
      if (senderDisplay) {
        senderDisplay.classList.add(remoteHoverClass);
      }
    }, { passive: true });

    line.addEventListener("mouseleave", () => {
      const visibleSenderId = line.dataset.resolarizedAnchor;
      let senderDisplay = document.getElementById(visibleSenderId);
      if (senderDisplay) {
        senderDisplay.classList.remove(remoteHoverClass);
      }
    }, { passive: true });
  },

  setLightness(lightness) {
    const body = document.body;
    switch (lightness) {
      case "light": {
        body.dataset.themeLightness = "light";
        break;
      }
      case "dark": {
        body.dataset.themeLightness = "dark";
        break;
      }
      default: delete body.dataset.themeLightness;
    }
  },
};

/*
Textual API calls

Defined in: "Textual.app -> Contents -> Resources -> JavaScript -> API -> core.js"
*/

/* ESLint Configuration */
/* global app, Textual, ConversationTracking */

/* WONTFIX (most likely)
The `lightness` setting comes into effect too
late: there is always a flash of the default color scheme (dark) before
the view switches over to the appropriate one. Moreover, there is no
color or opacity transition.

This solely affects full theme reload, which only happens when users
change style settings or during development.
*/
Textual.viewBodyDidLoad = () => {
  app.appearance(lightness => {
    Resolarized.setLightness(lightness);
  });

  Textual.fadeOutLoadingScreen(1.0, 1.0);
};

Textual.appearanceDidChange =
  (lightness) => Resolarized.setLightness(lightness);

Textual.nicknameSingleClicked =
  (e) => ConversationTracking.nicknameSingleClickEventCallback(e);

Textual.messageAddedToView = (lineNumber) => {
  const currentLine = document.getElementById("line-" + lineNumber);
  const previousLine = Resolarized.getPreviousLine(currentLine);
  if (currentLine && previousLine) {
    Resolarized.handleConsecutiveMessages(currentLine, previousLine);
  }

  ConversationTracking.updateNicknameWithNewMessage(currentLine);
};
