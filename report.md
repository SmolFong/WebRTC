# BAO CAO KET QUA NANG CAP HE THONG WEBRTC CALL
# (TURN + ROOM + GROUP CALL)

## 1. Mo ta kien truc he thong
He thong duoc xay dung dua tren kien truc Mesh Topology de ho tro goi nhom. Cac thanh phan chinh bao gom:

* **Signaling Server**: Su dung Node.js, Express va WebSocket de dieu phoi viec trao doi tin nhan giua cac peer. Server ho tro HTTPS de dam bao bao mat va cho phep truy cap thiet bi media.
* **WebRTC Client**: Chay tren trinh duyet, su dung WebRTC API de thiet lap ket noi P2P va hien thi video theo dang luoi (Grid).
* **TURN Server**: Trien khai bang Coturn thong qua Docker de ho tro chuyen tiep du lieu video khi ket noi P2P truc tiep bi chan boi NAT hoac Firewall.
* **Kien truc Mesh**: Moi thanh vien trong phong se thiet lap n-1 ket noi RTCPeerConnection den cac thanh vien con lai.

## 2. Dinh nghia giao thuc Signaling
Cac tin nhan Signaling duoc trao doi duoi dang JSON thong qua WebSocket de quan ly trang thai cuoc goi:

* **join**: { "type": "join", "roomId": "id_phong", "name": "ten_user" } - Tham gia vao mot phong cu the.
* **room-members**: { "type": "room-members", "members": [] } - Server gui danh sach thanh vien hien co cho nguoi moi vao.
* **offer**: { "type": "offer", "target": "id_nguoi_nhan", "offer": sdp } - Gui de nghi ket noi den mot peer cu the .
* **answer**: { "type": "answer", "target": "id_nguoi_nhan", "answer": sdp } - Phan hoi de nghi ket noi .
* **candidate**: { "type": "candidate", "target": "id_nguoi_nhan", "candidate": ice } - Trao doi thong tin duong di mang .
* **member-left**: { "type": "member-left", "id": "id_user" } - Thong bao khi mot thanh vien roi phong .

## 3. Ket qua thu nghiem P2P va TURN

### 3.1. Thu nghiem trong cung mang LAN
* **Kich ban**: Hai thiet bi (MacBook va dien thoai) ket noi chung mot mang Wi-Fi.
* **Ket qua**: Ket noi P2P thiet lap thanh cong nhanh chong.
* **Loai Candidate**: HOST (Ket noi truc tiep bang dia chi IP noi bo) .
* **ICE Connection State**: connected / completed .

### 3.2. Thu nghiem khac mang (Dung 4G va TURN)
* **Kich ban**: Mot thiet bi dung Wi-Fi, mot thiet bi dung 4G. Do NAT khac nhau, P2P truc tiep gap kho khan .
* **Ket qua**: He thong tu dong chuyen sang su dung TURN Server (Relay) sau khi ket noi truc tiep khong thanh cong .
* **Loai Candidate**: RELAY (Du lieu di xuyen qua Coturn Server) .
* **Trang thai he thong**: Hien thi canh bao "P2P failed, trying TURN..." truoc khi ket noi duoc thiet lap thanh cong qua relay .

## 4. Thong ke va Log he thong
Moi cuoc goi duoc theo doi chat che thong qua ham getStats() cua RTCPeerConnection :

* **Connection State**: Theo doi cac trang thai new, connecting, connected, disconnected, failed .
* **ICE Candidate Selection**: He thong tu dong uu tien lua chon ung vien tot nhat (Host > Srflx > Relay) .
* **Group Call Performance**: Thu nghiem voi nhom 3-4 nguoi cho thay bang thong va tai tai nguyen tang theo so luong ket noi nhung van duy tri duoc on dinh tren thiet bi Mac M1 .

## 5. Ket luan
He thong da hoan thanh day du cac muc tieu de ra: ho tro quan ly phong, goi nhom mesh on dinh va trien khai thanh cong TURN Server de ho tro ket noi qua Internet . Viec su dung Docker de chay Coturn giup qua trinh trien khai tro nen linh hoat va de dang quan ly .