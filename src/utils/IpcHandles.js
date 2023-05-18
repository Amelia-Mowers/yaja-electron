const createIpcHandle = (name) => (...args) => window.electron.invoke(name, ...args);

function getIpcHandles() {
  return window.electron.invoke('IpcFunctionNames').then(functionNames => {
    var ipcHandles = functionNames.reduce((handles, name) => {
      handles[name] = createIpcHandle(name);
      return handles;
    }, {});
    return ipcHandles;
  });
}

let IpcHandles = getIpcHandles();

export default IpcHandles;

