import React, { useState } from 'react';
import { MyButton } from '../common/button/Button';
import { StateChooseToggle } from './StateChooseButton';
import { parseGraphAllData } from '../../util/graphUtils';
import { VisualGraphData, WeightedAdjacencyListItem } from '../../util/graphUtils';
import './GraphInputFormOutline.css';
import { InputSourceMode, InputSourceToggle } from '../common/InputSourceToggle';
import { TextFileInput } from '../common/TextFileInput';

type GraphInputFormOutlineProps = {
    graphType: string;
    setGraphType: (value: string) => void;
    hasWeights: boolean;
    setHasWeights: (value: boolean) => void;
    setAdjacentList: (value: number[][] | WeightedAdjacencyListItem[][]) => void;
    setVisualGraphData: (value: VisualGraphData | null) => void;
    setIsDataLoaded: (value: boolean) => void;
    setErrorMessage: (msg: string) => void;
    onGraphSubmitted: () => void;
};

export function GraphInputFormOutline({ 
    graphType, setGraphType, hasWeights, setHasWeights, setAdjacentList, setVisualGraphData, setIsDataLoaded, setErrorMessage, onGraphSubmitted
}: GraphInputFormOutlineProps) {
    const [input, setInput] = useState('');
    const [sourceMode, setSourceMode] = useState<InputSourceMode>('manual');

    const clearLoadedGraph = () => {
        setAdjacentList([]);
        setVisualGraphData(null);
        setIsDataLoaded(false);
        setErrorMessage('');
        onGraphSubmitted();
    };

    const handleSourceModeChange = (mode: InputSourceMode) => {
        if (mode === sourceMode) return;
        setSourceMode(mode);
        setInput('');
        clearLoadedGraph();
    };

    const handleSubmit = async () => {
        if (!input.trim()) {
            setErrorMessage("入力が空です。");
            setAdjacentList([]);
            setVisualGraphData(null);
            setIsDataLoaded(false);
            return;
        }

        try {
            setErrorMessage(""); // Clear previous errors
            
            const { adjList, visualData } = parseGraphAllData(input, graphType === 'directed', hasWeights);
            setAdjacentList(adjList);
            setVisualGraphData(visualData);
            setIsDataLoaded(true);
            onGraphSubmitted();
        } catch (e: any) {
            setErrorMessage(e.message || "パースエラーが発生しました。");
            setAdjacentList([]);
            setVisualGraphData(null);
            setIsDataLoaded(false);
        }
    };

    return (    
        <div className="form-outline">
            <div className="form-outline-text-area">
                <p className="form-outline-text">こちらにグラフの入力(1-indexed)を入力してください。</p>
            </div>
            <InputSourceToggle mode={sourceMode} onChange={handleSourceModeChange} />
            
            <div className="form-outline-input-area">
                {sourceMode === 'manual' ? (
                    <textarea
                        className="form-outline-textarea"
                        aria-label="グラフの標準入力"
                        placeholder={'N M\nu1 v1\n...'}
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                    />
                ) : (
                    <TextFileInput onTextLoaded={setInput} onError={setErrorMessage} />
                )}
            </div>
            
            <div className="form-outline-button-area">
                <MyButton
                    color="green"
                    onClick={handleSubmit}
                >
                    送信
                </MyButton>
            </div>
            
            <StateChooseToggle 
                graphType={graphType} 
                setGraphType={setGraphType} 
                hasWeights={hasWeights} 
                setHasWeights={setHasWeights} 
            />

        </div>
    );
}
