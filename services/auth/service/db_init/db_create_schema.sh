#!/bin/bash
set -e

POSTGRES="psql --username ${POSTGRES_USER}"

$POSTGRES <<EOSQL
create user logger with encrypted password '0JjV5(G26,^{a&L8';
create database logger;
grant all privileges on database logger to logger;

create user auth with encrypted password 'wG>R8/syQ#]u8mYc';
create database auth;
grant all privileges on database auth to auth;
EOSQL
