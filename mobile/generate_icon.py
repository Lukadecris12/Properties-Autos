"""
Zero-dependency pure-Python PNG generator for PropertyHub Android launcher icons.
Replaces the default Flutter icon across all mipmap densities with the custom
PropertyHub Emerald & Gold luxury architectural crest and sets app label to "PropertyHub".
"""
import math
import os
import shutil
import struct
import zlib


def write_png(filepath: str, width: int, height: int, rgba_bytes: bytes) -> None:
    def make_chunk(chunk_type: bytes, data: bytes) -> bytes:
        chunk = chunk_type + data
        return struct.pack(">I", len(data)) + chunk + struct.pack(">I", zlib.crc32(chunk) & 0xFFFFFFFF)

    raw_data = bytearray()
    stride = width * 4
    for y in range(height):
        raw_data.append(0)  # Filter type 0 (None)
        row_start = y * stride
        raw_data.extend(rgba_bytes[row_start : row_start + stride])

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    compressed = zlib.compress(bytes(raw_data), level=9)

    with open(filepath, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(make_chunk(b"IHDR", ihdr))
        f.write(make_chunk(b"IDAT", compressed))
        f.write(make_chunk(b"IEND", b""))


def in_rounded_rect(nx: float, ny: float, x0: float, y0: float, x1: float, y1: float, r: float) -> bool:
    if nx < x0 or nx > x1 or ny < y0 or ny > y1:
        return False
    cx = min(max(nx, x0 + r), x1 - r)
    cy = min(max(ny, y0 + r), y1 - r)
    return (nx - cx) ** 2 + (ny - cy) ** 2 <= r ** 2


def render_propertyhub_icon(size: int) -> bytes:
    buf = bytearray(size * size * 4)

    for y in range(size):
        ny = (y + 0.5) / size
        for x in range(size):
            nx = (x + 0.5) / size
            idx = (y * size + x) * 4

            # 1. Check outer rounded square bounds
            if not in_rounded_rect(nx, ny, 0.04, 0.04, 0.96, 0.96, 0.20):
                buf[idx : idx + 4] = b"\x00\x00\x00\x00"
                continue

            # 2. Emerald outer border (#10B981)
            if not in_rounded_rect(nx, ny, 0.075, 0.075, 0.925, 0.925, 0.17):
                buf[idx : idx + 4] = bytes((16, 185, 129, 255))
                continue

            # 3. Default inner background: Luxury Obsidian (#0B0F19)
            r, g, b, a = 11, 15, 25, 255

            # 4. Subtle Emerald circular medallion in center (#064E3B)
            dist_center = math.hypot(nx - 0.5, ny - 0.5)
            if dist_center <= 0.36:
                r, g, b = 6, 78, 59
            elif dist_center <= 0.372:
                r, g, b = 16, 185, 129

            # 5. Gold Penthouse Roof Crown on Main Tower (#F59E0B)
            if 0.16 <= ny <= 0.25 and 0.27 <= nx <= 0.53:
                half_w = ((ny - 0.16) / (0.25 - 0.16)) * 0.13
                if abs(nx - 0.40) <= half_w:
                    r, g, b = 245, 158, 11

            # 6. Main Luxury Skyscraper Tower (Left-Center, Emerald #10B981)
            if 0.27 <= nx <= 0.53 and 0.25 <= ny <= 0.72:
                r, g, b = 16, 185, 129
                # Architectural Window Grid Cutouts
                for row in range(4):
                    wy0 = 0.29 + row * 0.10
                    wy1 = wy0 + 0.05
                    if wy0 <= ny <= wy1:
                        if (0.31 <= nx <= 0.38) or (0.42 <= nx <= 0.49):
                            r, g, b = 11, 15, 25

            # 7. Secondary Luxury Wing Tower (Right-Center, Gold #F59E0B)
            if 0.53 < nx <= 0.73 and 0.38 <= ny <= 0.72:
                r, g, b = 245, 158, 11
                for row in range(3):
                    wy0 = 0.42 + row * 0.095
                    wy1 = wy0 + 0.048
                    if wy0 <= ny <= wy1:
                        if (0.56 <= nx <= 0.62) or (0.65 <= nx <= 0.70):
                            r, g, b = 11, 15, 25

            # 8. Gold Foundation Pedestal Bar (#FBBF24)
            if in_rounded_rect(nx, ny, 0.21, 0.74, 0.79, 0.795, 0.02):
                r, g, b = 251, 191, 36

            buf[idx] = r
            buf[idx + 1] = g
            buf[idx + 2] = b
            buf[idx + 3] = a

    return bytes(buf)


def apply_android_branding(android_dir: str) -> None:
    res_dir = os.path.join(android_dir, "app", "src", "main", "res")
    manifest_path = os.path.join(android_dir, "app", "src", "main", "AndroidManifest.xml")

    sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }

    for folder, px in sizes.items():
        target_dir = os.path.join(res_dir, folder)
        os.makedirs(target_dir, exist_ok=True)
        rgba = render_propertyhub_icon(px)
        write_png(os.path.join(target_dir, "ic_launcher.png"), px, px, rgba)
        write_png(os.path.join(target_dir, "ic_launcher_round.png"), px, px, rgba)

    # Remove adaptive v26 XML overrides if present so Android always uses our custom PNG icons
    anydpi_dir = os.path.join(res_dir, "mipmap-anydpi-v26")
    if os.path.exists(anydpi_dir):
        shutil.rmtree(anydpi_dir)

    # Update AndroidManifest.xml label to "PropertyHub" and enable internet + cleartext traffic
    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            txt = f.read()

        txt = txt.replace('android:label="propertyhub_mobile"', 'android:label="Properties & Autos"')
        if "android.permission.INTERNET" not in txt:
            txt = txt.replace(
                "<application",
                '<uses-permission android:name="android.permission.INTERNET"/>\n    <application android:usesCleartextTraffic="true"',
                1,
            )
        with open(manifest_path, "w", encoding="utf-8") as f:
            f.write(txt)


if __name__ == "__main__":
    apply_android_branding("android")
    print("PropertyHub custom icon and Android branding applied successfully!")
