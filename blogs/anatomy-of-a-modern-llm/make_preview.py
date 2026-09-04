from PIL import Image, ImageDraw, ImageFont
import os

W, H = 960, 540
BG=(15,19,23); INK=(228,234,238); DIM=(147,160,168); FAINT=(104,116,124)
LINE=(57,69,78); BOX=(22,29,36); BOX2=(27,36,44); GRID=(35,45,53)
ACC=(63,209,160); COOL=(90,178,232); WARM=(242,180,95); RED=(239,122,122); VIO=(180,140,232)

FD="/usr/share/fonts/truetype/dejavu/"
def F(n,s): return ImageFont.truetype(FD+n, s)
BOLD=lambda s: F("DejaVuSans-Bold.ttf", s)
REG =lambda s: F("DejaVuSans.ttf", s)
MONO=lambda s: F("DejaVuSansMono.ttf", s)
MONOB=lambda s: F("DejaVuSansMono-Bold.ttf", s)

# --- eight stages of the morph -------------------------------------------------
STAGES = [
    dict(label="2017  ·  the original decoder block",
         inp="token embedding  +  sinusoidal position",
         attn=("Multi-Head Attention", ["8 query heads · 8 KV heads", "dropout · bias terms"]),
         ffn =("Feed-forward network", ["ReLU · 2 matrices · d_ff = 4d", "dropout"]),
         normIn=None, normStream="LayerNorm", hi=None),
    dict(label="pre-norm  +  RMSNorm",
         inp="token embedding  +  learned position",
         attn=("Multi-Head Attention", ["8 query heads · 8 KV heads", "dropout · bias terms"]),
         ffn =("Feed-forward network", ["ReLU · 2 matrices · d_ff = 4d", "dropout"]),
         normIn="RMSNorm", normStream=None, hi="norm"),
    dict(label="RoPE  ·  position moves inside attention",
         inp="token embedding",
         attn=("Multi-Head Attention", ["8 query heads · 8 KV heads", "RoPE on Q and K"]),
         ffn =("Feed-forward network", ["ReLU · 2 matrices · d_ff = 4d", ""]),
         normIn="RMSNorm", normStream=None, hi="attn"),
    dict(label="SwiGLU  ·  the FFN learns to gate",
         inp="token embedding",
         attn=("Multi-Head Attention", ["8 query heads · 8 KV heads", "RoPE on Q and K"]),
         ffn =("SwiGLU feed-forward", ["SiLU gate ⊙ value · 3 matrices", "d_ff = 8d/3"]),
         normIn="RMSNorm", normStream=None, hi="ffn"),
    dict(label="grouped-query attention  ·  a smaller KV cache",
         inp="token embedding",
         attn=("Grouped-Query Attention", ["32 query heads · 8 KV heads", "RoPE on Q and K"]),
         ffn =("SwiGLU feed-forward", ["SiLU gate ⊙ value · 3 matrices", "d_ff = 8d/3"]),
         normIn="RMSNorm", normStream=None, hi="attn"),
    dict(label="QK-norm  +  sliding window attention",
         inp="token embedding",
         attn=("Grouped-Query Attention", ["32 Q heads · 8 KV heads · RoPE · QK-norm",
                                           "sliding window 4096 · 3 layers in 4"]),
         ffn =("SwiGLU feed-forward", ["SiLU gate ⊙ value · 3 matrices", "d_ff = 8d/3"]),
         normIn="RMSNorm", normStream=None, hi="attn"),
    dict(label="mixture of experts  ·  parameters without FLOPs",
         inp="token embedding",
         attn=("Grouped-Query Attention", ["32 Q heads · 8 KV heads · RoPE · QK-norm",
                                           "sliding window 4096 · 3 layers in 4"]),
         ffn =("Mixture of Experts", ["256 SwiGLU experts · top-8 routed", "+ 1 shared expert, always active"]),
         normIn="RMSNorm", normStream=None, hi="ffn"),
    dict(label="2026  ·  a frontier block",
         inp="token embedding",
         attn=("Grouped-Query Attention", ["32 Q heads · 8 KV heads · RoPE · QK-norm",
                                           "sliding window · output gate · sink logit"]),
         ffn =("Mixture of Experts", ["256 SwiGLU experts · top-8 routed", "+ 1 shared expert, always active"]),
         normIn="RMSNorm", normStream=None, hi=None),
]

def rr(d, xy, r, fill=None, outline=None, width=1):
    d.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=width)

