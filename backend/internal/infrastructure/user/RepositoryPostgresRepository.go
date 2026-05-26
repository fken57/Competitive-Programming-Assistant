package repository

import (
	"github.com/jmoiron/sqlx"
)

type UserPostgresRepository struct {
	db *sqlx.DB
}

func NewUserPostgresRepository(db *sqlx.DB) *UserPostgresRepository {
	return &UserPostgresRepository{db: db}
}
