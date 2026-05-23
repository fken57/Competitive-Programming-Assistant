package repository

import (
	"backend/internal/domain/unweightedgraph"
	"backend/internal/domain/unweightedgraph/graphdatabase"

	"github.com/jmoiron/sqlx"
)

type GraphFakeRepository struct {
	db *sqlx.DB
}

var _ unweightedgraph.UnweightedGraphRepository = (*GraphFakeRepository)(nil)

func NewGraphFakeRepository(db *sqlx.DB) *GraphFakeRepository {
	return &GraphFakeRepository{
		db: db,
	}
}

func (r *GraphFakeRepository) SaveUnweightedGraph(graph graphdatabase.UnweightedGraph) error {
	return nil
}

func (r *GraphFakeRepository) GetUnweightedGraph(graphID string) (graphdatabase.UnweightedGraph, error) {
	var empty graphdatabase.UnweightedGraph
	return empty, nil
}
