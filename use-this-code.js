
(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const ids = new Set();

  function collectIds() {
    document.querySelectorAll('a[href*="/images/"]').forEach(a => {
      const match = a.href.match(/\/images\/(\d+)/);
      if (match) ids.add(match[1]);
    });
  }

  const scrollables = [...document.querySelectorAll("*")].filter(el =>
    el.scrollHeight > el.clientHeight + 200 &&
    /(auto|scroll)/.test(getComputedStyle(el).overflowY)
  );

  const scroller = scrollables.sort(
    (a, b) => b.scrollHeight - a.scrollHeight
  )[0] || document.scrollingElement;

  const isWindow = scroller === document.scrollingElement;

  console.log("Starting faster infinite scroll...");

  let unchanged = 0;
  let previousCount = 0;

  while (unchanged < 12) {
    collectIds();

    if (ids.size > previousCount) {
      console.log(`Found ${ids.size} images`);
      previousCount = ids.size;
      unchanged = 0;
    } else {
      unchanged++;
    }

    if (isWindow) {
      window.scrollBy(0, Math.floor(window.innerHeight * 0.85));
    } else {
      scroller.scrollTop += Math.floor(scroller.clientHeight * 0.85);
    }

    await sleep(900);
  }

  collectIds();
  const idList = [...ids];

  console.log(`Found ${idList.length} images. Downloading prompts...`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < idList.length; i++) {
    const id = idList[i];

    try {
      const response = await fetch(`/images/${id}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      const candidates = [...doc.querySelectorAll(
        'div[data-line-clamp="true"]'
      )];

      candidates.sort((a, b) =>
        b.innerText.length - a.innerText.length
      );

      const prompt = candidates[0]?.innerText?.trim();
      if (!prompt) throw new Error("Prompt not found");

      const blob = new Blob([prompt], {
        type: "text/plain;charset=utf-8"
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${id}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(url), 10000);

      success++;
      console.log(`[${i + 1}/${idList.length}] Saved ${id}.txt`);

    } catch (err) {
      failed++;
      console.warn(`Failed ${id}:`, err);
    }

    await sleep(500);
  }

  console.log("========== FINISHED ==========");
  console.log("Images found:", idList.length);
  console.log("Prompts saved:", success);
  console.log("Failed:", failed);
})();
