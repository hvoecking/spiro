export const fullScreenHandler = {
  isFullScreen() {
    return document.fullscreenElement === document.body;
  },

  toggleFullScreen() {
    if (!this.isFullScreen()) {
      document.body.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  },
};
