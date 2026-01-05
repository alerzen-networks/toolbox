package tools

import (
	"crypto/tls"
	"fmt"
	"net"
	"time"
)

type SSLResult struct {
	Subject       string    `json:"subject"`
	Issuer        string    `json:"issuer"`
	ValidFrom     time.Time `json:"valid_from"`
	ValidTo       time.Time `json:"valid_to"`
	DaysRemaining int       `json:"days_remaining"`
	Error         string    `json:"error,omitempty"`
}

func CheckSSL(domain string) SSLResult {
	var result SSLResult

	// Append port 443 if missing
	host := domain
	if _, _, err := net.SplitHostPort(domain); err != nil {
		host = domain + ":443"
	}

	conf := &tls.Config{
		InsecureSkipVerify: true, // We want to see the cert even if invalid (but valid usually preferred)
	}

	conn, err := tls.Dial("tcp", host, conf)
	if err != nil {
		result.Error = fmt.Sprintf("Connection failed: %v", err)
		return result
	}
	defer conn.Close()

	certs := conn.ConnectionState().PeerCertificates
	if len(certs) == 0 {
		result.Error = "No certificates found"
		return result
	}

	cert := certs[0]
	result.Subject = cert.Subject.CommonName
	result.Issuer = cert.Issuer.CommonName
	result.ValidFrom = cert.NotBefore
	result.ValidTo = cert.NotAfter
	result.DaysRemaining = int(time.Until(cert.NotAfter).Hours() / 24)

	return result
}
