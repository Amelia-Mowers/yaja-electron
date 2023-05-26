import React from 'react';
import { Button } from 'react-bootstrap';
import EventBus from '../utils/eventBus';

function SettingsMenuButton() {
    const openSettings = () => {
        EventBus.openSettingsModal.publish();
    }

    return (
        <Button onClick={openSettings}>Settings</Button>
    );
}

export default SettingsMenuButton;
