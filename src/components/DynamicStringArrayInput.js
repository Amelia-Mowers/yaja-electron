import { useState, useEffect, useRef } from 'react';
import { Button, InputGroup, FormControl } from 'react-bootstrap';

/**
 * DynamicStringArrayInput is a form component for collecting a dynamic array of string inputs.
 * Each input field includes a delete button for removing that input.
 * An "Add" button is provided to add more input fields, and focus is automatically shifted to the new input.
 *
 * Props:
 * - name (string): the name of the form input
 * - onChange (function): a function to call when the input changes; it receives the name and value
 */

const DynamicStringArrayInput = ({ name, onChange, value }) => {
    const [inputs, setInputs] = useState(value || ['']); 
    const prevInputs = usePrevious(inputs);
    const newInputRef = useRef(null); // Define newInputRef here

    const handleInputChange = (index, event) => {
        const values = [...inputs];
        values[index] = event.target.value;
        setInputs(values);
    };

    const handleInputDelete = (index) => {
        setInputs(inputs.filter((_, i) => i !== index));
    };

    const handleAddInput = () => {
        setInputs(prevInputs => [...prevInputs, '']);
    };

    useEffect(() => {
        if (typeof onChange === 'function' && inputs !== prevInputs) {
            onChange(name, inputs.filter(input => input !== ''));
        }
    }, [inputs, name, onChange, prevInputs]);

    return (
        <>
            {inputs.map((input, index) => (
                <InputGroup className="mb-3" key={index}>
                    <FormControl
                        type="text"
                        value={input}
                        onChange={event => handleInputChange(index, event)}
                        ref={index === inputs.length - 1 ? newInputRef : null}
                    />
                    <Button variant="outline-secondary" onClick={() => handleInputDelete(index)}>Delete</Button>
                </InputGroup>
            ))}
            <Button variant="secondary" onClick={handleAddInput}>Add</Button>
        </>
    );
};

// Custom hook to get the previous value of a variable
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default DynamicStringArrayInput;
