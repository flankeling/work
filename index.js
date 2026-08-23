const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = "8080"; // 写死内部端口
const pwd = __dirname;
const filePath = path.join(pwd, '.npm');

// 创建目录
if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
}

// 清理日志
try {
    fs.readdirSync(filePath).forEach(file => {
        if (file.startsWith('sb_') || file.includes('debug')) {
            fs.unlinkSync(path.join(filePath, file));
        }
    });
} catch (e) {}

// 自动生成并保存 UUID
const uuidFile = path.join(filePath, 'uuid.txt');
let generated_uuid;
if (fs.existsSync(uuidFile)) {
    generated_uuid = fs.readFileSync(uuidFile, 'utf8').trim();
}
if (!generated_uuid) {
    generated_uuid = crypto.randomUUID();
    fs.writeFileSync(uuidFile, generated_uuid, { mode: 0o600 });
}
console.log(`当前 UUID: ${generated_uuid}`);

// 读取模板并生成 config.json
const templateFile = 'config.template.json';
const configFile = 'config.json';
if (fs.existsSync(templateFile)) {
    let content = fs.readFileSync(templateFile, 'utf8');
    content = content.replace('YOUR_UUID_PLACEHOLDER', generated_uuid);
    fs.writeFileSync(configFile, content);
    console.log("已根据UUID生成最终的config.json");
} else {
    console.log("提示：未找到 config.template.json，将直接使用现有的 config.json");
}

// 保活运行 sing-box
console.log(`启动 VLESS+WS 监听内部端口: ${PORT}`);
function startSingBox() {
    // 后台运行 sing-box
    const child = spawn('sing-box', ['run', '-c', 'config.json'], { stdio: 'inherit' });

    child.on('exit', (code) => {
        console.log(`sing-box 退出代码: ${code}，5秒后自动重启...`);
        setTimeout(startSingBox, 5000);
    });

    child.on('error', (err) => {
        console.error("无法启动 sing-box: ", err.message);
        if (err.code === 'ENOENT') {
            console.error("致命错误：找不到 sing-box 二进制文件！请确保 Dockerfile 配置正确。");
            process.exit(1);
        }
        setTimeout(startSingBox, 5000);
    });
}

startSingBox();
