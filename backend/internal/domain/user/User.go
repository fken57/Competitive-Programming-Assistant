package user

import (
	"time"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	iD           int       `db:"id" `
	name         string    `db:"name"`
	passwordHash string    `db:"password" `
	createdAt    time.Time `db:"created_at"`
}

func NewUser(id int, name string, passwordHash string, createdAt time.Time) *User {
	return &User{
		iD:           id,
		name:         name,
		passwordHash: passwordHash,
		createdAt:    createdAt,
	}
}

func (u *User) GetID() int {
	return u.iD
}

func (u *User) GetName() string {
	return u.name
}

func (u *User) GetCreatedAt() time.Time {
	return u.createdAt
}

func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.passwordHash), []byte(password))
	return err == nil
}
