let lastCtrlPressTime = 0;
let loading = false; // 防止重复
const DOUBLE_PRESS_DELAY = 300; // 毫秒

// 双击快捷键Ctrl检测
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Control" ||
    event.code === "ControlLeft" ||
    event.code === "ControlRight"
  ) {
    const currentTime = Date.now();
    if (currentTime - lastCtrlPressTime < DOUBLE_PRESS_DELAY) {
      showSelectedText();
      event.preventDefault();
    }
    lastCtrlPressTime = currentTime;
  }
});

// 触发翻译
async function showSelectedText() {
  if (loading) return;
  let selectedText = window.getSelection().toString();
  if (selectedText) {
    loading = true;
    // 创建弹窗
    const popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.maxWidth = "800px";
    popup.style.overflowY = "hidden";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.backgroundColor = "white";
    popup.style.border = "1px solid #ccc";
    popup.style.padding = "10px 20px 15px";
    popup.style.borderRadius = "5px";
    popup.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    popup.style.textAlign = "left";
    popup.style.zIndex = "999999";
    document.body.appendChild(popup);

    // 添加项目地址
    const linkElement = document.createElement("a");
    linkElement.href = "https://github.com/laoxiu001/chorme-translator-crx";
    linkElement.target = "_blank";
    linkElement.innerHTML = "项目地址";
    linkElement.style.marginRight = "20px";
    linkElement.style.fontSize = "12px";
    linkElement.style.lineHeight = "20px";
    linkElement.style.color = "#999";
    linkElement.style.textDecoration = "none";
    popup.appendChild(linkElement);

    // 添加翻译耗时弹窗
    const timeConsumedElement = document.createElement("a");
    timeConsumedElement.style.color = "#4571fb";
    timeConsumedElement.style.fontSize = "12px";
    timeConsumedElement.style.lineHeight = "20px";
    timeConsumedElement.style.textDecoration = "none";
    timeConsumedElement.style.marginBottom = "10px";
    popup.appendChild(timeConsumedElement);

    // 创建翻译div
    const textElement = document.createElement("div");
    textElement.style.marginTop = "10px";
    textElement.style.color = "#000"; // 兼容暗黑模式
    textElement.style.maxHeight = "500px";
    textElement.style.overflowY = "auto";
    textElement.style.fontSize = "16px";
    textElement.style.whiteSpace = "pre-wrap";
    textElement.innerHTML = "翻译中...";
    popup.appendChild(textElement);

    // 检测翻译前语言
    let detectedLanguage = "";
    try {
      const detector = await LanguageDetector.create();
      const results = await detector.detect(selectedText);
      detectedLanguage = results.length ? results[0].detectedLanguage : "en";
    } catch (error) {
      loading = false;
    }

    const startTime = Date.now(); // 计算翻译耗时
    const translator = await Translator.create({
      sourceLanguage: detectedLanguage,
      targetLanguage: detectedLanguage === "zh" ? "en" : "zh",
    });

    let abortController = new AbortController(); // 用于存储AbortController实例
    // 开始翻译
    try {
      for await (const text of selectedText.split("\n")) {
        if (textElement.innerHTML === "翻译中...") textElement.innerHTML = "";
        const stream = translator.translateStreaming(text, {
          signal: abortController.signal,
        });
        for await (const chunk of stream) {
          textElement.innerHTML += chunk;
          // console.log("chunk", chunk);
        }
        textElement.innerHTML += "\n";
      }
    } catch (error) {
      loading = false;
    }

    // 点击空白区域关闭弹框
    const clickHandler = document.addEventListener("click", (event) => {
      if (
        event.target !== popup &&
        event.target !== textElement &&
        event.target !== timeConsumedElement
      ) {
        loading = false;
        abortController.abort();
        if (document.body.contains(popup)) document.body.removeChild(popup);
        document.removeEventListener("click", clickHandler); // 卸载监听
      }
    });

    const timeConsumed = Date.now() - startTime;
    timeConsumedElement.innerHTML = `翻译耗时：${timeConsumed}ms`;
    loading = false;
  }
}
