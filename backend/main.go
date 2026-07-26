package main

import (
	randomgendomain "backend/internal/domain/randomgen"
	"backend/internal/domain/user"
	"context"
	"errors"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	randomgenrepo "backend/internal/infrastructure/randomgen"
	graphrepo "backend/internal/infrastructure/unweightedgraph"
	userrepo "backend/internal/infrastructure/user"
	costgraphrepo "backend/internal/infrastructure/weightedgraph"

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
	config, err := loadConfig()
	if err != nil {
		log.Fatal(err)
	}
	appContext, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	var userRepository user.UserRepository
	var sessionRepository user.SessionRepository
	var userDB *sqlx.DB
	userDB, err = openDatabase(config)
	if err != nil {
		log.Fatal(err)
	}
	if userDB == nil {
		log.Print("MariaDB is not configured; authentication uses in-memory storage")
		memoryRepository := userrepo.NewMemoryAuthRepository()
		userRepository = memoryRepository
		sessionRepository = memoryRepository
	} else {
		defer userDB.Close()
		userDB.SetMaxOpenConns(10)
		userDB.SetMaxIdleConns(5)
		userDB.SetConnMaxLifetime(30 * time.Minute)
		if err := runMigrations(context.Background(), userDB); err != nil {
			log.Fatal(err)
		}
		userRepository = userrepo.NewUserRepository(userDB)
		sessionRepository = userrepo.NewSessionRepository(userDB)
	}

	userUsecase := userusecase.NewUserUsecase(userRepository, sessionRepository)
	userAuthHandler := userhandler.NewUserAuthHandler(
		userUsecase,
		config.AppEnvironment == productionEnvironment,
	)

	noCostGraphRepository := graphrepo.NewGraphFakeRepository(nil)
	noCostGraphUseCase := graphusecase.NewNoCostGraphUseCase(noCostGraphRepository)
	noCostGraphHandler := graphhandler.NewNoCostGraphHandler(noCostGraphUseCase)

	e := echo.New()
	e.Debug = config.Debug
	e.HideBanner = config.AppEnvironment == productionEnvironment

	e.Use(middleware.Logger()) // ➔ 誰がどのURLにアクセスして、何番のエラーになったかを全て記録する
	e.Use(middleware.Recover())
	e.Use(middleware.BodyLimit("12M"))
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{config.FrontendOrigin},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPatch, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		AllowCredentials: true,
	}))

	e.GET("/healthz", healthHandler(userDB))

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
	g.POST("/array/static_range_sum_query", arrayHandler.StaticRangeSumQuery)
	g.POST("/array/count_subarrays_sum_equal_k", arrayHandler.CountSubarraysSumEqualK)
	g.POST("/array/count_subarrays_sum_mod_equal_r", arrayHandler.CountSubarraysSumModEqualR)
	g.POST("/array/fixed_window_minimum", arrayHandler.FixedWindowMinimum)
	g.POST("/array/fixed_window_maximum", arrayHandler.FixedWindowMaximum)
	g.POST("/array/count_pairs_sum_at_most_k_after_sort", arrayHandler.CountPairsSumAtMostKAfterSort)
	g.POST("/array/count_pairs_abs_diff_at_most_k_after_sort", arrayHandler.CountPairsAbsDiffAtMostKAfterSort)
	g.POST("/array/static/analyze", arrayHandler.AnalyzeStatic)

	var savedCaseRepository randomgendomain.SavedCaseRepository
	if userDB == nil {
		savedCaseRepository = randomgenrepo.NewMemorySavedCaseRepository()
	} else {
		savedCaseRepository = randomgenrepo.NewMariaDBSavedCaseRepository(userDB)
	}
	startCleanupLoop(appContext, sessionRepository, savedCaseRepository)
	randomGenUsecase := randomgenusecase.NewRandomGenUsecase(savedCaseRepository)
	randomGenHandler := randomgenhandler.NewRandomGenHandler(randomGenUsecase)
	g.POST("/random-gen/generate", randomGenHandler.Generate)
	g.POST("/random-gen/history", randomGenHandler.SaveHistory, userAuthHandler.RequireAuth)
	g.GET("/random-gen/history", randomGenHandler.ListHistory, userAuthHandler.RequireAuth)
	g.DELETE("/random-gen/history/:id", randomGenHandler.DeleteHistory, userAuthHandler.RequireAuth)
	g.POST("/random-gen/killed-cases", randomGenHandler.SaveKilledCase, userAuthHandler.RequireAuth)
	g.GET("/random-gen/killed-cases", randomGenHandler.ListKilledCases, userAuthHandler.RequireAuth)
	g.DELETE("/random-gen/killed-cases/:id", randomGenHandler.DeleteKilledCase, userAuthHandler.RequireAuth)
	g.POST("/random-gen/presets", randomGenHandler.SavePreset, userAuthHandler.RequireAuth)
	g.GET("/random-gen/presets", randomGenHandler.ListPresets, userAuthHandler.RequireAuth)

	g.POST("/users/create", userAuthHandler.Register)

	g.POST("/users/login", userAuthHandler.Login)
	g.POST("/users/logout", userAuthHandler.Logout)
	g.GET("/users/me", userAuthHandler.Me, userAuthHandler.RequireAuth)

	g.GET("/hello", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World.\n")
	})

	registerStaticFrontend(e, config.StaticDir)

	serverErrors := make(chan error, 1)
	go func() {
		serverErrors <- e.Start("0.0.0.0:" + config.Port)
	}()

	select {
	case serverError := <-serverErrors:
		if serverError != nil && !errors.Is(serverError, http.ErrServerClosed) {
			log.Fatal(serverError)
		}
	case <-appContext.Done():
		shutdownContext, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := e.Shutdown(shutdownContext); err != nil {
			log.Printf("graceful shutdown failed: %v", err)
		}
	}
}
