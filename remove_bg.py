from PIL import Image, ImageDraw
import os

def aggressive_clean(input_path, output_path):
    if not os.path.exists(input_path):
        return

    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # 1. Flood fill from corners to catch the major background areas
    # We do this for all 4 corners
    for corner in [(0,0), (width-1, 0), (0, height-1), (width-1, height-1)]:
        # Get color at corner
        corner_color = img.getpixel(corner)
        # Use floodfill to make the connected background transparent
        # We need to be careful not to eat the object if it touches the edge
        # But for these icons, they usually have space.
        ImageDraw.floodfill(img, corner, (255, 255, 255, 0), thresh=50)

    # 2. Second pass: Remove anything that is still very white/grey
    # to catch floating islands of noise
    datas = img.getdata()
    newData = []
    for item in datas:
        r, g, b, a = item
        if a == 0:
            newData.append(item)
            continue
            
        # If it's very close to white/light grey, it's likely part of the original background
        if r > 150 and g > 150 and b > 150 and abs(r-g) < 20 and abs(g-b) < 20:
             newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
    
    img.putdata(newData)
    
    # 3. Final Crop to avoid extra space
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print(f"Aggressively Cleaned: {output_path}")

images = [
    ("C:/Users/devel/.gemini/antigravity/brain/8b38b9b1-6af6-4c6f-a57b-984c34c1e162/uploaded_media_0_1769612276277.png", "public/accessories/glass_cat.png"),
    ("C:/Users/devel/.gemini/antigravity/brain/8b38b9b1-6af6-4c6f-a57b-984c34c1e162/uploaded_media_1_1769612276277.png", "public/accessories/glass_puppy.png"),
    ("C:/Users/devel/.gemini/antigravity/brain/8b38b9b1-6af6-4c6f-a57b-984c34c1e162/uploaded_media_2_1769612276277.png", "public/accessories/glass_simple.png"),
    ("C:/Users/devel/.gemini/antigravity/brain/8b38b9b1-6af6-4c6f-a57b-984c34c1e162/uploaded_media_3_1769612276277.png", "public/accessories/glass_wings.png")
]

for inp, outp in images:
    aggressive_clean(inp, outp)
