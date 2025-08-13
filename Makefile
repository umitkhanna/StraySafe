# Basic Makefile for StraySafe
# Run "make up" to start, "make down" to stop.

.PHONY: up down build logs

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f --tail=100
