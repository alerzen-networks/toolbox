package handlers

import (
	"net-sentry/database"
	"net-sentry/models"
	monitorPkg "net-sentry/monitor"
	"os/exec"

	"github.com/gofiber/fiber/v2"
)

func GetMonitors(c *fiber.Ctx) error {
	var monitors []models.Monitor
	if err := database.DB.Find(&monitors).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch monitors"})
	}

	// Fetch last 20 checks for each monitor
	for i := range monitors {
		var checks []models.Check
		database.DB.Where("monitor_id = ?", monitors[i].ID).Order("created_at desc").Limit(20).Find(&checks)
		monitors[i].Checks = checks
		if len(checks) > 0 {
			monitors[i].LastCheck = &checks[0]
		}
	}

	return c.JSON(monitors)
}

func CreateMonitor(c *fiber.Ctx) error {
	var input models.Monitor
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	if err := database.DB.Create(&input).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create monitor"})
	}

	return c.JSON(input)
}

func DeleteMonitor(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := database.DB.Delete(&models.Monitor{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete monitor"})
	}
	// Also delete associated checks
	database.DB.Where("monitor_id = ?", id).Delete(&models.Check{})
	return c.SendStatus(204)
}

func TriggerCheck(c *fiber.Ctx) error {
	id := c.Params("id")
	var monitor models.Monitor
	if err := database.DB.First(&monitor, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Monitor not found"})
	}

	go monitorPkg.CheckMonitor(monitor)

	return c.JSON(fiber.Map{"message": "Check triggered"})
}

func Traceroute(c *fiber.Ctx) error {
	id := c.Params("id")
	var monitor models.Monitor
	if err := database.DB.First(&monitor, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Monitor not found"})
	}

	// Run Traceroute (Windows: tracert, Linux/Mac: traceroute)
	// We assume Windows because user is on Windows
	cmd := exec.Command("tracert", "-d", "-h", "15", "-w", "500", monitor.URL)
	out, err := cmd.CombinedOutput()

	if err != nil {
		return c.JSON(fiber.Map{"output": string(out), "error": err.Error()})
	}

	return c.JSON(fiber.Map{"output": string(out)})
}
