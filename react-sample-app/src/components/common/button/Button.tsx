import React from 'react';
import  './Button.css';
import { Navigate } from 'react-router-dom';

type ButtonProps = {
    color:string;
    children: React.ReactNode;
    onClick: () => void;
}



export const MyButton = ({ color , children  , onClick}:ButtonProps) => {
    return (
        <button 
            className="my-beautiful-button"
            style={{ '--btn-color': color } as React.CSSProperties}
            onClick={onClick}
        >
            <div className="button-content">
                {children}
            </div>
        </button>
    );
}