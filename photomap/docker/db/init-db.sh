#!/bin/bash
set -e

echo """
	CREATE USER photomap WITH LOGIN PASSWORD 'photomap';
  CREATE DATABASE photomap WITH OWNER photomap;
	""" | psql -v ON_ERROR_STOP=1 --username "postgres"
