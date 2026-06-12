import React from 'react';
import {MyButton} from '../common/button/Button'
import './Header.css';


function Header(){
    return (
        <header className='header-container'>
            <div className='header-alignment'>
                <h1 className='header-title'>
                    Competitive Programming Assistant
                </h1>
                <div className='header-button-alignment'>
                    <MyButton 
                        color="black"
                        children="新規登録"
                        onClick={() => console.log('新規登録')}
                    />
                    <MyButton 
                        color="green"
                        children="ログイン"
                        onClick={() => console.log('ログイン')}
                    />
                </div>
            </div>
        </header>
    );
}

export default Header;