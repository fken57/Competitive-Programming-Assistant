import React, { useRef } from 'react';
import { MyButton } from '../common/button/Button';
import { StateChooseToggle } from './StateChooseButton';
import { parseGraphAllData } from '../../util/graphUtils';
import { VisualGraphData, WeightedAdjacencyListItem } from '../../util/graphUtils';
import './GraphInputFormOutline.css';

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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = async () => {
        const textarea = textareaRef.current;
        if (!textarea || !textarea.value.trim()) {
            setErrorMessage("入力が空です。");
            setAdjacentList([]);
            setVisualGraphData(null);
            setIsDataLoaded(false);
            return;
        }

        try {
            setErrorMessage(""); // Clear previous errors
            
            const { adjList, visualData } = parseGraphAllData(textarea.value, graphType === 'directed', hasWeights);
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
            
            <div className="form-outline-input-area">
                <textarea 
                    className="form-outline-textarea" 
                    placeholder="N M&#10;u1 v1&#10;..."
                    ref={textareaRef}
                />
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
