import React, { useRef, useState } from 'react';
import { MyButton } from '../common/button/Button';
import { useNavigate } from 'react-router-dom';
import { StateChooseToggle } from './StateChooseButton';
import { parseGraphAllData } from '../../util/graphUtils';
import { VisualGraphData } from '../../util/graphUtils';
import { useUnweightedGraphApi } from '../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../util/NoCostGraphSendApis';
import './GraphInputFormOutline.css';

type GraphInputFormOutlineProps = {
    graphType: string;
    setGraphType: (value: string) => void;
    hasWeights: boolean;
    setHasWeights: (value: boolean) => void;
    setAdjacentList: (value: any[]) => void;
    setVisualGraphData: (value: VisualGraphData) => void;
    setIsDataLoaded: (value: boolean) => void;
    setErrorMessage: (msg: string) => void;
};

export function GraphInputFormOutline({ 
    graphType, setGraphType, hasWeights, setHasWeights, setAdjacentList, setVisualGraphData, setIsDataLoaded, setErrorMessage 
}: GraphInputFormOutlineProps) {
    const navigate = useNavigate();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const { postGraphData, loading, error, data } = useUnweightedGraphApi();

    const handleSubmit = async () => {
        const textarea = textareaRef.current;
        if (!textarea || !textarea.value.trim()) {
            setErrorMessage("入力が空です。");
            setIsDataLoaded(false);
            return;
        }

        try {
            setErrorMessage(""); // Clear previous errors
            
            const { adjList, visualData } = parseGraphAllData(textarea.value, graphType === 'directed', hasWeights);
            setAdjacentList(adjList);
            setVisualGraphData(visualData);
            setIsDataLoaded(true);
        } catch (e: any) {
            setErrorMessage(e.message || "パースエラーが発生しました。");
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
                    {loading ? "送信中..." : "送信"}
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