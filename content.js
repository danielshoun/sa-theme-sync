(() => {
  const DARK_CSS_URL = "https://i.somethingawful.com/css/dark.css?83";
  const INJECTED_ID = "sa-auto-darkcss";
  const TWITTER_META_NAME = "twitter:widgets:theme";

  function ensureHeadReady(cb) {
    if (document.head) return cb();

    const obs = new MutationObserver(() => {
      if (document.head) {
        obs.disconnect();
        cb();
      }
    });

    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  function findDarkLink() {
    return (
      document.getElementById(INJECTED_ID) ||
      document.querySelector('link[rel="stylesheet"][href*="/css/dark.css"]')
    );
  }

  function setTwitterWidgetsTheme(isDark) {
    let meta = document.querySelector(`meta[name="${TWITTER_META_NAME}"]`);

    if (isDark) {
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", TWITTER_META_NAME);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", "dark");
    } else {
      if (meta) meta.remove();
    }
  }

  function insertAfterForumsCss(linkEl) {
    const forumsCss = document.querySelector(
      'link[rel="stylesheet"][href*="i.somethingawful.com/css/forums.css"]'
    );

    if (forumsCss && forumsCss.parentNode) {
      forumsCss.insertAdjacentElement("afterend", linkEl);
    } else {
      document.head.appendChild(linkEl);
    }
  }

  function applyTheme(isDark) {
    ensureHeadReady(() => {
      const existing = findDarkLink();

      if (isDark) {
        if (!existing) {
          const link = document.createElement("link");
          link.id = INJECTED_ID;
          link.rel = "stylesheet";
          link.type = "text/css";
          link.href = DARK_CSS_URL;

          insertAfterForumsCss(link);
        } else {
          if (existing.id === INJECTED_ID) {
            existing.href = DARK_CSS_URL;
          }
        }

        setTwitterWidgetsTheme(true);
      } else {
        if (existing) existing.remove();
        setTwitterWidgetsTheme(false);
      }
    });
  }

  const mql = window.matchMedia("(prefers-color-scheme: dark)");

  function handleChange() {
    applyTheme(Boolean(mql.matches));
  }

  handleChange();
  mql.addEventListener("change", handleChange);

  ensureHeadReady(() => {
    const headObs = new MutationObserver(() => handleChange());
    headObs.observe(document.head, { childList: true, subtree: true });
  });
})();