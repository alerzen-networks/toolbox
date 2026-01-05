package handlers

import (
	"net-sentry/tools"

	"github.com/gofiber/fiber/v2"
)

func ZscalerAdvanced(c *fiber.Ctx) error {
	// 1. Process Check
	procs, err := tools.CheckZscalerProcesses()
	if err != nil {
		procs = []tools.ZscalerProcess{} // non-fatal
	}

	// 2. Info & Proxy Check
	info, _ := tools.GetZscalerInfo()

	// 3. ZDX Score
	// Use proxy IP (info.ProxyIP) for latency check if available, otherwise client public IP/gateway
	score := tools.CalculateZDXScore(info.ProxyIP)

	// 4. SSL Check
	ssl := tools.CheckSSLInspection()

	return c.JSON(fiber.Map{
		"processes": procs,
		"info":      info,
		"zdx":       score,
		"ssl":       ssl,
	})
}
