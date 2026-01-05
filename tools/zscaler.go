package tools

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net"
	"net/http"
	"os/exec"
	"regexp"
	"strings"
	"time"
)

type ZscalerProcess struct {
	Name   string `json:"name"`
	Status string `json:"status"` // "Running", "Stopped"
	Pid    string `json:"pid,omitempty"`
}

type ZDXMetric struct {
	Score         int     `json:"score"`
	LatencyMs     int     `json:"latencyMs"`
	JitterMs      int     `json:"jitterMs"`
	PacketLossPct float64 `json:"packetLossPct"`
	DNSMs         int     `json:"dnsMs"`
}

type ZscalerInfo struct {
	IsZscaler bool    `json:"isZscaler"`
	ProxyIP   string  `json:"proxyIP"`
	Gateway   string  `json:"gateway"`
	Cloud     string  `json:"cloud"`
	ClientIP  string  `json:"clientIP"`
	City      string  `json:"city"`
	Country   string  `json:"country"`
	Lat       float64 `json:"lat"`
	Lon       float64 `json:"lon"`
}

type SSLStatus struct {
	Inspected bool   `json:"inspected"`
	Issuer    string `json:"issuer"`
}

var requiredProcesses = []string{
	"ZSATunnel.exe",
	"ZSATray.exe",
	"ZSAService.exe",
	"ZSAUpdater.exe",
}

func CheckZscalerProcesses() ([]ZscalerProcess, error) {
	cmd := exec.Command("tasklist", "/FO", "CSV", "/NH")
	output, err := cmd.Output()
	if err != nil {
		return nil, err
	}
	outStr := string(output)

	results := []ZscalerProcess{}
	for _, procName := range requiredProcesses {
		// tasklist output: "Image Name","PID","Session Name","Session#","Mem Usage"
		// Simple contains check is fast and sufficient for existence
		if strings.Contains(strings.ToLower(outStr), strings.ToLower(procName)) {
			// Extract PID if needed, but simple existence is key here
			results = append(results, ZscalerProcess{Name: procName, Status: "Running"})
		} else {
			results = append(results, ZscalerProcess{Name: procName, Status: "Stopped"})
		}
	}
	return results, nil
}

func GetZscalerInfo() (ZscalerInfo, error) {
	info := ZscalerInfo{}

	// Scraping ip.zscaler.com
	client := http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get("http://ip.zscaler.com/")
	if err != nil {
		return info, err
	}
	defer resp.Body.Close()
	bodyBytes, _ := io.ReadAll(resp.Body)
	body := string(bodyBytes)

	// Check if via Zscaler
	if strings.Contains(body, "The request is arriving from a Zscaler proxy IP") {
		info.IsZscaler = true

		// Regex extraction
		// "The Zscaler proxy you are using is 165.225.208.55 (PHX5)."
		reProxy := regexp.MustCompile(`proxy you are using is ([\d\.]+) \(([\w]+)\)`)
		matches := reProxy.FindStringSubmatch(body)
		if len(matches) == 3 {
			info.ProxyIP = matches[1]
			info.Gateway = matches[2]
		}

		// "The Zscaler cloud you are on is zscaler.net."
		reCloud := regexp.MustCompile(`cloud you are on is ([\w\.-]+)`)
		cloudMatch := reCloud.FindStringSubmatch(body)
		if len(cloudMatch) == 2 {
			info.Cloud = cloudMatch[1]
		}
	} else {
		info.IsZscaler = false
	}

	// Get Geo Info for the Proxy IP (or current public IP if not Zscaler)
	// We'll use ip-api.com
	targetIP := info.ProxyIP
	if targetIP == "" {
		// If empty, let ip-api detect it
		targetIP = ""
	}

	geoURL := "http://ip-api.com/json/" + targetIP
	geoResp, err := client.Get(geoURL)
	if err == nil {
		defer geoResp.Body.Close()
		var geo struct {
			Query   string  `json:"query"`
			City    string  `json:"city"`
			Country string  `json:"country"`
			Lat     float64 `json:"lat"`
			Lon     float64 `json:"lon"`
		}
		if json.NewDecoder(geoResp.Body).Decode(&geo) == nil {
			info.ClientIP = geo.Query // The IP seen by the internet
			info.City = geo.City
			info.Country = geo.Country
			info.Lat = geo.Lat
			info.Lon = geo.Lon
		}
	}

	return info, nil
}

