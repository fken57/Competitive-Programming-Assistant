import React from 'react';
import './HyperlinkButtonWithImage.css';
import Hyperlink from '../../Hyperlink/Hyperlink';

type ButtonReactWithImageProps = {
    color:string;
    children: React.ReactNode;
    imageId? : string;
    onClick: () => void;
}

export function ButtonWithImage({ color, children, imageId, onClick }: ButtonReactWithImageProps) {
    return (
        <button className={`hyperlink-button-with-image hyperlink-button-with-image--${color}`} onClick={onClick}>
            {imageId && <img src={imageId} alt="" />}
            {children}
        </button>
    );
}