import React from 'react';
import { NavigationCardList, NavigationCard } from './NavigationCard';

export function HomepageContentChoose() {
    return (
        <NavigationCardList>
            <NavigationCard
                title="Graph Analyzer"
                description="グラフの性質を静的に解析します。隣接リストの可視化や、連結成分の特定などを行います。"
                imageSrc="https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&q=80&w=600"
                linkTo="/graph"
            />
            <NavigationCard
                title="Array Analyzer"
                description="配列データの不変量や特定の規則性を探します。ソートアルゴリズムのシミュレーション等も予定しています。"
                imageSrc="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=600"
                linkTo="/array" // 仮のリンク
            />
            <NavigationCard
                title="Random Gen"
                description="seedから再現可能な配列・木・グラフのランダム入力と、バグを誘発しやすい特殊ケースを生成します。"
                imageSrc="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600"
                linkTo="/random-gen"
            />
        </NavigationCardList>
    );
}
