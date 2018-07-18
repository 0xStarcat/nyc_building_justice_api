import sqlite3
import os,sys,inspect
sys.path.insert(1, os.path.join(sys.path[0], '..'))

from helpers import api_helpers
from seeds import service_calls_seeds

table = service_calls_seeds.service_calls_table
import config

def check_statuses():
  conn = sqlite3.connect(config.DATABASE_BACKUP_URL, timeout=10)
  c = conn.cursor()
  c.execute('pragma foreign_keys=on;')

  c.execute('SELECT * FROM {tn} WHERE {cn}=\'{value}\''.format(tn=table, cn='status', value='Open'))
  open_calls = c.fetchall()
  print("Found " + str(len(open_calls)) + " open calls to check")

  for index, call in enumerate(open_calls):
    print("checking call status: " + str(index) + '/' + str(len(open_calls)))
    url = 'https://data.cityofnewyork.us/resource/fhrw-4uyv.json?unique_key=' + call[9]
    source = call[11]
    api_call = api_helpers.request_single_row_from_api(url)[0]
    if not api_call:
      print("  * Call not retrieved from api.")
      continue
    if api_call["status"] != "Open":
      print(" ++ Updating status of ", call[9])
      
      c.execute('DELETE FROM {tn} WHERE {cn}={value}'.format(tn=table, cn="id", value=call[0]))
      seed_service_calls_from_json(c, api_call)
      conn.commit()