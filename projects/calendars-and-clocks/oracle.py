"""Independent sequential calendar oracle: no closed-form year-start formula.

Construct explicit week/day sequences, inserting extra days, and hash them.
The JavaScript implementation must match every record across 4,000 years.
"""
import hashlib
import json
from datetime import datetime, timezone

epoch = int(datetime(1999, 12, 22, 12, tzinfo=timezone.utc).timestamp() * 1000)
leaps = set(range(12000, 16000, 4)) - set(range(12000, 16000, 100))
leaps |= set(range(12000, 16000, 400))
leaps -= set(range(12000, 16000, 4000))
assert len(leaps) == 969
digest = hashlib.sha256()
offset = 0
for year in range(12000, 16000):
    ordinal = 0
    def record(kind, season=0, week=0, day=0):
        global offset, ordinal
        stamp = epoch + offset * 86_400_000
        digest.update(f'{year},{ordinal},{kind},{season},{week},{day},{stamp}\n'.encode())
        offset += 1
        ordinal += 1
    for season in range(1, 5):
        for week in range(1, 14):
            for day in range(1, 8):
                record('regular', season, week, day)
        if season == 2 and year in leaps:
            record('leap-day')
    record('year-day')
assert offset == 1_460_969
print(json.dumps({'days':offset,'leaps':len(leaps),'sha256':digest.hexdigest()}))
