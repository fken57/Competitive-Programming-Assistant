import React from 'react';
import './HyperlinkButtonWithImage.css';
import { convertImageId } from '../../../util/common/imageidconverter';
import { Navigate } from 'react-router-dom';

type ButtonReactWithImageProps = {
    buttonColor:string;
    textColor: string;
    children: React.ReactNode;
    imageId? : string;
    onClick: () => void;
}



export function ButtonWithImage({ buttonColor, textColor,children, imageId, onClick }: ButtonReactWithImageProps) {
    return (
        <div className="hyperlink-button-with-image-container">
            <button 
                className='hyperlink-button-with-image' 
                style={{ '--btn-color': buttonColor } as React.CSSProperties}
                onClick={onClick} 
            >
                <div className="button-content-alignment">
                    {imageId && <img src={convertImageId(imageId)} alt="" />}<br />
                    <div className="button-content-text" style={{ '--text-color': textColor } as React.CSSProperties}>
                        {children}
                    </div>
                </div>
            </button>
        </div>
    );
}