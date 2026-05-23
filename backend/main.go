package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	//"os"
	"backend/internal/infrastructure/repository"

	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"

	"backend/internal/handler"
	"backend/internal/usecase/graph"
	"backend/internal/usecase/userusecase"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	userDB, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		panic(err)
	}
	defer userDB.Close()

	const initUserSQL = `CREATE TABLE IF NOT EXISTS users (
		id VARCHAR(36) PRIMARY KEY,
		username VARCHAR(255) UNIQUE NOT NULL,
		passwordHash VARCHAR(255) NOT NULL,
		createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`

	_, err = userDB.Exec(initUserSQL)
	if err != nil {
		panic(err)
	}

	var graphDB *sqlx.DB = nil;

	userRepo := repository.NewUserRepository(userDB)
	userUsecase := userusecase.NewUserUsecase(userRepo)
	userAuthHandler := handler.NewUserAuthHandler(userUsecase)

	noCostGraphRepository := repository.GraphFakeRepository(graphDB)
	noCostGraphUseCase := graph.NewNoCostGraphUseCase(noCostGraphRepository)
	noCostGraphHandler := handler.NewNoCostGraphHandler(noCostGraphUseCase)
	e := echo.New()
	e.Use(middleware.CORS())

	g := e.Group("/apis")

	g.POST("/graphs", noCostGraphHandler.MakeNewNoCostUnorderedGraph)

	g

	g.GET("/hello", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World.\n")
	})

	e.Logger.Fatal(e.Start("0.0.0.0:8080"))
}
