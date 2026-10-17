// Fetches metadata for the explorer's projects and writes src/content/githubData.json
// Run daily by .github/workflows/refresh-github-data.yml, safe to run locally too
import { readFile, stat, writeFile } from "node:fs/promises";

const config = JSON.parse(
  await readFile("src/content/explorerConfig.json", "utf8"),
);
const outPath = "src/content/githubData.json";

const previous = await readFile(outPath, "utf8")
  .then(JSON.parse)
  .catch(() => ({ repos: {}, files: {} }));

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "personal-website-refresh",
  ...(process.env.GITHUB_TOKEN && {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }),
};

const get = async (path) => {
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) throw new Error(`${path} responded ${response.status}`);
  return response.json();
};

const repos = { ...previous.repos };
for (const { repo } of config.projects) {
  try {
    const data = await get(`/repos/${repo}`);
    const readme = await get(`/repos/${repo}/readme`).catch(() => null);
    repos[repo] = {
      description: data.description,
      language: data.language,
      pushedAt: data.pushed_at,
      sizeKb: data.size,
      stars: data.stargazers_count,
      url: data.html_url,
      defaultBranch: data.default_branch,
      readmeBytes: readme?.size ?? null,
      readme: readme
        ? Buffer.from(readme.content, "base64").toString("utf8")
        : null,
    };
  } catch (error) {
    // keeps the last known values so one failed request never blanks a project
    console.warn(`kept previous data for ${repo}: ${error.message}`);
  }
}

const imageNames = [
  ...config.projects.flatMap((project) => project.screenshots),
  ...config.pictures,
];
const files = {};
for (const name of imageNames) {
  files[name] = (await stat(`public/images/${name}`)).size;
}

const next = { repos, files };
// only the data is compared so an unchanged day produces no commit
const unchanged =
  JSON.stringify({ repos: previous.repos, files: previous.files }) ===
  JSON.stringify(next);

if (unchanged) {
  console.log("no changes");
} else {
  await writeFile(
    outPath,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), ...next },
      null,
      2,
    ) + "\n",
  );
  console.log(`wrote ${outPath}`);
}
