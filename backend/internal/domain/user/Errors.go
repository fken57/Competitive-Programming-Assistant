package user

import "errors"

var (
	ErrUsernameExists     = errors.New("username already exists")
	ErrUserNotFound       = errors.New("user not found")
	ErrSessionNotFound    = errors.New("session not found")
	ErrInvalidCredentials = errors.New("invalid username or password")
	ErrInvalidUsername    = errors.New("username must be between 3 and 50 characters")
	ErrInvalidPassword    = errors.New("password must be between 8 and 72 characters")
)
