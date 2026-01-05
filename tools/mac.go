package tools

import (
	"bufio"
	"fmt"
	"net/http"
	"os/exec"
	"regexp"
	"strings"
	"time"
)

// Hardcoded common vendors for offline speed
var CommonOUIs = map[string]string{
	"00:00:0C": "Cisco",
	"00:0C:29": "VMware",
	"00:50:56": "VMware",
	"00:15:5D": "Microsoft (Hyper-V)",
	"00:1A:11": "Google",
	"00:1B:63": "Apple",
	"F0:98:9D": "Apple",
	"AC:87:A3": "Apple",
	"00:17:F2": "Apple",
	"BC:5F:F4": "ASRock",
	"DC:A6:32": "Raspberry Pi",
	"B8:27:EB": "Raspberry Pi",
	"E4:5F:01": "Raspberry Pi",
	"18:C0:4D": "Intel",
}

// LookupVendor returns vendor name or "Unknown"
func LookupVendor(mac string) (string, error) {
	// 1. Normalize MAC
	mac = strings.ToUpper(strings.ReplaceAll(strings.ReplaceAll(mac, "-", ":"), ".", ":"))

	if len(mac) < 8 {
		return "", fmt.Errorf("invalid MAC address format")
	}

	prefix := mac[:8] // "XX:XX:XX"

	// 2. Check Local Cache
	if vendor, ok := CommonOUIs[prefix]; ok {
		return vendor, nil
	}

	// 3. Fallback to API (macvendors.com is free/easy)
	// Increased timeout to 5 seconds
	client := http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get("https://api.macvendors.com/" + mac)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("API returned status: %d", resp.StatusCode)
	}

	var buf [512]byte
	n, _ := resp.Body.Read(buf[:])
	return string(buf[:n]), nil
}

// GetARPEntries parses 'arp -a' to map IP -> MAC
func GetARPEntries() (map[string]string, error) {
	arpMap := make(map[string]string)

	cmd := exec.Command("arp", "-a")
	output, err := cmd.Output()
	if err != nil {
		// Just return empty on error (e.g. permission issues or non-windows)
		fmt.Printf("ARP Error: %v\n", err)
		return arpMap, nil
	}

	scanner := bufio.NewScanner(strings.NewReader(string(output)))
	// Windows ARP format:
	//   192.168.1.1          12-34-56-78-90-ab     dynamic
	re := regexp.MustCompile(`(\d+\.\d+\.\d+\.\d+)\s+([0-9a-fA-F-]{17})`)

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		matches := re.FindStringSubmatch(line)
		if len(matches) == 3 {
			ip := matches[1]
			mac := strings.ReplaceAll(matches[2], "-", ":")
			arpMap[ip] = strings.ToUpper(mac)
		}
	}
	return arpMap, nil
}
