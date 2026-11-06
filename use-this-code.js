
(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const ids = new Set();

  function collectIds() {
    document.querySelectorAll('a[href*="/images/"]').forEach(a => {
      const match = a.href.match(/\/images\/(\d+)/);
      if (match) ids.add(match[1]);
    });
  }

  // Find the page's scrolling container
  const scrollables = [...document.querySelectorAll("*")].filter(el =>
    el.scrollHeight > el.clientHeight + 200 &&
    /(auto|scroll)/.test(getComputedStyle(el).overflowY)
  );

  const scroller = scrollables.sort(
    (a, b) => b.scrollHeight - a.scrollHeight
  )[0] || document.scrollingElement;

  console.log("Scrolling container:", scroller);

  // Keep scrolling until no new images appear
  let unchanged = 0;
  let previousCount = 0;

  console.log("Loading collection images...");

  while (unchanged < 15) {
    collectIds();

    if (ids.size > previousCount) {
      previousCount = ids.size;
      unchanged = 0;
      console.log("Images found:", ids.size);
    } else {
      unchanged++;
    }

    if (scroller === document.scrollingElement) {
      window.scrollTo(0, document.body.scrollHeight);
    } else {
      scroller.scrollTop = scroller.scrollHeight;
    }

    await sleep(1800);
  }

  collectIds();

  const idList = [...ids];
  console.log(`Found ${idList.length} images. Starting downloads...`);

  // Download each prompt separately
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
      console.warn(`[${i + 1}/${idList.length}] Failed ${id}:`, err);
    }

    // Give Chrome time to process each download
    await sleep(800);
  }

  console.log("========== FINISHED ==========");
  console.log("Images found:", idList.length);
  console.log("Prompts saved:", success);
  console.log("Failed:", failed);
})();
