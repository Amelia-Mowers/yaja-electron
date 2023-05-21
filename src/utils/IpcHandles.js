function createIpcHandle(name) {
  const invoke = (...args) => window.electron.invoke(name, ...args);
  const on = (callback) => window.electron.on(name + '-update', callback);
  const off = (callback) => window.electron.removeListener(name + '-update', callback);
  
  const invokeWithCallback = (callback, ...args) => {
    on(callback);
    const promise = invoke(...args);
    promise.finally(() => off(callback));
    return promise;
  };

  return { invoke, on, off, invokeWithCallback };
}

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

