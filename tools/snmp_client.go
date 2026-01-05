package tools

import (
	"fmt"
	"time"

	"github.com/gosnmp/gosnmp"
)

type SNMPResult struct {
	OID   string `json:"oid"`
	Type  string `json:"type"`
	Value string `json:"value"`
}

func SNMPGet(target, community, oid string) ([]SNMPResult, error) {
	params := &gosnmp.GoSNMP{
		Target:    target,
		Port:      161,
		Community: community,
		Version:   gosnmp.Version2c,
		Timeout:   2 * time.Second,
		Retries:   1,
	}

	err := params.Connect()
	if err != nil {
		return nil, fmt.Errorf("connect err: %v", err)
	}
	defer params.Conn.Close()

	packet, err := params.Get([]string{oid})
	if err != nil {
		return nil, fmt.Errorf("get err: %v", err)
	}

	var results []SNMPResult
	for _, variable := range packet.Variables {
		results = append(results, SNMPResult{
			OID:   variable.Name,
			Type:  fmt.Sprintf("%v", variable.Type),
			Value: fmt.Sprintf("%v", variable.Value),
		})
	}
	return results, nil
}

func SNMPWalk(target, community, rootOid string) ([]SNMPResult, error) {
	params := &gosnmp.GoSNMP{
		Target:    target,
		Port:      161,
		Community: community,
		Version:   gosnmp.Version2c,
		Timeout:   2 * time.Second,
		Retries:   1,
	}

	err := params.Connect()
	if err != nil {
		return nil, fmt.Errorf("connect err: %v", err)
	}
	defer params.Conn.Close()

	var results []SNMPResult
	err = params.BulkWalk(rootOid, func(pdu gosnmp.SnmpPDU) error {
		results = append(results, SNMPResult{
			OID:   pdu.Name,
			Type:  fmt.Sprintf("%v", pdu.Type),
			Value: fmt.Sprintf("%v", pdu.Value),
		})
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("walk err: %v", err)
	}

	return results, nil
}
