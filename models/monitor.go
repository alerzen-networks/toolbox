package models

import (
	"time"

	"gorm.io/gorm"
)

type Monitor struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Name      string         `json:"name"`
	URL       string         `json:"url"`
	Type      string         `json:"type" gorm:"default:'HTTP'"` // HTTP, ICMP
	Interval  int            `json:"interval" gorm:"default:60"` // Seconds
	CheckSSL  bool           `json:"check_ssl"`
	SSLExpiry *time.Time     `json:"ssl_expiry"`
	Checks    []Check        `json:"checks,omitempty"`
	LastCheck *Check         `gorm:"-" json:"last_check,omitempty"`
}

type Check struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	MonitorID  uint      `json:"monitor_id"`
	StatusCode int       `json:"status_code"`
	Duration   int64     `json:"duration"` // ms
	Output     string    `json:"output"`   // Ping/Trace results
	CreatedAt  time.Time `json:"created_at"`
}
