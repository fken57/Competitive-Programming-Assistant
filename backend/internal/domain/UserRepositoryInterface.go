package domain 

import(
	"context"
)

type UserRepository interface {
	GetUserByID(ctx context.Context, id int) (*User, error)
	CreateUser(ctx context.Context, user *User) error
	UpdateUser(ctx context.Context, user *User) error
	DeleteUser(ctx context.Context, id int) error
}