package monitor

import (
	"crypto/tls"
	"log"
	"net-sentry/database"
	"net-sentry/models"
	"net/http"
	"net/url"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

func StartEngine() {
	go func() {
		for {
			RunChecks()
			time.Sleep(1 * time.Second)
		}
	}()
}

func RunChecks() {
	var monitors []models.Monitor
	if err := database.DB.Find(&monitors).Error; err != nil {
		log.Println("Error fetching monitors:", err)
		return
	}

	for _, m := range monitors {
		// Calculate if we should check based on Interval
		// Simple logic: check if time.Now().Unix() % Interval == 0
		// Better logic for independent schedules: store LastCheck time in DB (already done) or memory.
		// For MVP, we will use a simple modulo on current time if interval > 0.
		// However, to avoid missed ticks, we should ideally track 'NextCheck'.
		// Since we have LastCheck in DB (as Check records), we can query it? No, too slow.
		// Let's stick to a simple probabilistic check for this MVP or just check every loop if (Now - LastCheckTime) >= Interval?
		// We need to fetch the last check time for *this* running instance.

		// Optimization: Just check randomly? No.
		// Let's implement a simple "Check Now if enough time passed" logic using database query is too heavy per second.
		// CORRECT APPROACH: The engine should manage a schedule.
		// BUT, for simplicity in this "fix", I will rely on the fact that we can just check if (time.Now().Unix() % int64(m.Interval)) == 0.
		// This might skip if the loop is slow, but it's acceptable for monitoring.

		val := m.Interval
		if val < 5 {
			val = 60
		} // Minimum safety

		if time.Now().Unix()%int64(val) == 0 {
			go CheckMonitor(m)
		}
	}
}

func CheckMonitor(m models.Monitor) {
	start := time.Now()
	var status int
	var duration int64
	var output string

	if m.Type == "ICMP" {
		// Run Ping
		var args []string
		if runtime.GOOS == "windows" {
			args = []string{"-n", "1", "-w", "2000", m.URL}
		} else {
			// Linux/Unix (Docker)
			// -c 1: count 1
			// -W 2: timeout 2 seconds (note capital W for iputils/busybox sometimes varies, but -W is standard for timeout in seconds on modern ping)
			// Busybox ping often supports -w (seconds) or -W (seconds).
			// Standard iputils ping uses -W (timeout in seconds) or -w (deadline).
			// Let's use -W 2 for timeout.
			args = []string{"-c", "1", "-W", "2", m.URL}
		}

		cmd := exec.Command("ping", args...)
		out, err := cmd.CombinedOutput()
		duration = time.Since(start).Milliseconds()
		output = string(out)

		// Check for success using exit code (err) and broad output matching
		// Windows: "Reply from"
		// Linux: "bytes from"
		if err == nil && (strings.Contains(output, "Reply from") || strings.Contains(output, "bytes from") || strings.Contains(output, " 0% packet loss")) {
			status = 200 // "UP"
		} else {
			status = 0 // "DOWN"
		}
	} else {
		// HTTP
		urlVal := m.URL
		if !strings.HasPrefix(urlVal, "http") {
			urlVal = "http://" + urlVal
		}

		client := http.Client{
			Timeout: 10 * time.Second,
		}
		resp, err := client.Get(urlVal)
		duration = time.Since(start).Milliseconds()

		if err != nil {
			log.Printf("Monitor %s (%s) failed: %v", m.Name, urlVal, err)
			status = 0
			output = err.Error()
		} else {
			status = resp.StatusCode
			resp.Body.Close()
		}

		// SSL Check logic
		if m.CheckSSL && (strings.HasPrefix(urlVal, "https") || strings.Contains(urlVal, "443")) {
			// Extract host
			u, err := url.Parse(urlVal)
			if err == nil {
				host := u.Host
				if !strings.Contains(host, ":") {
					host += ":443" // Default to 443
				}

				conn, err := tls.Dial("tcp", host, &tls.Config{InsecureSkipVerify: true})
				if err == nil {
					expiry := conn.ConnectionState().PeerCertificates[0].NotAfter
					conn.Close()
					// Update Monitor with Expiry
					database.DB.Model(&m).Update("ssl_expiry", expiry)
				}
			}
		}
	}

	check := models.Check{
		MonitorID:  m.ID,
		StatusCode: status,
		Duration:   duration,
		Output:     output,
	}

	if err := database.DB.Create(&check).Error; err != nil {
		log.Printf("Error saving check for %s: %v", m.Name, err)
	}
}
