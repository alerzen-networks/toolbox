package tools

import (
	"net"
	"sync"
	"time"

	"github.com/miekg/dns"
)

type DNSRecord struct {
	Type  string `json:"type"`
	Value string `json:"value"`
}

type PropagationResult struct {
	Resolver string   `json:"resolver"`
	IP       string   `json:"ip"`     // The Resolver's IP
	Status   string   `json:"status"` // "Matched", "Different", "Error"
	Records  []string `json:"records"`
}

func LookupDomain(domain string) (map[string][]string, error) {
	results := make(map[string][]string)

	// Use Go's native resolver for standard lookup
	// A Records
	ips, err := net.LookupIP(domain)
	if err == nil {
		var aRecs []string
		for _, ip := range ips {
			if ip.To4() != nil {
				aRecs = append(aRecs, ip.String())
			}
		}
		results["A"] = aRecs
	}

	// MX Records
	mx, err := net.LookupMX(domain)
	if err == nil {
		var mxRecs []string
		for _, m := range mx {
			mxRecs = append(mxRecs, m.Host)
		}
		results["MX"] = mxRecs
	}

	// TXT Records
	txt, err := net.LookupTXT(domain)
	if err == nil {
		results["TXT"] = txt
	}

	// NS Records
	ns, err := net.LookupNS(domain)
	if err == nil {
		var nsRecs []string
		for _, n := range ns {
			nsRecs = append(nsRecs, n.Host)
		}
		results["NS"] = nsRecs
	}

	return results, nil
}

func CheckPropagation(domain string) []PropagationResult {
	resolvers := map[string]string{
		"Google":     "8.8.8.8:53",
		"Cloudflare": "1.1.1.1:53",
		"Quad9":      "9.9.9.9:53",
		"OpenDNS":    "208.67.222.222:53",
	}

	var results []PropagationResult
	var wg sync.WaitGroup
	var mu sync.Mutex

	for name, addr := range resolvers {
		wg.Add(1)
		go func(rName, rAddr string) {
			defer wg.Done()

			c := new(dns.Client)
			c.Timeout = 2 * time.Second
			m := new(dns.Msg)
			m.SetQuestion(dns.Fqdn(domain), dns.TypeA)

			r, _, err := c.Exchange(m, rAddr)

			res := PropagationResult{
				Resolver: rName,
				IP:       rAddr,
			}

			if err != nil {
				res.Status = "Error"
			} else if len(r.Answer) == 0 {
				res.Status = "No Records"
			} else {
				res.Status = "Success"
				for _, ans := range r.Answer {
					if a, ok := ans.(*dns.A); ok {
						res.Records = append(res.Records, a.A.String())
					}
				}
			}

			mu.Lock()
			results = append(results, res)
			mu.Unlock()
		}(name, addr)
	}

	wg.Wait()
	return results
}
