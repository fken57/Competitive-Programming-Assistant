package repository

import (
	"backend/internal/domain/weightedgraph"
	"backend/internal/domain/weightedgraph/graphdatabase"

	"github.com/jmoiron/sqlx"
)

type CostGraphFakeRepository struct {
	db *sqlx.DB
}

var _ weightedgraph.WeightedGraphRepository = (*CostGraphFakeRepository)(nil)

func NewCostGraphFakeRepository(db *sqlx.DB) *CostGraphFakeRepository {
	return &CostGraphFakeRepository{
		db: db,
	}
}

func (r *CostGraphFakeRepository) SaveWeightedGraph(graph graphdatabase.WeightedGraph) error {
	return nil
}

func (r *CostGraphFakeRepository) GetWeightedGraph(graphID string) (graphdatabase.WeightedGraph, error) {
	var empty graphdatabase.WeightedGraph
	return empty, nil
}
