from datetime import datetime
import json


def set_queries(queries: dict):
    result = "?"
    for key, value in queries.items():
        result += key + "=" + value + "&"
    return result[:-1]


def date_to_string(dts: datetime, fmt: str):
    if fmt == 'day':
        return dts.strftime('%Y%m%d')
    elif fmt == 'month':
        return dts.strftime('%Y%m')
    elif fmt == 'year':
        return str(dts.year)
    elif fmt == 'M':
        return str(dts.month)


def object_to_list(data: dict):
    if all(isinstance(int(key), int) for key in data.keys()):
        return [x for x in data.values()]


def pprint(data):
    print(json.dumps(data, indent=4, ensure_ascii=False))
