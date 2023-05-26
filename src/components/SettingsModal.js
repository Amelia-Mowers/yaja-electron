import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Button, Form, FormControl, FormGroup, FormLabel, FormCheck, Dropdown } from 'react-bootstrap';
import EventBus from '../utils/eventBus';
import ConfigManager from '../utils/ConfigManager';
import DynamicStringArrayInput from './DynamicStringArrayInput';

function SettingsModal() {
  const configSchema = ConfigManager.getConfigurationSchema();
  const [config, setConfigState] = useState(ConfigManager.getConfig());
  const [show, setShow] = useState(false);

  const openModal = useCallback(() => setShow(true), []);

  useEffect(() => {
    const unsubscribe = EventBus.openSettingsModal.subscribe(openModal);
    return () => {
      unsubscribe();
    };
  }, [openModal]);  

  const updateConfig = (e) => {
    e.preventDefault();
    ConfigManager.setConfig(config);
    setShow(false);
  };

  const resetConfigState = (e) => {
    e.preventDefault();
    ConfigManager.resetConfig();
    setConfigState(ConfigManager.getConfig());
    setShow(false);
  };

  const handleClose = () => setShow(false);

  const handleChange = (name, value) => {
    setConfigState((prevConfig) => ({ ...prevConfig, [name]: value }));
  };
  
  const renderInputContent = (key, value, inputType, childElement) => (
    <FormGroup key={key} className="mb-3">
      {childElement}
    </FormGroup>
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
        <FormCheck
          type="checkbox"
          name={key}
          checked={value}
          label={configSchema[key].label}
          onChange={(event) => handleChange(key, event.target.checked)}
        />
      );
    }
  
    if (options) {
      return renderInputContent(key, value, 'select',
        <>
          <FormLabel>
            {configSchema[key].label}:
          </FormLabel>
          <FormControl
            as="select"
            name={key}
            value={value}
            onChange={(event) => handleChange(key, event.target.value)}
          >
            {options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </FormControl>
        </>
      );
    }
  
    return renderInputContent(key, value, type,
      <>
        <FormLabel>
          {configSchema[key].label}:
        </FormLabel>
        <FormControl
          type={type === 'number' ? 'number' : 'text'}
          name={key}
          value={value}
          onChange={(event) => handleChange(key, event.target.value)}
        />
      </>
    );
  };
  
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={updateConfig}>
          {Object.entries(config).map(([key, value]) => renderInput(key, value))}
          <Button variant="secondary" onClick={resetConfigState}>Reset to Default</Button>{' '}
          <Button variant="primary" type="submit">Save Changes</Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SettingsModal;
