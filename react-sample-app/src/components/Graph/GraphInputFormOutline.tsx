import React, { useRef } from 'react';
import { MyButton } from '../common/button/Button';
import { useNavigate } from 'react-router-dom';
import { StateChooseToggle } from './StateChooseButton';
import { parseGraphToAdjacencyList, parseWeightedGraphToAdjacencyList } from '../../util/graphUtils';
import { useUnweightedGraphApi } from '../../hooks/Graph/useUnweightedGraphApi';
import { GRAPH_ENDPOINTS } from '../../util/NoCostGraphSendApis';
import { useState } from 'react';

type GraphInputFormOutlineProps = {
    graphType: string;
    setGraphType: (value: string) => void;
    hasWeights: boolean;
    setHasWeights: (value: boolean) => void;
    setAdjacentList: (value: number[][]) => void;
    setIsDataLoaded: (value: boolean) => void;
};

export function GraphInputFormOutline({ graphType, setGraphType, hasWeights, setHasWeights, setAdjacentList, setIsDataLoaded }: GraphInputFormOutlineProps) {
    const navigate = useNavigate();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    

    const { postGraphData, loading, error, data } = useUnweightedGraphApi();

    const handleSubmit = async () => {
        const textarea = textareaRef.current;
        if (!textarea || !textarea.value.trim()) return;

        if (!hasWeights) {
            const runtimeAdjacencyList = parseGraphToAdjacencyList(textarea.value, graphType === 'directed');
            setAdjacentList(runtimeAdjacencyList);
            setIsDataLoaded(true);
        } else {
            const weightedAdjacencyList = parseWeightedGraphToAdjacencyList(textarea.value, graphType === 'directed');
            // 重み付きグラフ用の処理をここに記述します
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
                    placeholder="入力してください"
                    ref={textareaRef}
                />
            </div>
            
            <div className="form-outline-button-area">
                {/* isLoading の代わりに loading を使用して判定します */}
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