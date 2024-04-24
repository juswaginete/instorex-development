@echo off

:: Change directory
cd .docker

:: Start docker containers
docker-compose -f docker-compose.yml up -d

:: Create cmd alias for general commands
call docker-doskeys.cmd