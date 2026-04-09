from flask import Response
from backend.app import add_cors_headers


def test_add_cors_headers():
    response = Response()
    updated_response = add_cors_headers(response)

    assert updated_response.headers["Access-Control-Allow-Origin"] == "http://localhost:8000"
    assert updated_response.headers["Access-Control-Allow-Methods"] == "GET,POST,OPTIONS"
    assert updated_response.headers["Access-Control-Allow-Headers"] == "Content-Type"

# This test verifies that the add_cors_headers function correctly attaches the required CORS headers to every HTTP response. 
# It ensures that the backend allows cross-origin requests from the frontend by including the appropriate access control headers.