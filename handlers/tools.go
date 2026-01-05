package handlers

import (
	"net-sentry/tools"

	"github.com/gofiber/fiber/v2"
)

func DNSSimple(c *fiber.Ctx) error {
	domain := c.Query("domain")
	if domain == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Domain required"})
	}
	results, err := tools.LookupDomain(domain)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(results)
}

func MacLookup(c *fiber.Ctx) error {
	mac := c.Params("mac")
	vendor, err := tools.LookupVendor(mac)
	if err != nil {
		return c.JSON(fiber.Map{"mac": mac, "error": err.Error()})
	}
	return c.JSON(fiber.Map{"mac": mac, "vendor": vendor})
}

func LatencyCheck(c *fiber.Ctx) error {
	results := tools.MeasureLatency()
	return c.JSON(results)
}

func RunSpeedTest(c *fiber.Ctx) error {
	res := tools.RunSpeedTest()
	return c.JSON(res)
}

func SSLCheck(c *fiber.Ctx) error {
	domain := c.Query("domain")
	if domain == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Domain required"})
	}
	res := tools.CheckSSL(domain)
	return c.JSON(res)
}

func WhoisLookup(c *fiber.Ctx) error {
	domain := c.Query("domain")
	if domain == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Domain required"})
	}
	res := tools.LookupWhois(domain)
	return c.JSON(res)
}

func SubnetScan(c *fiber.Ctx) error {
	cidr := c.Query("cidr")
	if cidr == "" {
		return c.Status(400).JSON(fiber.Map{"error": "CIDR required"})
	}
	res, err := tools.ScanSubnet(cidr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(res)
}

func SecurityGrade(c *fiber.Ctx) error {
	url := c.Query("url")
	if url == "" {
		return c.Status(400).JSON(fiber.Map{"error": "URL required"})
	}
	res := tools.GradeSecurity(url)
	return c.JSON(res)
}

func BlacklistCheck(c *fiber.Ctx) error {
	host := c.Query("host")
	if host == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Host required"})
	}
	res, err := tools.CheckBlacklist(host)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(res)
}

func DNSPropagation(c *fiber.Ctx) error {
	domain := c.Query("domain")
	if domain == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Domain required"})
	}
	res := tools.CheckPropagation(domain)
	return c.JSON(res)
}

func PortScan(c *fiber.Ctx) error {
	type Request struct {
		Host  string `json:"host"`
		Ports []int  `json:"ports"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if req.Host == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Host required"})
	}
	res := tools.ScanPorts(req.Host, req.Ports)
	return c.JSON(res)
}
