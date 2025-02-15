if (window.hasLinkedExtensionRun) {
  console.log("Content script already injected.");
} else {
  window.hasLinkedExtensionRun = true;
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "receiveBlob") {
      const { buffer, mimeType, name } = message;
      console.log(
        "Rockzhang receivedBlob with buffer size ",
        buffer.length,
        " mimeType ",
        mimeType
      );
      if (Array.isArray(buffer)) {
        const arrayBuffer = new Uint8Array(buffer).buffer; // Reconstruct the ArrayBuffer
        console.log(
          "Reconstructed ArrayBuffer byteLength:",
          arrayBuffer.byteLength
        );

        // Reconstruct Blob
        const blob = new Blob([arrayBuffer], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);

        // Trigger download
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "RockZhang_CoverLetter_" + name + ".pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);

        sendResponse({
          success: true,
          message: "Blob processed and file downloaded!",
        });
      } else {
        console.error("Rockzhang Invalid buffer format received.");
        sendResponse({ success: false, error: "Invalid buffer format." });
      }

      return true; // Allow async response
    }
  });

  createUI();
  // 你的脚本逻辑在这里运行
  console.log("Rockzhang Content script successfully injected.");
}

async function commitInfo(templateNo) {
  let hostName = document.location.hostname;
  if (hostName.indexOf("seek.co") !== -1) {
    commitInfoSeek(templateNo);
  } else if (hostName.indexOf("linkedin.com") !== -1) {
    await commitInfoLinkedIn(templateNo);
  }
}

async function commitInfoSeek(templateNo) {
  const companyName = document.querySelector(
    '[data-automation="advertiser-name"]'
  );

  let positionName = document.querySelector(
    '[data-automation="job-detail-title"]'
  );

  let cityName = document.querySelector(
    '[data-automation="job-detail-location"]'
  );

  let jobDesc = document.querySelector('[data-automation="jobAdDetails"]');

  let hireManager = document.querySelector(
    "#main > div > div.scaffold-layout__list-detail-inner.scaffold-layout__list-detail-inner--grow > div.scaffold-layout__detail.overflow-x-hidden.jobs-search__job-details > div > div.jobs-search__job-details--container > div > div:nth-child(1) > div > div:nth-child(2) > div > div > div > div.hirer-card__hirer-information > a > span > span:nth-child(1) > strong"
  );
  hireManager = hireManager ? hireManager.innerText : "Hiring Manager";

  console.log(
    "Rockzhang We get companyName " +
      companyName.innerText +
      " posistion name " +
      positionName.innerText +
      " city name " +
      cityName.innerText +
      " hiring manager " +
      hireManager
  );

  const data = {
    company: companyName.innerText,
    position: positionName.innerText,
    manager: hireManager,
    city: cityName.innerText,
    templateNo: templateNo,
    jobDesc: jobDesc.innerText,
  };

  chrome.runtime.sendMessage(
    { action: "sendData", payload: data },
    (response) => {
      console.log("Background script response:", response);
    }
  );
  console.log("We run start to commit  message");
}

// Add an event listener for keypress
// 查找所有按钮并为每个按钮添加点击事件监听器
async function commitInfoLinkedIn(templateNo) {
  let companyName = document.querySelector(
    ".job-details-jobs-unified-top-card__company-name"
  );

  let positionName = document.querySelector(
    ".job-details-jobs-unified-top-card__job-title"
  );

  let cityName = document.querySelector(
    ".job-details-jobs-unified-top-card__primary-description-container"
  );

  cityName = cityName.querySelectorAll("span")[0];

  let hireManager = document.querySelector(
    ".hirer-card__hirer-information > a"
  );

  hireManager = hireManager ? hireManager.innerText.trim() : "Hiring Manager";

  let jobDesc = document.querySelector("#job-details");

  console.log(
    "Rockzhang We get companyName " +
      companyName.innerText +
      " posistion name " +
      positionName.innerText +
      " city name " +
      cityName.innerText +
      " hiring manager " +
      hireManager
  );

  const data = {
    company: companyName.innerText,
    position: positionName.innerText,
    manager: hireManager,
    city: cityName.innerText,
    templateNo: templateNo,
    jobDesc: jobDesc.innerText,
  };

  chrome.runtime.sendMessage(
    { action: "sendData", payload: data },
    (response) => {
      console.log("Background script response:", response);
    }
  );
  console.log("We run start to commit  message");
}

// const observer1 = new MutationObserver(() => {
//   let container = document.querySelector("#LinkedinHelper");
//   if (!container) {
//     createUI();
//     console.log("ROCK UI created.");
//   }
// });

// // 开始监听页面的 DOM 变化
// observer1.observe(document.body, { childList: true, subtree: true });

