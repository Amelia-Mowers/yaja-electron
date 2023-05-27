import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, Button, ProgressBar, Spinner, ListGroup } from 'react-bootstrap';
import EventBus from '../utils/eventBus';

function ProgressModal() {
  const [show, setShow] = useState(false);
  const [messages, setMessages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [finalMessage, setFinalMessage] = useState({ message: '', showCloseButton: false }); 

  const messagesEndRef = useRef(null);

  const resetState = () => {
    setMessages([]);
    setProgress(0);
    setFinalMessage({ message: '', showCloseButton: false });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const updateProgress = useCallback((data) => {
    setShow(true);
    if (data.message) {
        setMessages(oldMessages => [...oldMessages, data.message]);
    }
    setProgress(data.progress);
    
    if (data.final) {
      if(data.message.includes('Cancelled')) {
        // If the event is cancellation, show the close button
        setFinalMessage({ message: data.message, showCloseButton: true });
      } else {
        setShow(false);
        resetState();
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = EventBus.JobListingsProgressUpdate.subscribe(updateProgress);
    return () => {
      unsubscribe();
    };
  }, [updateProgress]);

  useEffect(scrollToBottom, [messages]);

  return (
    <Modal show={show} onHide={() => {}} centered>
      <Modal.Header>
        <Modal.Title>
          <Spinner animation="border" role="status" size="sm" /> Job Listings Progress
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProgressBar animated now={progress} label={`${Math.floor(progress)}%`} />
        <ListGroup variant="flush" style={{ height: '200px', overflowY: 'auto' }}>
          {messages.map((message, index) => (
            <ListGroup.Item key={index}>{message}</ListGroup.Item>
          ))}
          <div ref={messagesEndRef} />
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        {finalMessage.showCloseButton && 
          <Button variant="secondary" onClick={() => {
            setShow(false);
            resetState();
          }}>
            Close
          </Button>
        }
      </Modal.Footer>
    </Modal>
  );
}

export default ProgressModal;
