package main

import (
	"backend/internal/domain/user"
	"context"
	"log"
	"net/http"
	"os"

	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	graphrepo "backend/internal/infrastructure/unweightedgraph"
	userrepo "backend/internal/infrastructure/user"
	costgraphrepo "backend/internal/infrastructure/weightedgraph"

	_ "github.com/jackc/pgx/v5/stdlib"

	arrayhandler "backend/internal/handler/array"
	randomgenhandler "backend/internal/handler/randomgen"
	graphhandler "backend/internal/handler/unweightedgraph"
	userhandler "backend/internal/handler/user"
	costgraphhandler "backend/internal/handler/weightedgraph"
	arrayusecase "backend/internal/usecase/array"
	randomgenusecase "backend/internal/usecase/randomgen"
	graphusecase "backend/internal/usecase/unweightedgraph"
	userusecase "backend/internal/usecase/userusecase"
	costgraphusecase "backend/internal/usecase/weightedgraph"
)

func main() {
	var userRepository user.UserRepository
	var sessionRepository user.SessionRepository
	var userDB *sqlx.DB
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Print("DATABASE_URL is not set; authentication uses in-memory storage")
		memoryRepository := userrepo.NewMemoryAuthRepository()
		userRepository = memoryRepository
		sessionRepository = memoryRepository
	} else {
		var err error
		userDB, err = sqlx.Connect("pgx", databaseURL)
		if err != nil {
			log.Fatal(err)
		}
		defer userDB.Close()
		if err := userrepo.EnsureAuthSchema(context.Background(), userDB); err != nil {
			log.Fatal(err)
		}
		userRepository = userrepo.NewUserRepository(userDB)
		sessionRepository = userrepo.NewSessionRepository(userDB)
	}

	userUsecase := userusecase.NewUserUsecase(userRepository, sessionRepository)
	userAuthHandler := userhandler.NewUserAuthHandler(
		userUsecase,
		os.Getenv("APP_ENV") == "production",
	)

	noCostGraphRepository := graphrepo.NewGraphFakeRepository(nil)
	noCostGraphUseCase := graphusecase.NewNoCostGraphUseCase(noCostGraphRepository)
	noCostGraphHandler := graphhandler.NewNoCostGraphHandler(noCostGraphUseCase)

	e := echo.New()

	e.Use(middleware.Logger()) // ➔ 誰がどのURLにアクセスして、何番のエラーになったかを全て記録する
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{environmentOrDefault("FRONTEND_ORIGIN", "http://localhost:3000")},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPatch, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		AllowCredentials: true,
	}))

	g := e.Group("/apis")

	g.POST("/graphs/unweighted/unordered", noCostGraphHandler.MakeNewNoCostUnorderedGraph)
	g.POST("/graphs/unweighted/unordered/isbinarytree", noCostGraphHandler.ExecuteIsBinaryTree)
	g.POST("/graphs/unweighted/unordered/istree", noCostGraphHandler.ExecuteIsTree)
	g.POST("/graphs/unweighted/unordered/treedistance", noCostGraphHandler.GetTreeDistance)

	g.POST("/graphs/unweighted/ordered", noCostGraphHandler.MakeNewNoCostOrderedGraph)
	g.POST("/graphs/unweighted/ordered/topologicalsort", noCostGraphHandler.TopologicalSort)
	g.POST("/graphs/unweighted/ordered/scc", noCostGraphHandler.ExecuteSCC)
	g.POST("/graphs/unweighted/BFS", noCostGraphHandler.ExecuteBFS)
	g.POST("/graphs/unweighted/dfs", noCostGraphHandler.ExecuteDFS)
	g.POST("/graphs/unweighted/unordered/connectedcomponents", noCostGraphHandler.GetConnectedComponents)
	g.POST("/graphs/unweighted/ordered/cycle", noCostGraphHandler.DetectDirectedCycle)
	g.POST("/graphs/unweighted/unordered/unionfind", noCostGraphHandler.ExecuteUnionFind)
	g.POST("/graphs/unweighted/unordered/lowlink", noCostGraphHandler.GetLowLink)
	g.POST("/graphs/unweighted/unordered/lca", noCostGraphHandler.GetLCA)
	g.POST("/graphs/unweighted/unordered/analyze", noCostGraphHandler.AnalyzeUnorderedStatic)
	g.POST("/graphs/unweighted/ordered/analyze", noCostGraphHandler.AnalyzeOrderedStatic)

	costGraphRepository := costgraphrepo.NewCostGraphFakeRepository(nil)
	costGraphUseCase := costgraphusecase.NewCostGraphUseCase(costGraphRepository)
	costGraphHandler := costgraphhandler.NewCostGraphHandler(costGraphUseCase)

	g.POST("/graphs/weighted/ordered/dijkstra", costGraphHandler.ExecuteDijkstra)
	g.POST("/graphs/weighted/unordered/prim", costGraphHandler.ExecutePrim)
	g.POST("/graphs/weighted/unordered/treediameter", costGraphHandler.GetTreeDiameter)
	g.POST("/graphs/weighted/unordered/analyze", costGraphHandler.AnalyzeUnorderedStatic)

	arrayUseCase := arrayusecase.NewArrayUseCase()
	arrayHandler := arrayhandler.NewArrayHandler(arrayUseCase)

	g.POST("/array/build_prefix_sum", arrayHandler.BuildPrefixSum)
	g.POST("/array/compress_values", arrayHandler.CompressValues)
	g.POST("/array/count_inversions", arrayHandler.CountInversions)
	g.POST("/array/static_mex", arrayHandler.StaticMex)
	g.POST("/array/run_length_encoding", arrayHandler.RunLengthEncoding)
	g.POST("/array/next_greater_to_right_strict", arrayHandler.NextGreaterToRightStrict)
	g.POST("/array/next_smaller_to_right_strict", arrayHandler.NextSmallerToRightStrict)
	g.POST("/array/longest_distinct_subarray", arrayHandler.LongestDistinctSubarray)
	g.POST("/array/static/analyze", arrayHandler.AnalyzeStatic)

	randomGenUsecase := randomgenusecase.NewRandomGenUsecase()
	randomGenHandler := randomgenhandler.NewRandomGenHandler(randomGenUsecase)
	g.POST("/random-gen/generate", randomGenHandler.Generate)

	g.POST("/users/create", userAuthHandler.Register)

	g.POST("/users/login", userAuthHandler.Login)
	g.POST("/users/logout", userAuthHandler.Logout)
	g.GET("/users/me", userAuthHandler.Me, userAuthHandler.RequireAuth)

	g.GET("/hello", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World.\n")
	})

	e.Logger.Fatal(e.Start("0.0.0.0:8080"))
}

func environmentOrDefault(name, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}
