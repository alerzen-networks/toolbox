package tools

import (
	"fmt"
	"net"
	"sort"
	"sync"
	"time"
)

type PortResult struct {
	Port    int    `json:"port"`
	Status  string `json:"status"` // "Open", "Closed"
	Service string `json:"service"`
}

var CommonPorts = map[int]string{
	21:   "FTP",
	22:   "SSH",
	23:   "Telnet",
	25:   "SMTP",
	53:   "DNS",
	80:   "HTTP",
	110:  "POP3",
	143:  "IMAP",
	443:  "HTTPS",
	3306: "MySQL",
	3389: "RDP",
	5432: "PostgreSQL",
	8080: "HTTP-Alt",
}

func ScanPorts(host string, ports []int) []PortResult {
	if len(ports) == 0 {
		// Default to common ports if none provided
		for p := range CommonPorts {
			ports = append(ports, p)
		}
	}
	sort.Ints(ports)

	var results []PortResult
	var wg sync.WaitGroup
	var mu sync.Mutex

	// Semaphore to limit concurrency (simple)
	sem := make(chan struct{}, 50)

	for _, port := range ports {
		wg.Add(1)
		sem <- struct{}{}

		go func(p int) {
			defer wg.Done()
			defer func() { <-sem }()

			address := fmt.Sprintf("%s:%d", host, p)
			conn, err := net.DialTimeout("tcp", address, 500*time.Millisecond)

			status := "Closed"
			if err == nil {
				status = "Open"
				conn.Close()
			}

			res := PortResult{
				Port:    p,
				Status:  status,
				Service: CommonPorts[p],
			}

			mu.Lock()
			results = append(results, res)
			mu.Unlock()
		}(port)
	}

	wg.Wait()

	// Sort results by port number for cleaner output
	sort.Slice(results, func(i, j int) bool {
		return results[i].Port < results[j].Port
	})

	return results
}
