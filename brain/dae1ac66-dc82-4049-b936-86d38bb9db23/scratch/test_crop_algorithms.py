import sys
import os
import glob
import cv2
import numpy as np

sys.path.append(r"c:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend")

folder = r"c:\Users\marco\Desktop\INVESTIGACION\tesis_deterioro_cognitivo\backend\uploads\pacientes\relojes"
files = glob.glob(os.path.join(folder, "*.*"))

# Filter to files larger than 60KB
files = [f for f in files if os.path.getsize(f) > 60000]
files.sort(key=os.path.getmtime, reverse=True)

def crop_original(img_bgr):
    try:
        h_img, w_img = img_bgr.shape[:2]
        img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        img_eq = clahe.apply(img_gray)
        img_blur = cv2.GaussianBlur(img_eq, (5, 5), 0)
        _, thresh = cv2.threshold(img_blur, 180, 255, cv2.THRESH_BINARY)
        contornos, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contornos:
            return None
        c_max = max(contornos, key=cv2.contourArea)
        return cv2.boundingRect(c_max)
    except Exception as e:
        return str(e)

def crop_otsu_on_raw(img_bgr):
    try:
        h_img, w_img = img_bgr.shape[:2]
        img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        img_blur = cv2.GaussianBlur(img_gray, (5, 5), 0)
        # Use Otsu's thresholding
        _, thresh = cv2.threshold(img_blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        contornos, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contornos:
            return None
        c_max = max(contornos, key=cv2.contourArea)
        return cv2.boundingRect(c_max)
    except Exception as e:
        return str(e)

def crop_adaptive_threshold(img_bgr):
    try:
        h_img, w_img = img_bgr.shape[:2]
        img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        img_blur = cv2.GaussianBlur(img_gray, (5, 5), 0)
        thresh = cv2.adaptiveThreshold(img_blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 51, 10)
        contornos, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contornos:
            return None
        c_max = max(contornos, key=cv2.contourArea)
        return cv2.boundingRect(c_max)
    except Exception as e:
        return str(e)

print(f"{'Filename':<35} | {'Original Size':<15} | {'Original Crop':<15} | {'Otsu Crop':<15} | {'Adaptive Crop':<15}")
print("-" * 105)

for f in files:
    name = os.path.basename(f)
    img = cv2.imread(f)
    if img is None:
        continue
    h, w = img.shape[:2]
    orig_sz = f"{w}x{h}"
    
    bbox_orig = crop_original(img)
    bbox_otsu = crop_otsu_on_raw(img)
    bbox_adap = crop_adaptive_threshold(img)
    
    orig_str = f"{bbox_orig[2]}x{bbox_orig[3]}" if bbox_orig and isinstance(bbox_orig, tuple) else "None"
    otsu_str = f"{bbox_otsu[2]}x{bbox_otsu[3]}" if bbox_otsu and isinstance(bbox_otsu, tuple) else "None"
    adap_str = f"{bbox_adap[2]}x{bbox_adap[3]}" if bbox_adap and isinstance(bbox_adap, tuple) else "None"
    
    print(f"{name:<35} | {orig_sz:<15} | {orig_str:<15} | {otsu_str:<15} | {adap_str:<15}")
