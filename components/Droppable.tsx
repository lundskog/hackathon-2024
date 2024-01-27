
import React from 'react';
import {useDroppable} from '@dnd-kit/core';

interface DroppableProps {
  id: string;
  children: React.ReactNode;
}

export function Droppable({id, children}: DroppableProps) {
  const {isOver, setNodeRef} = useDroppable({
    id: id,
  });
  const style = {
    opacity: isOver ? 1 :1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}