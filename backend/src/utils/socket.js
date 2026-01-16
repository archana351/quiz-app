let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const getIO = () => ioInstance;

const emitToAll = (event, payload) => {
  if (!ioInstance) {
    console.warn(`Socket emit skipped; io not initialized for event ${event}`);
    return;
  }
  ioInstance.emit(event, payload);
};

module.exports = {
  setIO,
  getIO,
  emitToAll,
};
