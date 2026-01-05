package tools

import (
	"crypto/tls"
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"
)

type SecurityReport struct {
	URL        string            `json:"url"`
	Score      int               `json:"score"` // 0-100
	Grade      string            `json:"grade"` // A-F
	Checks     []SecurityCheck   `json:"checks"`
	Reputation BlacklistCheck    `json:"reputation"`
	Headers    map[string]string `json:"headers"`
}

type SecurityCheck struct {
	Name         string `json:"name"`
	Passed       bool   `json:"passed"`
	ScorePenalty int    `json:"score_penalty"`
	Description  string `json:"description"` // Simple language
	Remediation  string `json:"remediation"` // How to fix
	Severity     string `json:"severity"`    // High, Medium, Low
}

func GradeSecurity(targetURL string) SecurityReport {
	if !strings.HasPrefix(targetURL, "http") {
		targetURL = "https://" + targetURL
	}

	report := SecurityReport{
		URL:     targetURL,
		Score:   100,
		Checks:  []SecurityCheck{},
		Headers: make(map[string]string),
	}

	// 1. Check Reputation (Cisco Talos/SpamCop proxy)
	// Extract Host for blacklist check
	host := targetURL
	if strings.Contains(host, "://") {
		parts := strings.Split(host, "/")
		if len(parts) > 2 {
			host = parts[2]
		}
	}
	// Strip port
	if h, _, err := net.SplitHostPort(host); err == nil {
		host = h
	}

	// Run Blacklist Check
	blacklistRes, _ := CheckBlacklist(host)
	report.Reputation = blacklistRes

	if blacklistRes.ListedIn > 0 {
		report.Checks = append(report.Checks, SecurityCheck{
			Name:         "IP Reputation",
			Passed:       false,
			ScorePenalty: 30,
			Description:  "Your server IP is listed on global blocklists (Talos/SpamCop/Spamhaus). This means emails may bounce and users may be warned.",
			Remediation:  "Contact the blacklist provider (e.g. Spamhaus) to request removal. Check for malware or spam sending scripts on your server.",
			Severity:     "Critical",
		})
		report.Score -= 30
	} else {
		report.Checks = append(report.Checks, SecurityCheck{
			Name:        "IP Reputation",
			Passed:      true,
			Description: "Your server IP has a clean reputation on major global threat lists.",
			Severity:    "Critical",
		})
	}

	// HTTP Request
	client := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	resp, err := client.Get(targetURL)
	if err != nil {
		report.Score = 0
		report.Grade = "F"
		report.Checks = append(report.Checks, SecurityCheck{
			Name:        "Connectivity Check",
			Passed:      false,
			Description: "Could not connect to the website.",
			Remediation: fmt.Sprintf("Verify the URL and server status. Error: %v", err),
			Severity:    "Critical",
		})
		return report
	}
	defer resp.Body.Close()

	for k, v := range resp.Header {
		report.Headers[k] = strings.Join(v, ", ")
	}

	// 2. HTTPS & TLS
	if resp.TLS != nil {
		desc := "Connection is encrypted."
		if resp.TLS.Version < tls.VersionTLS12 {
			report.Checks = append(report.Checks, SecurityCheck{
				Name:         "SSL/TLS Protocol",
				Passed:       false,
				ScorePenalty: 20,
				Description:  "You are using an obsolete version of encryption (TLS 1.0/1.1) which has known security flaws.",
				Remediation:  "Update your web server configuration (Nginx/Apache) to disable TLS 1.0 and 1.1. Enable TLS 1.2 and 1.3.",
				Severity:     "High",
			})
			report.Score -= 20
		} else {
			if resp.TLS.Version == tls.VersionTLS13 {
				desc += " Using modern TLS 1.3."
			}
			report.Checks = append(report.Checks, SecurityCheck{
				Name:        "SSL/TLS Protocol",
				Passed:      true,
				Description: desc,
				Severity:    "High",
			})
		}
	} else {
		report.Checks = append(report.Checks, SecurityCheck{
			Name:         "HTTPS Encryption",
			Passed:       false,
			ScorePenalty: 40,
			Description:  "Your site is loading over HTTP. Passwords and data can be stolen by anyone on the network.",
			Remediation:  "Install an SSL Certificate (use Let's Encrypt for free) and force redirect all traffic to HTTPS.",
			Severity:     "Critical",
		})
		report.Score -= 40
	}

	// 3. Security Headers
	checkHeader(resp, &report, "Strict-Transport-Security", 20, "High",
		"Ensures browsers ONLY connect via HTTPS, preventing downgrade attacks.",
		"Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains' to your server headers.")

	checkHeader(resp, &report, "Content-Security-Policy", 15, "High",
		"Prevents hackers from running malicious scripts (XSS) on your site.",
		"Add 'Content-Security-Policy' header. Start with 'default-src 'self'' and expand as needed.")

	checkHeader(resp, &report, "X-Frame-Options", 10, "Medium",
		"Prevents your site from being put in a frame (Clickjacking).",
		"Add 'X-Frame-Options: DENY' or 'SAMEORIGIN' to your headers.")

	checkHeader(resp, &report, "X-Content-Type-Options", 10, "Medium",
		"Prevents browser from guessing file types (MIME Sniffing).",
		"Add 'X-Content-Type-Options: nosniff'.")

	// 4. Info Leakage
	if server := resp.Header.Get("Server"); server != "" {
		if strings.Contains(server, "/") {
			report.Checks = append(report.Checks, SecurityCheck{
				Name:         "Server Info Leakage",
				Passed:       false,
				ScorePenalty: 5,
				Description:  fmt.Sprintf("Your server is revealing its exact version (%s). Hackers use this to find specific vulnerabilities.", server),
				Remediation:  "Configure 'server_tokens off' (Nginx) or 'ServerTokens Prod' (Apache) to hide version numbers.",
				Severity:     "Low",
			})
			report.Score -= 5
		} else {
			report.Checks = append(report.Checks, SecurityCheck{
				Name:        "Server Info Leakage",
				Passed:      true,
				Description: "Server header is generic (good).",
				Severity:    "Low",
			})
		}
	}

	// Calculate Final Grade
	if report.Score < 0 {
		report.Score = 0
	}
	switch {
	case report.Score >= 90:
		report.Grade = "A"
	case report.Score >= 80:
		report.Grade = "B"
	case report.Score >= 70:
		report.Grade = "C"
	case report.Score >= 60:
		report.Grade = "D"
	default:
		report.Grade = "F"
	}

	return report
}

func checkHeader(resp *http.Response, report *SecurityReport, header string, points int, severity, desc, fix string) {
	if val := resp.Header.Get(header); val != "" {
		report.Checks = append(report.Checks, SecurityCheck{
			Name:        header,
			Passed:      true,
			Description: desc,
			Severity:    severity,
		})
	} else {
		report.Checks = append(report.Checks, SecurityCheck{
			Name:         header,
			Passed:       false,
			ScorePenalty: points,
			Description:  desc,
			Remediation:  fix,
			Severity:     severity,
		})
		report.Score -= points
	}
}
