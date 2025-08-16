let lastCtrlPressTime = 0;
const DOUBLE_PRESS_DELAY = 300; // 毫秒

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Control" ||
    event.code === "ControlLeft" ||
    event.code === "ControlRight"
  ) {
    const currentTime = Date.now();

    // 检查是否是双击
    if (currentTime - lastCtrlPressTime < DOUBLE_PRESS_DELAY) {
      // 双击Ctrl检测到
      showSelectedText();
      event.preventDefault(); // 防止默认行为
    }

    lastCtrlPressTime = currentTime;
  }
});

// 快捷键触发翻译
async function showSelectedText() {
  let selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    // 创建弹窗元素
    const popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.maxWidth = "800px";
    popup.style.maxHeight = "500px";
    popup.style.overflowY = "auto";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.backgroundColor = "white";
    popup.style.border = "1px solid #ccc";
    popup.style.padding = "10px 20px 15px";
    popup.style.borderRadius = "5px";
    popup.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    popup.style.zIndex = "999999";

    // 检测翻译前语言
    const detector = await LanguageDetector.create();
    const results = await detector.detect(selectedText);
    const detectedLanguage = results.length
      ? results[0].detectedLanguage
      : "en";

    let result = "";
    const startTime = Date.now(); // 计算翻译耗时
    const translator = await Translator.create({
      sourceLanguage: detectedLanguage,
      targetLanguage: detectedLanguage === "zh" ? "en" : "zh",
    });
    const stream = translator.translateStreaming(selectedText);
    for await (const chunk of stream) {
      result += chunk;
    }
    selectedText = result;

    // 添加翻译耗时弹窗
    const timeConsumed = Date.now() - startTime;
    const timeConsumedElement = document.createElement("a");
    timeConsumedElement.style.color = "#999";
    timeConsumedElement.style.fontSize = "12px";
    timeConsumedElement.style.textDecoration = "none";
    timeConsumedElement.style.marginBottom = "10px";
    timeConsumedElement.style.marginRight = "20px";
    timeConsumedElement.textContent = `翻译耗时：${timeConsumed}ms`;
    popup.appendChild(timeConsumedElement);

    // 添加项目地址
    const linkElement = document.createElement("a");
    linkElement.href = "https://github.com/laoxiu001/chorme-translator-crx";
    linkElement.target = "_blank";
    linkElement.textContent = "项目地址";
    // linkElement.style.color = "#007bff";
    linkElement.style.textDecoration = "none";
    linkElement.style.marginBottom = "12px";
    popup.appendChild(linkElement);

    // 添加翻译结果
    const textElement = document.createElement("div");
    textElement.textContent = selectedText;
    textElement.style.fontSize = "16px";
    textElement.style.whiteSpace = "pre-wrap";
    popup.appendChild(textElement);

    // 点击空白区域关闭弹框
    document.addEventListener("click", (event) => {
      if (event.target !== popup && event.target !== textElement && event.target !== timeConsumedElement) {
        document.body.removeChild(popup);
      }
    });

    document.body.appendChild(popup);
  }
}
