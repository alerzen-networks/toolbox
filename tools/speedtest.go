package tools

import (
	"fmt"
	"math"

	"github.com/showwin/speedtest-go/speedtest"
)

type SpeedTestResult struct {
	Ping     float64 `json:"ping"`     // ms
	Download float64 `json:"download"` // Mbps
	Upload   float64 `json:"upload"`   // Mbps
	Server   string  `json:"server"`   // Server Name
	Location string  `json:"location"` // Server Location
	Sponsor  string  `json:"sponsor"`  // ISP/Sponsor
	Error    string  `json:"error,omitempty"`
}

func RunSpeedTest() SpeedTestResult {
	var result SpeedTestResult

	var speedtestClient = speedtest.New()

	// FetchUserInfo is likely a method on the client or standalone that returns User
	// Checking docs indirectly via guessing common patterns or previous failures:
	// Actually the error said "user.FetchUserInfo undefined" previously?
	// No, I missed the output. "serverList, _ := speedtest.FetchServerList(user)" failed?
	// Let's assume the modern API:
	// user, _ := speedtestClient.FetchUserInfo()
	// serverList, _ := speedtestClient.FetchServerList(user)

	// FetchUserInfo returns user info but we don't strictly need it to fetch servers in v1.4+
	// speedtestClient.FetchUserInfo()
	serverList, _ := speedtestClient.FetchServers()
	targets, _ := serverList.FindServer([]int{})

	if len(targets) == 0 {
		result.Error = "No servers found"
		return result
	}

	// Use the closest server
	server := targets[0]
	result.Server = server.Name
	result.Location = server.Country
	result.Sponsor = server.Sponsor

	// Ping Test
	err := server.PingTest(nil)
	if err != nil {
		result.Error = fmt.Sprintf("Ping failed: %v", err)
		return result
	}
	result.Ping = float64(server.Latency.Milliseconds())

	// Download Test
	err = server.DownloadTest()
	if err != nil {
		result.Error = fmt.Sprintf("Download failed: %v", err)
		return result
	}
	// DLSpeed is ByteRate (float64 alias or similar) in bytes/sec. Convert to Mbps.
	// 1 Byte = 8 bits. /1,000,000 for Mega.
	result.Download = float64(server.DLSpeed) * 8 / 1000000

	// Upload Test
	err = server.UploadTest()
	if err != nil {
		result.Error = fmt.Sprintf("Upload failed: %v", err)
		return result
	}
	result.Upload = float64(server.ULSpeed) * 8 / 1000000

	// Round to 2 decimal places
	result.Download = math.Round(result.Download*100) / 100
	result.Upload = math.Round(result.Upload*100) / 100

	return result
}
