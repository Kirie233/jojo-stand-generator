from PIL import Image
import os

def create_wallpaper():
    # Assets
    left_path = "public/assets/bg_stands_left_group.png"
    right_path = "public/assets/bg_stands_right_group_huge.png"
    output_path = "public/assets/bg_full_integrated.png"

    # Target Size (2560x1440 QHD for high res)
    W, H = 2560, 1440
    # Background Color: Pure White (to work with Multiply blend mode)
    canvas = Image.new("RGB", (W, H), (255, 255, 255))

    try:
        # Load Images
        img_left = Image.open(left_path).convert("RGBA")
        img_right = Image.open(right_path).convert("RGBA")

        # Resize logic
        # We want them to fill the height mostly, and stick to the sides
        
        # Left Image Processing
        # Maintain aspect ratio, height = 100% (1440)
        l_ratio = img_left.width / img_left.height
        l_h = H
        l_w = int(l_h * l_ratio)
        img_left = img_left.resize((l_w, l_h), Image.Resampling.LANCZOS)
        
        # Right Image Processing
        # Maintain aspect ratio, height = 100% (1440)
        r_ratio = img_right.width / img_right.height
        r_h = H
        r_w = int(r_h * r_ratio)
        img_right = img_right.resize((r_w, r_h), Image.Resampling.LANCZOS)

        # Paste Left (Anchor Left)
        # We paste it using alpha channel as mask if needed, but since we are on white canvas 
        # and these are "Purple on White" (or transparent), we need to handle that.
        # If they are Flat Images (no alpha), we just paste.
        # Assuming they might be white-bg JPEGs converted to PNG.
        # If they have white background, simply pasting overlaps. 
        # BUT, the user wants "One Picture".
        # If I paste a white-bg image on top of white canvas, it's fine.
        canvas.paste(img_left, (0, 0)) # Left aligned

        # Paste Right (Anchor Right)
        # Calculate x position
        r_x = W - r_w
        canvas.paste(img_right, (r_x, 0)) # Right aligned
        
        # Save
        canvas.save(output_path)
        print(f"Successfully created {output_path}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_wallpaper()
