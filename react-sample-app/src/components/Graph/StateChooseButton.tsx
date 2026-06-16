import React from 'react';
import './StateChooseButton.css';

type StateChooseToggleProps = {
    graphType: string;
    setGraphType: (value: string) => void;
    hasWeights: boolean;
    setHasWeights: (value: boolean) => void;
};

export function StateChooseToggle({ graphType, setGraphType, hasWeights, setHasWeights }: StateChooseToggleProps) {
    return (
        <div className='toggle-alignment'>
            <GraphTypeChoice graphType={graphType} setGraphType={setGraphType} />
            {graphType !== 'functional' && <WeightChoice hasWeights={hasWeights} setHasWeights={setHasWeights} />}
        </div>
    );
}

function GraphTypeChoice({ graphType, setGraphType }: { graphType: string; setGraphType: (value: string) => void }) {
    return (
        <div className='chooseButtonAlignment'>
            <div className="graph-type-select-text">
                グラフの種類を選択してください。
            </div>
            <div className="tab-3">
                <label>
                    <input 
                        type="radio" 
                        name="state-tab" 
                        className="tab-3-group" 
                        checked={graphType === 'undirected'} 
                        onChange={() => setGraphType('undirected')} 
                    />
                    無向
                </label>
                <label>
                    <input 
                        type="radio" 
                        name="state-tab" 
                        className="tab-3-group" 
                        checked={graphType === 'directed'} 
                        onChange={() => setGraphType('directed')} 
                    />
                    有向
                </label>
                <label>
                    <input 
                        type="radio" 
                        name="state-tab" 
                        className="tab-3-group" 
                        checked={graphType === 'functional'} 
                        onChange={() => setGraphType('functional')} 
                    />
                    Functional
                </label>
            </div>
        </div>
    )
}

function WeightChoice({ hasWeights, setHasWeights }: { hasWeights: boolean; setHasWeights: (value: boolean) => void }) {
    return(
            <div className='chooseWeightAlignment'>
        <div className="graph-type-select-text">
            重みの有無を選択してください。
        </div>
        <div className="tab-3">
            <label>
                <input 
                    type="radio" 
                    name="weight-tab" 
                    className="tab-3-group" 
                    checked={!hasWeights} 
                    onChange={() => setHasWeights(false)} 
                />
                重みなし
            </label>
            <label>
                <input 
                    type="radio" 
                    name="weight-tab" 
                    className="tab-3-group" 
                    checked={hasWeights} 
                    onChange={() => setHasWeights(true)} 
                />
                重み付き
            </label>
        </div>
    </div>
    )
}