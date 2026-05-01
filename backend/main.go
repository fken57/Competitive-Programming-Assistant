package main

import (
	"net/http"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	//"github.com/jmoiron/sqlx"
    _ //"github.com/lib/pq"
)

func main() {
	e := echo.New()
	e.Use(middleware.CORS())

	e.GET("/hello", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World.\n")
	})
    
	e.Logger.Fatal(e.Start(":8080")) 
}