function createUI() {
  let container = document.querySelector("#LinkedinHelper");
  if (container) {
    console.log("UI already exists, skipping creation.");
    return;
  }

  const menus = ["C/C++", "Full Stack", "Android(Java)"];

  const divContainer = document.createElement("div");

  divContainer.id = "LinkedinHelper";
  divContainer.style.position = "fixed"; // 固定定位
  divContainer.style.right = "1.5vh"; // 距离页面右侧 20px
  divContainer.style.top = "50%"; // 距离页面顶部 50%
  divContainer.style.transform = "translateY(-50%)"; // 垂直居中调整
  divContainer.style.backgroundColor = "#AAAAAA33"; // 按钮背景颜色
  divContainer.style.color = "white"; // 按钮文字颜色
  divContainer.style.padding = "10px 20px"; // 按钮内边距
  divContainer.style.borderRadius = "5px"; // 圆角效果
  divContainer.style.zIndex = "1000"; // 确保按钮浮动在页面内容上方
  divContainer.style.display = "flex";
  divContainer.style.flexDirection = "column";
  divContainer.style.gap = "10px"; // 每个按钮之间的间距

  // 创建关闭按钮
  const closeButton = document.createElement("div");
  closeButton.innerText = "X"; // 设置关闭图标
  closeButton.style.position = "absolute"; // 绝对定位
  closeButton.style.top = "0px"; // 距离顶部 10px
  closeButton.style.right = "0px"; // 距离右边 10px
  closeButton.style.transform = "translate(50%, -50%)"; // 垂直居中调整
  closeButton.style.width = "2.0vh"; // 宽度
  closeButton.style.height = "2.0vh"; // 高度
  closeButton.style.padding = "2px"; // 高度
  closeButton.style.fontSize = "0.8rem";
  closeButton.style.borderRadius = "50%"; // 圆形
  closeButton.style.backgroundColor = "#ff4d4f"; // 红色背景
  closeButton.style.color = "white"; // 文字颜色
  closeButton.style.display = "flex"; // 使内容居中
  closeButton.style.justifyContent = "center"; // 水平居中
  closeButton.style.alignItems = "center"; // 垂直居中
  closeButton.style.cursor = "pointer"; // 鼠标悬停时显示手型
  closeButton.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)"; // 按钮阴影

  // 添加鼠标悬停效果
  closeButton.addEventListener("mouseover", () => {
    closeButton.style.backgroundColor = "#ff7875"; // 悬停时背景变浅
  });
  closeButton.addEventListener("mouseout", () => {
    closeButton.style.backgroundColor = "#ff4d4f"; // 恢复原始背景颜色
  });

  // 为关闭按钮添加点击事件
  closeButton.addEventListener("click", () => {
    //divContainer.remove(); // 点击时移除主 div
    let container = document.querySelector("#LinkedinHelper");
    if (container) {
      window.hasLinkedExtensionRun = false;
      container.remove();
    }
  });

  divContainer.appendChild(closeButton);
  menus.forEach((value, index) => {
    const button = document.createElement("div");

    // 设置按钮样式
    button.style.backgroundColor = "#007bff"; // 按钮背景颜色
    button.style.color = "white"; // 按钮文字颜色
    button.style.padding = "10px 20px"; // 按钮内边距
    button.style.borderRadius = "5px"; // 圆角效果
    button.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.2)"; // 按钮阴影
    button.style.cursor = "pointer"; // 鼠标悬停时显示手型

    // 设置按钮文本
    button.innerText = value;
    // 添加鼠标悬停效果
    button.addEventListener("mouseover", () => {
      button.style.backgroundColor = "#0056b3"; // 悬停时背景变深
    });

    button.addEventListener("mouseout", () => {
      button.style.backgroundColor = "#007bff"; // 恢复原始背景颜色
    });

    button.addEventListener("click", async () => {
      await commitInfo(index + 1);
      //alert("Menu " + value + " is clicked.");
    });

    divContainer.appendChild(button);
  });

  document.body.appendChild(divContainer);
}

// createUI();
// const observeDOM = (selector, callback) => {
//   const observer = new MutationObserver(() => {
//     const element = document.querySelector(selector);
//     if (element) {
//       callback(element);
//       observer.disconnect(); // 找到元素后停止观察
//     }
//   });

//   observer.observe(document.body, { childList: true, subtree: true });
// };

// console.warn("We are running in content.js");
// // 监听 LinkedIn 页面中的目标元素
// observeDOM(
//   "#main > div > div.scaffold-layout__list-detail-inner.scaffold-layout__list-detail-inner--grow > div.scaffold-layout__detail.overflow-x-hidden.jobs-search__job-details > div > div.jobs-search__job-details--container > div > div:nth-child(1) > div > div:nth-child(1) > div > div.relative.job-details-jobs-unified-top-card__container--two-pane > div > div.display-flex.align-items-center > div.display-flex.align-items-center.flex-1 > div > a",
//   (element) => {
//     console.log("Company Name:", element.innerText);
//   }
// );
