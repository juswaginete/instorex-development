@echo off

:: Create cmd alias for general commands
doskey artisan=docker-compose -f docker-compose.yml exec php php artisan $*
doskey gulp=docker-compose -f docker-compose.yml exec php gulp $*
doskey composer=docker-compose -f docker-compose.yml exec php composer $*
doskey npm=docker-compose -f docker-compose.yml exec php npm $*
doskey exec=docker-compose -f docker-compose.yml exec $*
doskey bash=docker-compose -f docker-compose.yml exec $* bash

:: Doskeys for managing docker-compose
doskey up=docker-compose -f docker-compose.yml up $*
doskey rebuild=docker-compose -f docker-compose.yml up --build $*
doskey stop=docker-compose -f docker-compose.yml stop
doskey start=docker-compose -f docker-compose.yml start
doskey remove=docker-compose -f docker-compose.yml rm
doskey kill=docker-compose -f docker-compose.yml kill
