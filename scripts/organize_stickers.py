import shutil, os

sticker_map = {
    'public/stickers/sticker_12_.webp': 'public/stickers/metric-lessons.webp',
    'public/stickers/sticker_13_.webp': 'public/stickers/metric-time.webp',
    'public/stickers/sticker_14_.webp': 'public/stickers/metric-week.webp',
    'public/stickers/sticker_15_.webp': 'public/stickers/metric-streak.webp',
    'public/stickers/sticker_16_.webp': 'public/stickers/activity-upnext.webp',
    'public/stickers/sticker_17_.webp': 'public/stickers/activity-write.webp',
    'public/stickers/sticker_18_.webp': 'public/stickers/activity-game.webp',
    'public/stickers/sticker_1_.webp': 'public/stickers/nav-dashboard.webp',
    'public/stickers/sticker_2_.webp': 'public/stickers/nav-roadmap.webp',
    'public/stickers/sticker_3_.webp': 'public/stickers/nav-tutor.webp',
    'public/stickers/sticker_4_.webp': 'public/stickers/nav-practice.webp',
    'public/stickers/sticker_5_.webp': 'public/stickers/nav-games.webp',
    'public/stickers/sticker_6_.webp': 'public/stickers/nav-stats.webp',
    'public/stickers/sticker_7_.webp': 'public/stickers/nav-account.webp',
}

for src, dst in sticker_map.items():
    if os.path.exists(src):
        shutil.copyfile(src, dst)
        print(f"Copied {src} -> {dst}")
