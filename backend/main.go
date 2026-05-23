package main

import (
	"net/http"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	//"os"
	"backend/internal/infrastructure/repository"

	_ "github.com/jackc/pgx/v5/stdlib"
	//"github.com/jmoiron/sqlx"

	"backend/internal/usecase/graph"
	"backend/internal/handler"
)

func main() {
	//dsn := os.Getenv("DATABASE_URL")
	//db, err := sqlx.Connect("pgx", dsn)
	//if err != nil {
		//panic(err)
	//}
	//defer db.Close()

	// Initialize your repositories here
	userRepo :=  repository.NewGraphFakeRepository(nil)
	noCostGraphUseCase := graph.NewNoCostGraphUseCase(userRepo)
	noCostGraphHandler := handler.NewNoCostGraphHandler(noCostGraphUseCase)
	e := echo.New()
	e.Use(middleware.CORS()) 

	g:= e.Group("/apis");

	g.POST("/graphs", noCostGraphHandler.MakeNewNoCostUnorderedGraph)


	g.GET("/hello", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World.\n")
	})
    
	e.Logger.Fatal(e.Start("0.0.0.0:8080")) 
}