def draw_stage(st, glow):
    """glow in 0..1 controls how strongly the changed component is highlighted."""
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)

    # faint grid
    for x in range(0, W, 48): d.line([(x,0),(x,H)], fill=(19,24,29))
    for y in range(0, H, 48): d.line([(0,y),(W,y)], fill=(19,24,29))

    d.text((40, 26), "ANATOMY OF A MODERN LLM", font=MONOB(13), fill=FAINT)
    d.text((40, 46), "one edit at a time, 2017 → 2026", font=REG(15), fill=DIM)

    SP, BX, BW = 150, 232, 640
    # input strip
    rr(d, (BX-58, 88, BX+BW, 122), 3, fill=BOX, outline=LINE)
    d.text((BX-44, 97), st["inp"], font=BOLD(14), fill=INK)
    d.line([(SP,122),(SP,150)], fill=LINE, width=3)

    def unit(y0, spec, key):
        title, lines = spec
        hi = (st["hi"] == key) or (st["hi"] == "norm" and st["normIn"])
        acc = ACC if st["hi"] == "norm" else COOL
        h = 30 + 19*len([l for l in lines if l])
        y = y0
        if st["normIn"]:
            nh = (st["hi"] == "norm")
            g = int(60*glow) if nh else 0
            rr(d, (BX, y, BX+BW, y+30), 3,
               fill=(23+g//3, 36+g//2, 32+g//3) if nh else BOX2,
               outline=ACC if nh else LINE, width=2 if nh else 1)
            d.text((BX+14, y+8), st["normIn"], font=MONOB(12), fill=ACC if nh else DIM)
            y += 40
        boxhi = (st["hi"] == key)
        g = int(70*glow) if boxhi else 0
        rr(d, (BX, y, BX+BW, y+h), 3,
           fill=(24+g//3, 36+g//2, 44+g//2) if boxhi else BOX,
           outline=COOL if boxhi else LINE, width=2 if boxhi else 1)
        d.text((BX+14, y+8), title, font=BOLD(16), fill=COOL if boxhi else INK)
        yy = y+31
        for l in lines:
            if not l: continue
            d.text((BX+14, yy), "· "+l, font=REG(12), fill=(205,224,234) if boxhi else DIM)
            yy += 19
        bot = y + h + 26
        # branch wiring
        d.line([(SP,y0),(BX-24,y0)], fill=LINE, width=2)
        d.line([(BX-24,y0),(BX-24,bot)], fill=LINE, width=2)
        d.line([(BX-24,bot),(SP+11,bot)], fill=LINE, width=2)
        d.line([(SP,y0),(SP,bot)], fill=ACC if st["hi"]=="norm" else LINE, width=4)
        d.ellipse((SP-11,bot-11,SP+11,bot+11), fill=BG, outline=LINE, width=2)
        d.text((SP-5,bot-10), "+", font=BOLD(16), fill=INK)
        y = bot
        if st["normStream"]:
            d.line([(SP,bot),(SP,bot+14)], fill=RED, width=4)
            rr(d, (SP-118, bot+14, SP+128, bot+44), 3, fill=(42,28,28), outline=RED, width=2)
            d.text((SP-106, bot+21), "LayerNorm  ·  on the residual path", font=MONOB(11), fill=RED)
            y = bot + 44
        return y + 26

    y = 150
    y = unit(y, st["attn"], "attn")
    d.line([(SP,y-26),(SP,y)], fill=LINE, width=4)
    y = unit(y, st["ffn"], "ffn")
    d.line([(SP,y-26),(SP,y+6)], fill=LINE, width=4)

    # label strip
    rr(d, (40, H-64, W-40, H-24), 3, fill=BOX, outline=(50,62,71))
    d.text((58, H-54), st["label"], font=BOLD(17), fill=WARM if st["hi"] else ACC)

    # progress rail
    idx = STAGES.index(st)
    for i in range(len(STAGES)):
        x = W-40-  (len(STAGES)-1-i)*22
        col = ACC if i == idx else ((44,74,66) if i < idx else (26,33,40))
        d.rounded_rectangle((x-14, 30, x-2, 42), radius=2, fill=col)
    return im

frames, durs = [], []
for st in STAGES:
    for glow, dur in ((1.0, 260), (0.55, 420), (0.0, 260)):
        frames.append(draw_stage(st, glow))
        durs.append(dur)

pal = frames[0].convert("P", palette=Image.ADAPTIVE, colors=48)
gif = [f.convert("RGB").quantize(palette=pal, dither=Image.NONE) for f in frames]
gif[0].save("preview.gif", save_all=True, append_images=gif[1:], duration=durs,
            loop=0, optimize=True, disposal=2)
print("gif frames", len(gif), "duration", sum(durs)/1000.0, "s", "size", os.path.getsize("preview.gif")/1e6, "MB")

# ---- poster -------------------------------------------------------------------
poster = draw_stage(STAGES[-1], 0.0)
poster.save("preview.png", optimize=True)
print("png", os.path.getsize("preview.png")/1e3, "KB", poster.size)
