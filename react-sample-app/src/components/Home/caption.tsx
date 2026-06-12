import React from 'react';
import './caption.css'

export function Caption() {
    return (
        <div className='caption'>
            <div className='caption-alignment'>
                <h1 className='caption-title'>競技プログラミング支援系(CPA)のサイトへようこそ！</h1>
                <p className='caption-description'>競技プログラミング支援系(CPA)はグラフ、配列、文字列標準入力を受け取り、それらの性質を静的に解析するツールです。不変量や特定の規則性を探すのに大きく貢献するのを目標にします。</p>
            </div>
        </div>
    );
}