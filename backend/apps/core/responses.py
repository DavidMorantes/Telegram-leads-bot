from rest_framework.response import Response


def api_success(data=None, message="ok", status_code=200):
    return Response({"message": message, "data": data}, status=status_code)
