#!/bin/bash

service supervisor start

tail -f /var/log/*.log
