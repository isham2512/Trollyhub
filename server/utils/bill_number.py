import random
from datetime import datetime

def generate_bill_number() -> str:
    now = datetime.now()
    stamp = f"{now.year}{now.month:02d}{now.day:02d}"
    rand = random.randint(1000, 9999)
    return f"TH-{stamp}-{rand}"

