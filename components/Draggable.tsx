import React from 'react';
import {useDraggable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';

interface DraggableProps {
  id: string;
  children: React.ReactNode;
}

function Draggable({id, children}: DraggableProps) {
  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
    id: id,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 2 : "auto", // Change the z-index when the card is being dragged
  };

  return (
    <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </button>
  );
}

export default Draggable;