func CalculateZDXScore(targetHost string) ZDXMetric {
	metric := ZDXMetric{}

	// 1. DNS Resolution Time
	startDNS := time.Now()
	_, err := net.LookupHost("google.com")
	metric.DNSMs = int(time.Since(startDNS).Milliseconds())
	if err != nil {
		metric.DNSMs = 999
	}

	// 2. Latency & Jitter (TCP Connect)
	// Use targetHost (Proxy IP) if available, else google.com
	if targetHost == "" {
		targetHost = "google.com:443"
	} else {
		if !strings.Contains(targetHost, ":") {
			targetHost += ":80" // Proxy usually listens on 80/443
		}
	}

	measurements := []float64{}
	var totalLatency int64 = 0
	successfulProbes := 0
	totalProbes := 5

	for i := 0; i < totalProbes; i++ {
		start := time.Now()
		conn, err := net.DialTimeout("tcp", targetHost, 2*time.Second)
		dur := time.Since(start).Milliseconds()
		if err == nil {
			conn.Close()
			measurements = append(measurements, float64(dur))
			totalLatency += dur
			successfulProbes++
		}
		time.Sleep(100 * time.Millisecond) // GAP
	}

	if successfulProbes > 0 {
		metric.LatencyMs = int(totalLatency) / successfulProbes
		metric.PacketLossPct = float64(totalProbes-successfulProbes) / float64(totalProbes) * 100.0

		// Jitter = variance in latency
		if len(measurements) > 1 {
			var variance float64
			for _, m := range measurements {
				variance += math.Pow(m-float64(metric.LatencyMs), 2)
			}
			metric.JitterMs = int(math.Sqrt(variance / float64(len(measurements))))
		}
	} else {
		metric.PacketLossPct = 100.0
		metric.LatencyMs = 9999
	}

	// 3. Calculate Score (0-100)
	// 100 is perfect. Deduct points for bad metrics.
	score := 100.0

	// Latency Penalty: -1 per 10ms > 20ms
	if metric.LatencyMs > 20 {
		score -= float64(metric.LatencyMs-20) / 10.0
	}

	// Jitter Penalty: -2 per 1ms > 5ms
	if metric.JitterMs > 5 {
		score -= float64(metric.JitterMs-5) * 2.0
	}

	// Packet Loss Penalty: -20 per packet lost (out of 5)
	score -= (metric.PacketLossPct / 20.0) * 20.0 // Simplified: if 20% loss (1 packet), -20 points

	// DNS Penalty: -1 per 10ms > 50ms
	if metric.DNSMs > 50 {
		score -= float64(metric.DNSMs-50) / 10.0
	}

	if score < 0 {
		score = 0
	}
	metric.Score = int(score)

	return metric
}

func CheckSSLInspection() SSLStatus {
	status := SSLStatus{Inspected: false, Issuer: "Unknown"}

	// Dial generic external site
	conn, err := tls.Dial("tcp", "google.com:443", &tls.Config{
		InsecureSkipVerify: true, // We want to inspect the cert even if invalid
	})
	if err != nil {
		status.Issuer = fmt.Sprintf("Error: %v", err)
		return status
	}
	defer conn.Close()

	if len(conn.ConnectionState().PeerCertificates) > 0 {
		issuer := conn.ConnectionState().PeerCertificates[0].Issuer.CommonName
		status.Issuer = issuer
		if strings.Contains(strings.ToLower(issuer), "zscaler") {
			status.Inspected = true
		}
	}

	return status
}
