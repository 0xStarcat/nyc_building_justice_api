#!/usr/bin/python3

import smtplib
import datetime
import sqlite3
import config
import shutil
import os
import context
import api_requests

# Create log if none exists.
log_file = config.LOG_URL
try:
    file = open(log_file, 'r')
    file.close()
except IOError:
    file = open(log_file, 'w')
    file.close()

print("Starting data update...")
try:
    context.log_helper.write_to_log(datetime.datetime.now().strftime("%I:%M%p on %B %d, %Y") + '\n')
    context.log_helper.write_to_log("Copying Database to backup" + "\n")
    shutil.copy(config.DATABASE_URL, config.DATABASE_BACKUP_URL)

    new_entry_counts = api_requests.request(False)
    status_update_counts = api_requests.check_call_statuses()
    api_requests.update_data()

    conn = sqlite3.connect(config.DATABASE_BACKUP_URL, timeout=10)
    c = conn.cursor()

    update_counts_data = {"date": datetime.datetime.now().strftime(
        "%Y%m%d%H%M%S"), **new_entry_counts, **status_update_counts}
    context.updates_seeds.new_entry(c, update_counts_data)
    conn.commit()

    shutil.move(config.DATABASE_URL, config.DATABASE_TEMP_URL)
    shutil.move(config.DATABASE_BACKUP_URL, config.DATABASE_URL)
    os.remove(config.DATABASE_TEMP_URL)

    context.log_helper.write_to_log("Database replaced\n")
    context.log_helper.write_to_log("***\n")

    log = open(config.LOG_URL, "r").read().split("***")
    msg = log[len(log) - 2]
except Exception as error:
    context.log_helper.write_to_log(error)
    msg = error

print(msg)
print("Message length is", len(msg))
username = os.environ["BUILDING_MONITOR_EMAIL"]
password = os.environ["BUILDING_MONITOR_EMAIL_PASSWORD"]
fromaddr = "NYC Building Monitor"
toaddrs = "jadeahking@gmail.com"

server = smtplib.SMTP('smtp.gmail.com:587')
server.set_debuglevel(1)
server.starttls()
server.login(username, password)
server.sendmail(fromaddr, toaddrs, msg)
server.quit()
