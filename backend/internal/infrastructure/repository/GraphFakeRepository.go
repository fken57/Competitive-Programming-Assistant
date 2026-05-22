package repository

import (
	"backend/internal/domain/graph"
	"github.com/jmoiron/sqlx"
)

type GraphFakeRepository struct {
	db *sqlx.DB
}

var _ graph.GraphRepository = (*GraphFakeRepository)(nil)

func NewGraphFakeRepository(db *sqlx.DB) *GraphFakeRepository {
	return &GraphFakeRepository{
		db: db,
	}
}

func (r *GraphFakeRepository) GetVertices() []int {
	return []int{}
}

func (r *GraphFakeRepository) GetNeighbors(vertex int) []int {
	return []int{}
}