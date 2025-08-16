// 检测当前浏览器版本是否支持翻译
isSupportTrans();
// 监听用户剪贴板，字数不超过100，直接翻译
listenClipboard();

// 点击翻译用户输入文本
$("#translateInput").click(function () {
  const result = document.getElementById("inputOrigin");
  createTranslator(result.value);
});
// 输入框回车自动翻译
$("#inputOrigin").keydown(function (event) {
  if (event.key === "Enter") {
    const result = document.getElementById("inputOrigin");
    createTranslator(result.value);
    event.preventDefault();
  }
});

// 点击复制文本
$("#oneClickCopy").click(function () {
  const result = document.getElementById("inputResult");
  navigator.clipboard.writeText(result.value);
  const btn = document.getElementById("oneClickCopy");
  const prevText = btn.innerHTML;
  btn.innerHTML = "复制成功！";
  setTimeout(() => {
    btn.innerHTML = prevText;
  }, 1000);
});

// 监听用户剪贴板，字数不超过100，直接翻译
async function listenClipboard() {
  try {
    const input = document.createElement("textarea");
    document.body.appendChild(input);
    input.focus();
    document.execCommand("paste");
    const text = input.value;
    input.remove();
    if (text.length <= 100) {
      const inputOrigin = document.getElementById("inputOrigin");
      inputOrigin.value = text;
      createTranslator(text);
    }
  } catch (err) {
    console.log("获取剪贴板内容失败:", err);
  }
}

// 创建并运行翻译器
async function createTranslator(str) {
  if (!str) return;
  try {
    // 检测翻译前语言
    const detector = await LanguageDetector.create();
    const results = await detector.detect(str);
    const detectedLanguage = results.length
      ? results[0].detectedLanguage
      : "en";

    const inputResult = document.getElementById("inputResult");
    inputResult.value = "";
    const translator = await Translator.create({
      sourceLanguage: detectedLanguage,
      targetLanguage: detectedLanguage === "zh" ? "en" : "zh",
    });
    const stream = translator.translateStreaming(str);
    for await (const chunk of stream) {
      inputResult.value += chunk;
    }
  } catch (error) {
    alert(`翻译失败：${error}`);
  }
}

// 判断兼容性
function isSupportTrans() {
  if (!("Translator" in self)) {
    return alert("当前浏览器版本不支持翻译");
  }
}
