package database

import (
	"log"
	"net-sentry/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	var err error
	// Use /data/alerzen-networks.db for persistence in Docker
	DB, err = gorm.Open(sqlite.Open("alerzen-networks.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Connected to Database")

	err = DB.AutoMigrate(&models.Monitor{}, &models.Check{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	log.Println("Database Migrated")
}
