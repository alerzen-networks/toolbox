package tools

import (
	"encoding/binary"
	"fmt"
	"net"
	"strings"
	"sync"
	"time"
)

type HostResult struct {
	IP       string `json:"ip"`
	Hostname string `json:"hostname,omitempty"`
	MAC      string `json:"mac"`
	Vendor   string `json:"vendor"`
	Role     string `json:"role"`
	Ports    []int  `json:"ports"`
	Latency  int    `json:"latency"` // ms
	Status   string `json:"status"`
}

func ScanSubnet(cidr string) ([]HostResult, error) {
	_, ipNet, err := net.ParseCIDR(cidr)
	if err != nil {
		return nil, fmt.Errorf("invalid CIDR: %v", err)
	}

	// Generate all IPs in range
	ips := []string{}
	for ip := ipNet.IP.Mask(ipNet.Mask); ipNet.Contains(ip); inc(ip) {
		ips = append(ips, ip.String())
	}

	// Skip Network and Broadcast usually, but let's just scan all > 0 and < last
	if len(ips) > 2 {
		ips = ips[1 : len(ips)-1]
	}

	// Limit scan size to avoid hanging
	if len(ips) > 512 {
		return nil, fmt.Errorf("subnet too large (max 512 hosts for now)")
	}

	var results []HostResult
	var wg sync.WaitGroup
	var mu sync.Mutex

	// Fast Ping equivalent (TCP Connect to common ports or standard Ping if privileged)
	// Since raw sockets need root, we'll try TCP Connect to 80/443/22/445 as a heuristic "active" check
	// OR use actual ICMP if we assume the user might run as admin.
	// Actually, `go-ping` needs admin.
	// Let's stick thereto "Port Probe" as a proxy for "Up".
	// Or we can try to resolve hostname.

	// Better approach for "Scanner":
	// Try to dial port 80, 443, 22. If any open -> UP.
	// Also attempt reverse DNS lookup.

	// 1. Initial Scan (Discovery)
	sem := make(chan struct{}, 100)
	for _, ip := range ips {
		wg.Add(1)
		sem <- struct{}{}
		go func(targetIP string) {
			defer wg.Done()
			defer func() { <-sem }()

			// Resolve Hostname
			names, _ := net.LookupAddr(targetIP)
			hostname := ""
			if len(names) > 0 {
				hostname = names[0]
			}

			// TCP Probe for Active Check & Port Fingerprint
			// Ports: 80(HTTP), 443(HTTPS), 22(SSH), 445(SMB/Windows), 3389(RDP), 8080(Alt HTTP), 62078(iPhone sync)
			portsToCheck := []int{80, 443, 22, 445, 3389, 8080}
			openPorts := []int{}
			alive := false
			latency := -1

			for _, port := range portsToCheck {
				start := time.Now()
				conn, err := net.DialTimeout("tcp", fmt.Sprintf("%s:%d", targetIP, port), 200*time.Millisecond)
				if err == nil {
					alive = true
					if latency == -1 {
						latency = int(time.Since(start).Milliseconds())
					}
					openPorts = append(openPorts, port)
					conn.Close()
				}
			}

			if alive || hostname != "" {
				res := HostResult{
					IP:       targetIP,
					Hostname: hostname,
					Latency:  latency,
					Status:   "Active",
					Ports:    openPorts, // Pass open ports to result
				}
				mu.Lock()
				results = append(results, res)
				mu.Unlock()
			}
		}(ip)
	}
	wg.Wait()

	// 2. Post-Scan Enrichment (MAC & Vendor)
	// Now that traffic has flowed, the ARP table should be populated
	arpMap, _ := GetARPEntries()

	for i := range results {
		if mac, ok := arpMap[results[i].IP]; ok {
			results[i].MAC = mac
			results[i].Vendor, _ = LookupVendor(mac)
			if results[i].Vendor == "" {
				results[i].Vendor = "Unknown"
			}
		} else {
			results[i].MAC = "N/A"
			results[i].Vendor = "Unknown"
		}

		// Simple Role Fingerprinting
		roles := []string{}
		for _, p := range results[i].Ports {
			switch p {
			case 80, 443, 8080:
				roles = append(roles, "Web Server")
			case 22:
				roles = append(roles, "Linux/SSH")
			case 445:
				roles = append(roles, "Windows")
			case 3389:
				roles = append(roles, "RDP Server")
			}
		}
		if len(roles) > 0 {
			// Deduplicate
			uniqueRoles := make(map[string]bool)
			deduped := []string{}
			for _, r := range roles {
				if !uniqueRoles[r] {
					uniqueRoles[r] = true
					deduped = append(deduped, r)
				}
			}
			results[i].Role = strings.Join(deduped, ", ")
		} else {
			results[i].Role = "Generic Device"
		}
	}

	return results, nil
}

func inc(ip net.IP) {
	for j := len(ip) - 1; j >= 0; j-- {
		ip[j]++
		if ip[j] > 0 {
			break
		}
	}
}

// binary helper not needed if using standard net.IP math above
func ip2int(ip net.IP) uint32 {
	if len(ip) == 16 {
		return binary.BigEndian.Uint32(ip[12:16])
	}
	return binary.BigEndian.Uint32(ip)
}

func int2ip(nn uint32) net.IP {
	ip := make(net.IP, 4)
	binary.BigEndian.PutUint32(ip, nn)
	return ip
}
