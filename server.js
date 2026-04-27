const fs = require('fs');
const https = require('https');
const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();

// 1. Tải chứng chỉ SSL từ thư mục certs (Yêu cầu để chạy HTTPS trên trình duyệt)
const options = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem')
};

// Phục vụ các file giao diện từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// 2. Tạo HTTPS Server
const server = https.createServer(options, app);

// 3. Khởi tạo WebSocket Server
const wss = new WebSocket.Server({ server });

/**
 * Cấu trúc dữ liệu quản lý phòng:
 * rooms = {
 * 'ten_phong': [
 * { id: 'uuid_1', name: 'An', ws: socket_1 },
 * { id: 'uuid_2', name: 'Bình', ws: socket_2 }
 * ]
 * }
 */
const rooms = {};

wss.on('connection', (ws) => {
    // Thông tin định danh tạm thời cho mỗi kết nối
    let clientInfo = {
        id: Math.random().toString(36).substring(7),
        name: '',
        roomId: ''
    };

    console.log(`Kết nối mới: ${clientInfo.id}`);

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);

            switch (message.type) {
                case 'join':
                    // Xử lý khi người dùng tham gia phòng
                    clientInfo.name = message.name;
                    clientInfo.roomId = message.roomId;

                    if (!rooms[clientInfo.roomId]) {
                        rooms[clientInfo.roomId] = [];
                    }

                    // Gửi danh sách các thành viên HIỆN CÓ trong phòng cho người mới vào
                    const currentMembers = rooms[clientInfo.roomId].map(m => ({
                        id: m.id,
                        name: m.name
                    }));
                    ws.send(JSON.stringify({ type: 'room-members', members: currentMembers }));

                    // Thêm người mới này vào danh sách phòng
                    rooms[clientInfo.roomId].push({
                        id: clientInfo.id,
                        name: clientInfo.name,
                        ws: ws
                    });

                    // Thông báo cho những người ĐANG Ở TRONG PHÒNG là có người mới vào
                    broadcastToRoom(clientInfo.roomId, {
                        type: 'member-joined',
                        id: clientInfo.id,
                        name: clientInfo.name
                    }, clientInfo.id);
                    
                    console.log(`${clientInfo.name} đã vào phòng: ${clientInfo.roomId}`);
                    break;

                case 'offer':
                case 'answer':
                case 'candidate':
                    // Chuyển tiếp tín hiệu (Signaling) đến đúng người nhận (target)
                    const targetUser = findUser(clientInfo.roomId, message.target);
                    if (targetUser && targetUser.ws.readyState === WebSocket.OPEN) {
                        targetUser.ws.send(JSON.stringify({
                            ...message,
                            sender: clientInfo.id, // Gửi kèm ID của mình để người nhận biết ai gọi
                            senderName: clientInfo.name
                        }));
                    }
                    break;

                case 'leave':
                    handleDisconnect(ws, clientInfo);
                    break;
            }
        } catch (err) {
            console.error("Lỗi xử lý tin nhắn:", err);
        }
    });

    ws.on('close', () => {
        handleDisconnect(ws, clientInfo);
    });

    ws.on('error', (err) => {
        console.error("Lỗi WebSocket:", err);
    });
});

// Hàm tìm kiếm người dùng trong một phòng cụ thể
function findUser(roomId, userId) {
    if (!rooms[roomId]) return null;
    return rooms[roomId].find(user => user.id === userId);
}

// Hàm gửi tin nhắn cho tất cả thành viên trong phòng (ngoại trừ người gửi)
function broadcastToRoom(roomId, message, excludeId) {
    if (!rooms[roomId]) return;
    rooms[roomId].forEach(client => {
        if (client.id !== excludeId && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
        }
    });
}

// Xử lý khi người dùng thoát hoặc mất kết nối
function handleDisconnect(ws, info) {
    if (rooms[info.roomId]) {
        // Loại bỏ người dùng khỏi mảng danh sách phòng
        rooms[info.roomId] = rooms[info.roomId].filter(user => user.id !== info.id);
        
        // Thông báo cho mọi người trong phòng là người này đã rời đi
        broadcastToRoom(info.roomId, {
            type: 'member-left',
            id: info.id,
            name: info.name
        }, info.id);

        // Nếu phòng không còn ai, xóa luôn phòng để tiết kiệm bộ nhớ
        if (rooms[info.roomId].length === 0) {
            delete rooms[info.roomId];
        }
    }
    console.log(`Người dùng rời đi: ${info.name || info.id}`);
}

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log('------------------------------------------');
    console.log(`Server Signaling đang chạy tại cổng: ${PORT}`);
    console.log(`Truy cập: https://localhost:${PORT}`);
    console.log('------------------------------------------');
});