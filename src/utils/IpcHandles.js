function createIpcHandle(name) {
  const invoke = (...args) => window.electron.invoke(name, ...args);
  const on = (callback) => window.electron.on(name + '-update', callback);
  const off = () => window.electron.removeAllListeners(name + '-update');
  
  const invokeWithCallback = async (callback, ...args) => {
    on(callback);
    const result = await invoke(...args);
    await off();
    return result;
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

