import React from 'react';
import { SegmentedControl } from '../common/SegmentedControl';
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
            <WeightChoice hasWeights={hasWeights} setHasWeights={setHasWeights} />
        </div>
    );
}

function GraphTypeChoice({ graphType, setGraphType }: { graphType: string; setGraphType: (value: string) => void }) {
    return (
        <div className='chooseButtonAlignment'>
            <div className="graph-type-select-text">
                グラフの種類を選択してください。
            </div>
            <SegmentedControl
                legend="グラフの種類"
                name="state-tab"
                value={graphType}
                options={[
                    { value: 'undirected', label: '無向' },
                    { value: 'directed', label: '有向' },
                ]}
                onChange={setGraphType}
            />
        </div>
    )
}

function WeightChoice({ hasWeights, setHasWeights }: { hasWeights: boolean; setHasWeights: (value: boolean) => void }) {
    return(
            <div className='chooseWeightAlignment'>
        <div className="graph-type-select-text">
            重みの有無を選択してください。
        </div>
        <SegmentedControl
            legend="重みの有無"
            name="weight-tab"
            value={hasWeights ? 'weighted' : 'unweighted'}
            options={[
                { value: 'unweighted', label: '重みなし' },
                { value: 'weighted', label: '重み付き' },
            ]}
            onChange={(value) => setHasWeights(value === 'weighted')}
        />
    </div>
    )
}
