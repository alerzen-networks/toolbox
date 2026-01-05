package main

import (
	"embed"
	"log"
	"net-sentry/database"
	"net-sentry/handlers"
	"net-sentry/monitor"
	"net-sentry/services"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/filesystem"
)

//go:embed frontend/dist/*
var frontendDist embed.FS

func main() {
	database.Connect()
	monitor.StartEngine()

	app := fiber.New()

	app.Use(cors.New())

	api := app.Group("/api")
	api.Get("/status", handlers.GetMonitors)
	api.Post("/monitors", handlers.CreateMonitor)
	api.Delete("/monitors/:id", handlers.DeleteMonitor)
	api.Post("/monitors/:id/check", handlers.TriggerCheck)
	api.Post("/monitors/:id/check", handlers.TriggerCheck)
	api.Post("/monitors/:id/traceroute", handlers.Traceroute)

	// Tools API
	api.Get("/tools/dns", handlers.DNSSimple)
	api.Get("/tools/propagation", handlers.DNSPropagation)
	api.Post("/tools/port-scan", handlers.PortScan)
	api.Get("/tools/mac/:mac", handlers.MacLookup)
	api.Get("/tools/latency", handlers.LatencyCheck)

	// SNMP API
	api.Post("/tools/snmp/get", handlers.SNMPGetHandler)
	api.Post("/tools/snmp/walk", handlers.SNMPWalkHandler)
	api.Get("/tools/snmp/agent-stats", handlers.AgentStatsHandler)

	// Speed Test
	api.Post("/tools/speedtest", handlers.RunSpeedTest)

	// New Tools
	api.Get("/tools/ssl", handlers.SSLCheck)
	api.Get("/tools/whois", handlers.WhoisLookup)
	api.Get("/tools/subnet", handlers.SubnetScan)
	api.Get("/tools/security-grade", handlers.SecurityGrade)
	api.Get("/tools/blacklist", handlers.BlacklistCheck)
	api.Get("/tools/blacklist", handlers.BlacklistCheck)
	api.Get("/tools/dns-propagation", handlers.DNSPropagation)
	api.Get("/tools/zscaler/advanced", handlers.ZscalerAdvanced)

	// Start Services
	services.StartSNMPAgent()

	// Serve Frontend
	app.Use("/", filesystem.New(filesystem.Config{
		Root:       http.FS(frontendDist),
		PathPrefix: "frontend/dist",
		Browse:     false,
	}))

	// Fallback for SPA
	app.Get("/*", func(c *fiber.Ctx) error {
		return c.SendFile("./frontend/dist/index.html")
	})

	log.Fatal(app.Listen(":8081"))
}
