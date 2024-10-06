const CryptoJS = require('crypto-js');
const readline = require('readline');
const fs = require('fs');

// Tạo interface để đọc đầu vào từ người dùng
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Hàm để hỏi người dùng và nhận đầu vào
const askQuestion = (query) => {
    return new Promise(resolve => rl.question(query, resolve));
};

// Hàm để tạo khóa ngẫu nhiên
const generateRandomKey = (length) => {
    return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
};

(async () => {
    // Nhập đoạn mã và khóa bí mật từ người dùng
    const secretMessage = await askQuestion('Nhập đoạn mã cần mã hóa: ');
    let secretKey = await askQuestion('Nhập khóa bí mật (16, 24, hoặc 32 ký tự, hoặc để trống để tạo khóa ngẫu nhiên): ');

    // Nếu người dùng không nhập khóa, tạo khóa ngẫu nhiên
    if (!secretKey) {
        const keyLength = 32; // Đặt độ dài khóa mặc định là 32 bytes
        secretKey = generateRandomKey(keyLength);
        console.log(`Khóa ngẫu nhiên được tạo: ${secretKey}`);

        // Lưu khóa bí mật ra tệp txt
        const filePath = 'secretKey.txt';
        fs.writeFileSync(filePath, secretKey);
        console.log(`Khóa bí mật đã được lưu vào tệp ${filePath}`);
    } else {
        // Đọc khóa từ tệp nếu người dùng không nhập khóa
        const filePath = 'secretKey.txt';
        if (fs.existsSync(filePath)) {
            secretKey = fs.readFileSync(filePath, 'utf8').trim();
            console.log(`Khóa bí mật được đọc từ tệp: ${secretKey}`);
        }
    }

    // Kiểm tra độ dài của khóa bí mật
    const keyLengthInBytes = secretKey.length / 2; // Chia cho 2 vì khóa được mã hóa dưới dạng hex
    console.log(`Độ dài khóa (bytes): ${keyLengthInBytes}`); // Debugging statement
    console.log(`Khóa bí mật: ${secretKey}`); // Debugging statement

    if (![16, 24, 32].includes(keyLengthInBytes)) {
        console.error('Khóa bí mật phải có độ dài 16, 24, hoặc 32 bytes.');
    } else {
        // Tạo IV ngẫu nhiên
        const iv = CryptoJS.lib.WordArray.random(16);

        
        const encryptedMessage = CryptoJS.AES.encrypt(secretMessage, CryptoJS.enc.Hex.parse(secretKey), { iv: iv }).toString();
        console.log('Encrypted Message:', encryptedMessage);

        
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedMessage, CryptoJS.enc.Hex.parse(secretKey), { iv: iv });
            const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
            console.log('Decrypted Message:', decryptedMessage);
        } catch (error) {
            console.error('Lỗi khi giải mã:', error);
        }
    }

    
    rl.close();
})();