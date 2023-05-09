// src/components/SelectFolderButton.js
import React from 'react';

function SelectFolderButton({ onFolderSelect }) {
  const openFileDialog = () => {
    const chooser = document.createElement('input');
    chooser.setAttribute('type', 'file');
    chooser.setAttribute('nwsaveas', '');
    chooser.setAttribute('nwworkingdir', '');
    chooser.setAttribute('webkitdirectory', '');
    chooser.addEventListener('change', () => {
      const folderPath = chooser.value;
      onFolderSelect(folderPath);
    });
    chooser.click();
  };

  return (
    <button onClick={openFileDialog} className="btn btn-primary">
      Select Database Folder
    </button>
  );
}

export default SelectFolderButton;
