package handlers

import (
	"net-sentry/services"
	"net-sentry/tools"

	"github.com/gofiber/fiber/v2"
)

func SNMPGetHandler(c *fiber.Ctx) error {
	type Request struct {
		Target    string `json:"target"`
		Community string `json:"community"`
		OID       string `json:"oid"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	results, err := tools.SNMPGet(req.Target, req.Community, req.OID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(results)
}

func SNMPWalkHandler(c *fiber.Ctx) error {
	type Request struct {
		Target    string `json:"target"`
		Community string `json:"community"`
		OID       string `json:"oid"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil { // Copy paste error fix: was &req
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	// Default to public if empty? No, let user specify.
	if req.Community == "" {
		req.Community = "public"
	}

	results, err := tools.SNMPWalk(req.Target, req.Community, req.OID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(results)
}

func AgentStatsHandler(c *fiber.Ctx) error {
	stats := services.GetAgentStats()
	return c.JSON(stats)
}
