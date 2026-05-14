# 🎂 Birthday Surprise Website

เว็บเซอไพรซ์วันเกิดสุดน่ารัก สร้างด้วย Next.js 15 + Framer Motion

## ✏️ สิ่งที่ต้องแก้ก่อน Deploy

### 1. รหัสผ่าน
ไฟล์: `src/app/components/LockScreen.tsx` บรรทัดที่ 8
```ts
const CORRECT_CODE = '140550'  // เปลี่ยนเป็น DDMMYY วันเกิดแฟน
```

### 2. ข้อความในจดหมาย
ไฟล์: `src/app/components/BirthdayLetter.tsx` บรรทัดที่ 10-15
```ts
const LETTER_PARAGRAPHS = [
  "ถึงคนที่ฉันรักที่สุด...",  // ✏️ แก้ข้อความได้เลย
  ...
]
```

### 3. โหมดเป่าเทียน
ไฟล์: `src/app/components/CakeExperience.tsx` บรรทัดที่ 12
```ts
const BLOW_MODE: 'camera' | 'countdown' = 'camera'
// เปลี่ยนเป็น 'countdown' ถ้าไม่อยากใช้ไมค์
```

---

## 🚀 วิธีรัน Local

```bash
npm install
npm run dev
```
เปิด http://localhost:3000

## 🌐 Deploy บน Vercel (ฟรี!)

1. Push โค้ดขึ้น GitHub
2. ไปที่ [vercel.com](https://vercel.com) → Import project
3. กด Deploy — เสร็จ! ได้ URL มาแล้ว
4. เอา URL ไปทำ QR Code ที่ [qr-code-generator.com](https://www.qr-code-generator.com)

## 🌐 Deploy บน Netlify

```bash
npm run build
# อัปโหลด folder .next ขึ้น Netlify
```

---

## 📱 Flow ของเว็บ

```
Lock Screen (รหัส DDMMYY)
    ↓
Card Selection
  ├── 🎂 Cake → เป่าเทียน → 💌 จดหมาย → 📸 Photobooth → 🎉 Gallery
  └── 📸 Photobooth (ล็อก จนกว่าจะเป่าเค้ก)
```

## 🗂️ โครงสร้างไฟล์

```
src/app/
├── page.tsx                  # หน้าหลัก
├── layout.tsx                # Layout + fonts
├── globals.css               # Styles
├── store/
│   └── appStore.ts           # Zustand state
└── components/
    ├── LockScreen.tsx         # หน้าใส่รหัส
    ├── CardSelection.tsx      # เลือก cake/photobooth
    ├── CakeExperience.tsx     # ประสบการณ์เป่าเค้ก
    ├── CakeSVG.tsx            # ภาพเค้กแอนิเมชัน
    ├── CameraBlowDetector.tsx # ตรวจจับการเป่าผ่านไมค์
    ├── CountdownBlowMode.tsx  # โหมดนับถอยหลัง
    ├── BirthdayLetter.tsx     # จดหมายวันเกิด
    ├── PhotoBooth.tsx         # ถ่ายรูป 4 ใบ
    ├── FinalGallery.tsx       # หน้าสุดท้าย
    ├── FloatingParticles.tsx  # พาร์ติเคิลพื้นหลัง
    ├── MusicPlayer.tsx        # ปุ่มเปิด/ปิดเพลง
    └── ConfettiBlast.tsx      # เอฟเฟกต์กระดาษสี
```
