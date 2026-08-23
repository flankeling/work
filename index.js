const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = "8080";
const pwd = __dirname;
const filePath = path.join(pwd, '.npm');

if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
}

// 【重要】这里写死一个UUID，以后重启绝对不会变！
const generated_uuid = "3b1f8b13-a827-49e3-8a40-b9978b7bc4c6";

console.log(`当前固定 UUID: ${generated_uuid}`);

const templateFile = 'config.template.json';
const configFile = 'config.json';
if (fs.existsSync(templateFile)) {
    let content = fs.readFileSync(templateFile, 'utf8');
    content = content.replace('YOUR_UUID_PLACEHOLDER', generated_uuid);
    fs.writeFileSync(configFile, content);
    console.log("已根据固定UUID生成最终的config.json");
}

console.log(`启动 VLESS+WS 监听内部端口: ${PORT}`);
function startSingBox() {
    const child = spawn('sing-box', ['run', '-c', 'config.json'], { stdio: 'inherit' });
    child.on('exit', (code) => {
        console.log(`sing-box 退出代码: ${code}，5秒后自动重启...`);
        setTimeout(startSingBox, 5000);
    });
    child.on('error', (err) => {
        console.error("无法启动 sing-box: ", err.message);
        setTimeout(startSingBox, 5000);
    });
}
startSingBox();
