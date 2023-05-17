let ipcHandles = null;

const createIpcHandle = (name) => (...args) => window.electron.invoke(name, ...args);

const getIpcHandles = async () => {
  if (ipcHandles === null) {
    const functionNames = await window.electron.invoke('IpcFunctionNames');
    ipcHandles = functionNames.reduce((handles, name) => {
      handles[name] = createIpcHandle(name);
      return handles;
    }, {});
  }
  return ipcHandles;
};

export default getIpcHandles;