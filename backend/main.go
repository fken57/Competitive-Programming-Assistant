package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	_ "github.com/lib/pq"

	//"os"
	graphrepo "backend/internal/infrastructure/unweightedgraph"
	userrepo "backend/internal/infrastructure/user"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"

	graphhandler "backend/internal/handler/unweightedgraph"
	userhandler "backend/internal/handler/user"
	graphusecase "backend/internal/usecase/unweightedgraph"
	userusecase "backend/internal/usecase/userusecase"
)

func main() {
	dsn := "host=127.0.0.1 port=5432 user=ken57 password=post1810 dbname=authdb sslmode=disable"
	userDB, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		panic(err)
	}
	defer userDB.Close()

	const initUserSQL = `CREATE TABLE IF NOT EXISTS users (
		id VARCHAR(36) PRIMARY KEY,
		username VARCHAR(255) UNIQUE NOT NULL,
		password_hash VARCHAR(255) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`

	_, err = userDB.Exec(initUserSQL)
	if err != nil {
		panic(err)
	}

	userRepo := userrepo.NewUserRepository(userDB)
	userUsecase := userusecase.NewUserUsecase(userRepo)
	userAuthHandler := userhandler.NewUserAuthHandler(userUsecase)

	noCostGraphRepository := graphrepo.NewGraphFakeRepository(nil)
	noCostGraphUseCase := graphusecase.NewNoCostGraphUseCase(noCostGraphRepository)
	noCostGraphHandler := graphhandler.NewNoCostGraphHandler(noCostGraphUseCase)

	e := echo.New()

	e.Use(middleware.Logger()) // ➔ 誰がどのURLにアクセスして、何番のエラーになったかを全て記録する
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	g := e.Group("/apis")

	g.POST("/graphs/unweighted/unordered", noCostGraphHandler.MakeNewNoCostUnorderedGraph)
	g.POST("/graphs/unweighted/ordered", noCostGraphHandler.MakeNewNoCostOrderedGraph)
	
	g.POST("/graphs/unweighted/BFS", noCostGraphHandler.ExecuteBFS)

	g.POST("/users/create", userAuthHandler.Register)

	g.POST("/users/login", userAuthHandler.Login)

	g.GET("/hello", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World.\n")
	})

	e.Logger.Fatal(e.Start("0.0.0.0:8080"))
}
