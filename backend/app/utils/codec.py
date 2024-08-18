import base64

def int_to_base64(num: int):
    str_num = str(num)
    input_bytes = str_num.encode('utf-8')
    base64_bytes = base64.b64encode(input_bytes)
    base64_string = base64_bytes.decode('utf-8')
    return base64_string
