package tools

import (
	"fmt"

	"github.com/likexian/whois"
)

type WhoisResult struct {
	Domain string `json:"domain"`
	Raw    string `json:"raw"`
	Error  string `json:"error,omitempty"`
}

func LookupWhois(domain string) WhoisResult {
	result := WhoisResult{Domain: domain}

	raw, err := whois.Whois(domain)
	if err != nil {
		result.Error = fmt.Sprintf("Lookup failed: %v", err)
		return result
	}

	result.Raw = raw
	return result
}
