# Bao cao du an: He thong WebRTC Group Call (Room + Mesh + TURN)

Du an nay tap trung vao viec nang cap ung dung WebRTC co ban len mot he thong ho tro goi video nhom theo mo hinh Mesh Topology, cho phep quan ly phong va ho tro ket noi qua Internet thong qua TURN Server.

---

## 1. Thiet lap HTTPS (Tao chung chi SSL)
WebRTC bat buoc phai chay tren giao thuc HTTPS de trinh duyet cap quyen truy cap vao thiet bi Camera va Microphone.

Thuc hien cac lenh sau trong Terminal tai thu muc goc cua du an:

1. Tao thu muc luu tru chung chi:
   mkdir certs

2. Tao chung chi tu ky (self-signed certificate) bang OpenSSL:
   openssl req -newkey rsa:2048 -nodes -keyout certs/key.pem -x509 -days 365 -out certs/cert.pem

Luu y: Ban co the nhan Enter lien tuc de bo qua cac thong tin chi tiet khi duoc hoi. Ket qua se co 2 file key.pem va cert.pem trong thu muc certs.

---

## 2. Cach chay Signaling Server
Signaling Server su dung Node.js va WebSocket de dieu phoi ket noi giua cac thanh vien trong cung mot phong (Room).

1. Cai dat cac thu vien phu thuoc:
   npm install express ws https fs path

2. Khoi dong server:
   node server.js

3. Dia chi truy cap mac dinh: https://localhost:3000.

---

## 3. Cach chay TURN Server (Coturn qua Docker)
De ho tro ket noi khi thiet bi nam o cac mang khac nhau (nhu 4G va Wi-Fi), chung ta can trien khai Coturn lam tram trung chuyen du lieu video.

1. Mo Docker Desktop tren Mac M1.

2. Chay lenh khoi tao container Coturn:
   docker run -d --name my-coturn -p 3478:3478 -p 3478:3478/udp \
       coturn/coturn \
       --listening-port=3478 \
       --fingerprint \
       --lt-cred-mech \
       --user=user123:password123 \
       --realm=my-webrtc-app \
       --log-file=stdout

3. Thong tin cau hinh trong ung dung:
   - User: user123
   - Credential: password123
   - Port: 3478

---

## 4. Huong dan thu nghiem (Testing)

### A. Goi doi (1-1)
- Truy cap vao dia chi IP cua may Mac (vi du: https://192.168.1.15:3000) tren ca hai thiet bi.
- Nguoi dung A: Nhap ten, ma phong "lab1" va nhan Tham gia.
- Nguoi dung B: Nhap ten khac, cung ma phong "lab1" va nhan Tham gia.
- Kiem tra: Hai ben phai thay video cua nhau va hien thi trang thai connected.

### B. Goi nhom (3-4 nguoi)
- Mo them cac tab trinh duyet hoac thiet bi khac va gia nhap cung ma phong "lab1".
- He thong su dung mo hinh Mesh: Moi thanh vien moi vao se tu dong thiet lap ket noi toi tat ca cac thanh vien hien co trong phong.
- Giao dien Grid se tu dong chia o de hien thi day du video cua moi nguoi.

### C. Kiem tra tinh nang roi phong
- Khi mot nguoi nhan Ket thuc cuoc goi, server se gui thong bao member-left den cac thanh vien con lai.
- Cac may khach se tu dong dong ket noi va xoa khung video tuong ung ma khong anh huong den nhung nguoi con lai trong cuoc goi.

---

## 5. Cau truc du an
- server.js: Signalling Server xu ly logic phong va chuyen tiep tin nhan.
- public/index.html: Giao dien nguoi dung va logic WebRTC phia client.
- certs/: Thu muc chua chung chi SSL bao mat.