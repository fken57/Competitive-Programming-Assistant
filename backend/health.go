package main

import (
	"context"
	"net/http"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo/v4"
)

func healthHandler(db *sqlx.DB) echo.HandlerFunc {
	return func(requestContext echo.Context) error {
		response := map[string]string{"status": "ok", "database": "disabled"}
		if db == nil {
			return requestContext.JSON(http.StatusOK, response)
		}

		pingContext, cancel := context.WithTimeout(requestContext.Request().Context(), 2*time.Second)
		defer cancel()
		if err := db.PingContext(pingContext); err != nil {
			return requestContext.JSON(http.StatusServiceUnavailable, map[string]string{
				"status":   "unavailable",
				"database": "disconnected",
			})
		}

		response["database"] = "connected"
		return requestContext.JSON(http.StatusOK, response)
	}
}
