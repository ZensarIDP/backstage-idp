import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem } from '@material-ui/core';

export interface DirectoryPickerProps {
  open: boolean;
  directories: string[];
  onSelect: (dir: string) => void;
  onClose: () => void;
}

export const DirectoryPicker: React.FC<DirectoryPickerProps> = ({ open, directories, onSelect, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select Target Directory</DialogTitle>
      <DialogContent>
        <List>
          {directories.map(dir => (
            <ListItem button key={dir} onClick={() => onSelect(dir)}>
              {dir}
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
