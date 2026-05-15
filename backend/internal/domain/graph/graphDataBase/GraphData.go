package graphDataBase

import()

type Node struct{
	ID int `json:"id" db:"id"`
	Label string `json:"label" db:"label"`
	Metadata map[string]interface{} `json:"metadata,omitempty" db:"metadata"`
}

type Edge struct{
	To int `json:"to" db:"to"`
	Cost int `json:"cost" db:"cost"`
	Label string `json:"label" db:"label"`
	Metadata map[string]interface{} `json:"metadata,omitempty" db:"metadata"`
}

type InputEdge struct{
	From int `json:"from" db:"from"`
	To int `json:"to" db:"to"`
	Cost int `json:"cost" db:"cost"`
}

type Graph struct{
	IsDirectional bool `json:"isDirectional" db:"isDirectional"`
	NodeSize int `json:"nodeSize" db:"nodeSize"`
	EdgeSize int `json:"edgeSize" db:"edgeSize"`
	Nodes []Node `json:"nodes" db:"nodes"`
	Edges [][]Edge `json:"edges" db:"edges"`
}

func NewGraph(nodeSize int, edgeSize int,inputEdges []InputEdge,isDirectional bool) *Graph {
	return &Graph{
		IsDirectional: isDirectional,
		NodeSize: nodeSize,
		EdgeSize: edgeSize,
	}
}

func (g *Graph) AddEdge(inputEdges []InputEdge) {
	for _, inputEdge := range inputEdges {
		if len(g.Edges) <= inputEdge.From {
			newEdges := make([][]Edge, inputEdge.From+1)
			copy(newEdges, g.Edges)
			g.Edges = newEdges
		}

		edge := Edge{
			To: inputEdge.To,
			Cost: inputEdge.Cost,
			Label: "",
			Metadata: nil,
		}
		g.Edges[inputEdge.From] = append(g.Edges[inputEdge.From], edge)
	}
}