import React from 'react';
import  './Button.css';

type ButtonProps = {
    color:string;
    children: React.ReactNode;
    onClick: () => void;
}

export const MyButton = ({ color , children , onClick}:ButtonProps) => {
    return (
        <button 
            className="my-beautiful-button"
            style={{ '--btn-color': color } as React.CSSProperties}
            onClick={onClick}
        >
            {children}
        </button>
    );
}