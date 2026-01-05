package tools

import (
	"fmt"
	"net"
	"strings"
	"sync"
)

type BlacklistCheck struct {
	Host     string            `json:"host"`
	IP       string            `json:"ip"`
	Results  []BlacklistResult `json:"results"`
	ListedIn int               `json:"listed_in"`
}

type BlacklistResult struct {
	Provider string `json:"provider"`
	Listed   bool   `json:"listed"`
	Details  string `json:"details,omitempty"`
}

var dnsblProviders = []string{
	"zen.spamhaus.org",
	"b.barracudacentral.org",
	"bl.spamcop.net",
	"dnsbl.sorbs.net",
	"cbl.abuseat.org",
}

func CheckBlacklist(host string) (BlacklistCheck, error) {
	check := BlacklistCheck{Host: host, Results: []BlacklistResult{}}

	// Resolve IP
	ips, err := net.LookupIP(host)
	if err != nil || len(ips) == 0 {
		return check, fmt.Errorf("could not resolve host: %v", err)
	}
	targetIP := ips[0]
	if targetIP.To4() == nil {
		return check, fmt.Errorf("IPv6 not fully supported by all DNSBLs yet")
	}
	check.IP = targetIP.String()

	// Reverse IP for DNSBL query: 1.2.3.4 -> 4.3.2.1
	parts := strings.Split(targetIP.String(), ".")
	if len(parts) != 4 {
		return check, fmt.Errorf("invalid IPv4 format")
	}
	reversedIP := fmt.Sprintf("%s.%s.%s.%s", parts[3], parts[2], parts[1], parts[0])

	var wg sync.WaitGroup
	var mu sync.Mutex

	for _, provider := range dnsblProviders {
		wg.Add(1)
		go func(p string) {
			defer wg.Done()
			lookup := fmt.Sprintf("%s.%s", reversedIP, p)

			res := BlacklistResult{Provider: p, Listed: false}

			// If we get an IP back (usually 127.0.0.x), it is listed
			resultIPs, err := net.LookupHost(lookup)
			if err == nil && len(resultIPs) > 0 {
				res.Listed = true
				res.Details = resultIPs[0] // e.g., 127.0.0.2
			}

			mu.Lock()
			check.Results = append(check.Results, res)
			if res.Listed {
				check.ListedIn++
			}
			mu.Unlock()
		}(provider)
	}

	wg.Wait()
	return check, nil
}
