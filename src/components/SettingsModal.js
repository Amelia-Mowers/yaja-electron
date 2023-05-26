import React, { useState, useEffect, useRef, useCallback } from 'react';
import EventBus from '../utils/eventBus';
import ConfigManager from '../utils/ConfigManager';
import DynamicStringArrayInput from './DynamicStringArrayInput';

function SettingsModal() {
  const dialogRef = useRef(null);
  const configSchema = ConfigManager.getConfigurationSchema();
  const [config, setConfigState] = useState(ConfigManager.getConfig());

  const openModal = useCallback(() => dialogRef.current.showModal(), []);

  useEffect(() => {
    const unsubscribe = EventBus.openSettingsModal.subscribe(openModal);
    return () => {
      unsubscribe();
    };
  }, [openModal]);  

  const updateConfig = () => {
    ConfigManager.setConfig(config);
    dialogRef.current.close();
  };

  const resetConfigState = () => {
    ConfigManager.resetConfig();
    setConfigState(ConfigManager.getConfig());
    dialogRef.current.close();
  };

  const handleClose = () => {
    dialogRef.current.close();
  };

  const handleChange = (name, value) => {
    setConfigState((prevConfig) => ({ ...prevConfig, [name]: value }));
  };

  const renderInputContent = (key, value, inputType, childElement) => (
    <div key={key}>
      <label>
        {configSchema[key].label}:
        {childElement}
      </label>
    </div>
  );
  
  const renderInput = (key, value) => {
    const { type, elementType, options } = configSchema[key];
  
    if (type === 'array' && elementType === 'string') {
      return renderInputContent(key, value, 'array', 
        <DynamicStringArrayInput
          name={key}
          onChange={handleChange}
          value={value}
        />
      );
    }
  
    if (type === 'boolean') {
      return renderInputContent(key, value, 'boolean',
        <input
          type="checkbox"
          name={key}
          checked={value}
          onChange={(event) => handleChange(key, event.target.checked)}
        />
      );
    }
  
    if (options) {
      return renderInputContent(key, value, 'select',
        <select
          name={key}
          value={value}
          onChange={(event) => handleChange(key, event.target.value)}
        >
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }
  
    return renderInputContent(key, value, type,
      <input
        type={type === 'number' ? 'number' : 'text'}
        name={key}
        value={value}
        onChange={(event) => handleChange(key, event.target.value)}
      />
    );
  };
  

  return (
    <dialog ref={dialogRef}>
      <form method="dialog">
        {Object.entries(config).map(([key, value]) => renderInput(key, value))}
        <button onClick={resetConfigState}>Reset to Default</button>
        <button type="submit" onClick={updateConfig}>Save Changes</button>
        <button onClick={handleClose}>Exit</button>
      </form>
    </dialog>
  );
}

export default SettingsModal;
