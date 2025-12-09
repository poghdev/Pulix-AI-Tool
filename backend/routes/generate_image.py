import os
import httpx
import asyncio
from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from typing import Literal
from .auth import get_current_user

load_dotenv()

router = APIRouter(
    prefix="/generation",
    tags=["Generation"]
)

DEAPI_TOKEN = None
DEAPI_BASE_URL = "https://api.deapi.ai"
DEAPI_MODEL_NAME = "Flux1schnell"


try:
    DEAPI_TOKEN = os.getenv("DEAPI_TOKEN")
    if not DEAPI_TOKEN:
        print("Error: DEAPI_TOKEN .env.")
        raise ValueError("NO DEAPI_TOKEN")
    print("DeAPI Token Success")

except Exception as e:
    print(f"Error DeAPI: {e}")

class ImageRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=500)
    style: str = Field("Standard", description="The artistic style of the image.")
    aspect_ratio: Literal["1:1", "16:9", "9:16"] = Field("1:1", description="Aspect ratio for the image.")
    negative_prompt: str | None = Field(None, description="Elements to exclude from the image.")

def create_mega_prompt(req: ImageRequest) -> str:

    style_prompt = "" if req.style == "Standard" else f", in the style of {req.style}"
    quality_enhancers = ", 4K, hyper-detailed, cinematic lighting, trending on ArtStation, vibrant colors"
    
    mega_prompt = f"{req.prompt}{style_prompt}{quality_enhancers}"
    return mega_prompt

@router.post("/generate-image", dependencies=[Depends(get_current_user)])
async def generate_image_endpoint(req: ImageRequest = Body(...)):
    if not DEAPI_TOKEN:
        raise HTTPException(status_code=503, detail="DeAPI is not configured or available.")

    async with httpx.AsyncClient() as client:
        try:
            final_prompt = create_mega_prompt(req)
            print(f"Request DeAPI: {final_prompt}")

            headers = {
                "Authorization": f"Bearer {DEAPI_TOKEN}",
                "Accept": "application/json",
                "Content-Type": "application/json"
            }

            width, height = (512, 512) 
            if req.aspect_ratio == "16:9":
                width, height = (768, 432)
            elif req.aspect_ratio == "9:16":
                width, height = (432, 768)

            payload = {
                "prompt": final_prompt,
                "negative_prompt": req.negative_prompt,
                "model": DEAPI_MODEL_NAME,
                "loras": [], 
                "width": width,
                "height": height,
                "guidance": 7.5,
                "steps": 10,
                "seed": -1 
            }

            start_response = await client.post(f"{DEAPI_BASE_URL}/api/v1/client/txt2img", json=payload, headers=headers, timeout=30.0)
            start_response.raise_for_status()
            request_id = start_response.json()["data"]["request_id"]

            result_url = f"{DEAPI_BASE_URL}/api/v1/client/request-status/{request_id}"
            
            for i in range(40): 
                await asyncio.sleep(5) 
                status_response = await client.get(result_url, headers=headers, timeout=30.0)
                status_response.raise_for_status()
                status_data = status_response.json()["data"]
                current_status = status_data.get("status", "unknown")
                
                print(f"Попытка {i+1}/40: Статус для request_id {request_id} - '{current_status}'")

                if current_status == "done":
                    print("Image generation successful!")
                    image_url = status_data.get("result_url")
                    if not image_url:
                        raise HTTPException(status_code=500, detail="API returned 'done' status but no image URL.")
                    return JSONResponse(content={"imageUrl": image_url})
                elif current_status in ["failed", "error"]:
                    error_message = status_data.get("result", {}).get("message", "Unknown error during generation.")
                    raise HTTPException(status_code=500, detail=f"Image generation failed: {error_message}")

            raise HTTPException(status_code=408, detail="Image generation timed out.")

        except httpx.HTTPStatusError as e:
            error_text = e.response.text
            raise HTTPException(status_code=e.response.status_code, detail=f"Error from DeAPI: {error_text}")
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Service unavailable: Could not connect to DeAPI. {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")