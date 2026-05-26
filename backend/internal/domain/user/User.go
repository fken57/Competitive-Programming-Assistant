package user

import (
	"time"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	id           string       `db:"id" `
	name         string    `db:"username"`
	passwordHash string    `db:"password_hash" `
	createdAt    time.Time `db:"created_at"`
}

func NewUser(name string, passwordHash string, createdAt time.Time) *User {
	return &User{
		id:           uuid.New().String(),
		name:         name,
		passwordHash: passwordHash,
		createdAt:    createdAt,
	}
}

func (u *User) GetID() string {
	return u.id
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

type UserPlainSnapshot struct {
	ID           string `db:"id"`
	Username     string `db:"username"`
	PasswordHash string `db:"password_hash"`
	CreatedAt    time.Time `db:"created_at"`
}

// ToSnapshot: インフラ層（DB保存）のためだけに、内部データを1枚のプレーンな写真（構造体）にして書き出す
func (u *User) ToSnapshot() UserPlainSnapshot {
	return UserPlainSnapshot{
		ID:           u.id,
		Username:     u.name,
		PasswordHash: u.passwordHash, // 自分の内部からなら、小文字フィールドにアクセス可能！
		CreatedAt:    u.createdAt,
	}
}

//FromSnapshot: プレーンな写真（構造体）から、内部データを復元する
func FromSnapshot(snap UserPlainSnapshot) *User {
	id := snap.ID
	return &User{
		id:           id,
		name:         snap.Username,
		passwordHash: snap.PasswordHash,
		createdAt:    snap.CreatedAt,
	}
}
