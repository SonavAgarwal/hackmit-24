from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

# Allow all CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/mirror/")
async def mirror_get(request: Request):
    try:
        url = request.query_params.get('url')
        if not url:
            print("Missing 'url' parameter.")
            raise HTTPException(
                status_code=400, detail="Missing 'url' parameter.")

        # Prepare additional query params to forward
        params = request.query_params

        print(f"Forwarding GET request to {url} with params {params}")

        async with httpx.AsyncClient() as client:
            # Forward the GET request
            response = await client.get(url, params=params)

            # Try to return JSON if possible, otherwise return as plain text
            try:
                return JSONResponse(content=response.json(), status_code=response.status_code)
            except Exception as e:
                print("Failed to decode JSON response")
                return PlainTextResponse(content=response.text, status_code=response.status_code)

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
