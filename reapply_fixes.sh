#!/bin/bash
# 1. Update Preview.tsx
sed -i 's/className={`ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-\[11px\] transition ${/className={`ml-auto inline-flex items-center justify-center rounded-full border size-8 transition ${/' components/chat/preview.tsx
sed -i 's/type="button"/type="button"\n          title={isGhostModeEnabled ? "Mode Fant\u00f4me actif" : "Mode Fant\u00f4me"}/' components/chat/preview.tsx
sed -i 's/<Ghost className="size-3.5" \/>/<Ghost className="size-4" \/>/' components/chat/preview.tsx
sed -i 's/{isGhostModeEnabled ? "Mode Fantôme actif" : "Mode Fantôme"}//' components/chat/preview.tsx
sed -i 's/<p className="mt-2 text-xs text-purple-300">/<> <p className="mt-2 text-sm font-medium text-purple-300"> Mode Fant\u00f4me <\/p> <p className="mt-1 text-xs text-purple-300\/80">/' components/chat/preview.tsx
sed -i 's/Le prochain message ne sera pas enregistré dans l'\''historique.\n            <\/p>/Le prochain message ne sera pas enregistr\u00e9 dans l'\''historique.\n            <\/p> <\/>/' components/chat/preview.tsx

# 2. Update Home Notifications
sed -i 's/className="fixed top-3 left-1\/2 z-30 -translate-x-1\/2"/className="fixed top-3 left-1\/2 z-30 flex -translate-x-1\/2 flex-col items-center"/' components/chat/home-notifications.tsx
sed -i 's/className="liquid-glass mt-2 ml-auto w-\[320px\] rounded-2xl border border-border\/50 bg-card\/80 p-3 shadow-\[var(--shadow-float)\] backdrop-blur-xl"/className="liquid-glass absolute top-12 mt-2 w-[320px] rounded-2xl border border-border\/50 bg-card\/80 p-3 shadow-[var(--shadow-float)] backdrop-blur-xl"/' components/chat/home-notifications.tsx

# 3. Update Pricing
sed -i 's/price: 23,/price: 4.99,/' app/\(chat\)/pricing/page.tsx
sed -i 's/price: 49,/price: 11.99,/' app/\(chat\)/pricing/page.tsx
sed -i 's/price: 89,/price: 19.99,/' app/\(chat\)/pricing/page.tsx
sed -i 's/"mAIMax"/"Max"/g' app/\(chat\)/pricing/page.tsx
sed -i 's/mAIMax/Max/g' app/\(chat\)/pricing/page.tsx
