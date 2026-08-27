// 注意要安装@actions/github依赖
import { context, getOctokit } from "@actions/github";
// 在容器中可以通过env环境变量来获取参数
const octokit = getOctokit(process.env.GITHUB_TOKEN);

const updateRelease = async () => {
  const repo = {
    owner: context.repo.owner,
    repo: context.repo.repo,
  };
  const tag = process.env.GITHUB_REF_NAME;

  const releases = await octokit.paginate(octokit.rest.repos.listReleases, {
    ...repo,
    per_page: 100,
  });
  const currentRelease = releases.find(
    (release) => release.tag_name === tag,
  );

  if (!currentRelease) {
    throw new Error(`release ${tag} was not found`);
  }
  const latestAsset = currentRelease.assets.find(
    (item) => item.name === "latest.json",
  );

  if (!latestAsset) {
    throw new Error(`latest.json was not found in release ${tag}`);
  }

  const { data: latestJson } = await octokit.request(
    "GET /repos/{owner}/{repo}/releases/assets/{asset_id}",
    {
      ...repo,
      asset_id: latestAsset.id,
      headers: {
        accept: "application/octet-stream",
      },
    },
  );

  let release;
  try {
    ({ data: release } = await octokit.rest.repos.getReleaseByTag({
      ...repo,
      tag: "updater",
    }));
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }

    ({ data: release } = await octokit.rest.repos.createRelease({
      ...repo,
      tag_name: "updater",
      name: "Updater metadata",
      body: "Metadata used by the in-app updater.",
    }));
  }

  // 删除旧的的文件
  const deletePromises = release.assets
    .filter((item) => item.name === "latest.json")
    .map(async (item) => {
      await octokit.rest.repos.deleteReleaseAsset({
        ...repo,
        asset_id: item.id,
      });
    });

  await Promise.all(deletePromises);

  await octokit.rest.repos.uploadReleaseAsset({
    ...repo,
    release_id: release.id,
    name: "latest.json",
    data: latestJson,
    headers: {
      "content-type": "application/json",
    },
  });
};

await updateRelease();
