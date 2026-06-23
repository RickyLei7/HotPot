module.exports = {
  ci: {
    collect: {
      staticDistDir: "./public",
      url: ["/", "/menu/", "/about/", "/faq/", "/contact/", "/restaurant-info/"],
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--headless=new --no-sandbox",
      },
    },
    assert: {
      assertions: {
        "categories:accessibility": ["warn", { minScore: 0.85 }],
        "categories:best-practices": ["warn", { minScore: 0.85 }],
        "categories:performance": ["warn", { minScore: 0.75 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "uses-http2": "off",
        "uses-long-cache-ttl": "off",
        "uses-text-compression": "off",
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./reports/lighthouse",
      reportFilenamePattern: "%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%",
    },
  },
};
